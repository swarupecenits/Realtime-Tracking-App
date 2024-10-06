const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.set("view engine", "ejs");


app.use(express.static(path.join(__dirname, "public")));

let users = {};


io.on("connection", (socket) => {
    console.log("New Client Connected");

    
    socket.on("send-location", (data) => {
        users[socket.id] = { id: socket.id, ...data };
        io.emit("recv-location", { id: socket.id, ...data, users });
    });

    
    socket.on("disconnect", () => {
        delete users[socket.id];
        io.emit("user-disconnected", { id: socket.id, users });
        console.log("Client Disconnected");
    });
});


app.get("/", (req, res) => {
    res.render("index");
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
