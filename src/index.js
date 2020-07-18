const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const bad_words = require('bad-words');
const filter = new bad_words();
const { sendMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('./utils/userTracking');


const PORT = process.env.PORT || 3800;

const public = path.join(__dirname, 'public');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(public));


io.on('connection', (socket) => {


    socket.on('join', ({ username, room }, acknowledgement) => {

        const newUser = addUser({ id: socket.id, username, room });


        if (newUser.error) {
            return acknowledgement(newUser.error);
        }

        socket.join(newUser.room);
        // socket.emit('welcome', sendMessage("Welcome to the chat app"));
        socket.broadcast.to(newUser.room).emit('display_msg', sendMessage(`${newUser.username} joined the chat`));

        io.to(newUser.room).emit('userslist', {
            room: newUser.room,
            users: getUserInRoom({ room: newUser.room })
        });

        acknowledgement();
    });

    socket.on('incoming_msg', (msg, acknowledgement) => {

        const user = getUser({ id: socket.id });

        if (user.error) {
            return acknowledgement(user.error);
        }

        if (filter.isProfane(msg)) {
            acknowledgement("Profanity Detected, message not sent");
        } else if (msg.length > 0) {
            io.to(user.room).emit('display_msg', sendMessage(user.username, msg));
            acknowledgement();
        }

    });

    socket.on('sendLocation', (coordinates, acknowledgement) => {
        const user = getUser({ id: socket.id });

        if (user.error) {
            return acknowledgement(user.error);
        }

        io.to(user.room).emit('locationLink', sendMessage(user.username, "https://google.com/maps?q=" + coordinates.lat + "," + coordinates.lang));
        acknowledgement();
    });

    socket.on('disconnect', () => {
        const user = removeUser({ id: socket.id });

        io.to(user.room).emit('userslist', {
            room: user.room,
            users: getUserInRoom({ room: user.room })
        });

        io.to(user.room).emit('display_msg', sendMessage(`${user.username} left the chat`));
    });
});


server.listen(PORT, () => {
    console.log("Server running on port 3800");
});