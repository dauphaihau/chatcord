const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

const port = 1111;

const publicPathDirectory = path.join(__dirname, '../public');
app.use(express.static(publicPathDirectory))

const server = http.createServer(app);
const io = socketIo(server);

const count = 1;

// user connect
io.on('connection', (socket) => {
    console.log('new client connected');

    socket.emit('event', count)

    // user disconnect
    socket.on('disconnect', () => console.log('client left server'))
});

app.listen(port,  () => {
    console.log(`app listen on port http://localhost:${port}`);
});
