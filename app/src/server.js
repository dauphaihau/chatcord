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

const publicPathDirectory = path.join(__dirname, "../public");
app.use(express.static(publicPathDirectory));

io.on("connection", (socket) => {

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
});

const port = process.env.PORT || 1111 ;
server.listen(port, () => console.log(`app listen on port http://localhost:${port}`));
