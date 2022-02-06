const express = require("express");
const app = express();
const http = require("http");
const Filter = require('bad-words');
const server = http.createServer(app);
const {Server} = require("socket.io");
let io = new Server(server);
const path = require("path");
const {createMessages} = require("./utils/createMessages");
const {getUserList, removeUser, addUser, findUser} = require("./utils/users");

const port = 1111;

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

let count = 1;
const message = 'Hi';

// user connect
io.on("connection", (socket) => {
    // console.log("new client connected");

    // socket.on("send message from client to server", (messageText) => {
    //   io.emit("send message from server to client", messageText)
    // })


    socket.on("join room from client to server", ({room, username}) => {
        socket.join(room);

        socket.emit(
            "send message from server to client",
            createMessages(`welcome to ${room} room`, "Admin")
        );

        socket.broadcast.to(room).emit(
            "send message from server to client",
            createMessages(`${username} has joined the room`, "Admin")
        );

        // chat
        socket.on("send message from client to server", (messageText, callback) => {
            const filter = new Filter();
            if (filter.isProfane(messageText)) {
                return callback("message is invalid")
            }

            const id = socket.id;
            const user = findUser(id);
            io.to(room).emit(
                "send message from server to client",
                createMessages(messageText, user.username)
            );
            callback();
        });

        // share location
        socket.on(
            "share location from client to server",
            ({latitude, longitude}) => {
                const linkLocation = `https://www.google.com/maps?q=${latitude},${longitude}`;
                const id = socket.id;
                const user = findUser(id);
                io.to(room).emit(
                    "share location from server to client",
                    createMessages(linkLocation, user.username )
                );
            }
        );

        // user list
        const newUser = {
            id: socket.id,
            username,
            room
        };
        addUser(newUser);
        io.to(room).emit('send user list from server to client', getUserList(room));

        // user disconnect
        socket.on("disconnect", () => {
            removeUser(socket.id);
            io.to(room).emit('send user list from server to client', getUserList(room));
            console.log(`${username} has left this room`);
        });
    });

    // socket.emit("hi", message);

    // socket.on("increase count", () => {
    //     count++;
    //     socket.emit('send counted', count)
    // });

});

server.listen(port, () => console.log(`app listen on port http://localhost:${port}`));
