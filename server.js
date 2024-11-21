const express = require('express');/*import express*/
const app = express();
const http = require('http');/*http module import inbuilt in node*/
const path = require('path');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app); /*express ke server app pass hua hai*/
const io = new Server(server);

// app.use(express.static('build'));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

const userSocketMap = {};/*map is created, isme userid ar name store ho raha
agr server restart hoga to sab delete ho jayega*/
function getAllConnectedClients(roomId) {
    // Map
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
        (socketId) => {
            return {
                socketId,
                username: userSocketMap[socketId],
            };
        }
    );
}

io.on('connection', (socket) => { /*ye trigger ho jaati hai jaise hi socket connect hota hai server me*/
    console.log('socket connected', socket.id);

    socket.on(ACTIONS.JOIN, ({ roomId, username }) => {/*server pe listen karenge*/
        userSocketMap[socket.id] = username;
        socket.join(roomId);
        
        /*saare clients ko notify krna hoga ki new user joined
        uske liye sabka lists chaiye jo bhi abhi connected hai*/
        const clients = getAllConnectedClients(roomId);/*ye function wo list de dega*/
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit(ACTIONS.JOINED, {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });
    // ye server se jo emit kiya hai usko client pe listen karna hai
    socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
        socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
        io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
    });

    // listening for disconnecting
    socket.on('disconnecting', () => {
        const rooms = [...socket.rooms];/*map se array me convert.saare rooms uss user ki jo disconnect krna chah raha hai*/
        rooms.forEach((roomId) => {
            // jitne bhi socket rooms hai un sabko ye receive ho jayega ki ye socket room disconnect ho gya hai to uske 
            // accordingly sab apna UI update kr lega
            socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                socketId: socket.id,
                username: userSocketMap[socket.id],
            });
        });
        delete userSocketMap[socket.id];
        socket.leave();// method to exit from any room
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Listening on port ${PORT}`));
