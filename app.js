// Backend server

const express = require('express');
const app = express();
const path = require('path');

// Socket Setup
const http = require('http');
const socketio = require('socket.io');
const server = http.createServer(app);
const io = socketio(server);

// Set EJS as the view engine
app.set("view engine", "ejs");

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", function (socket) {
    console.log("New Client Connected");
    socket.on("send-location", function (data) {
        io.emit("recv-location", { id: socket.id, ...data });
    });

    socket.on("disconnect",function(){
        console.log("Client Disconnected");
        io.emit("user-disconnected",socket.id);
    });
});

app.get("/", function (req, res) {
    res.render("index");
});

const port = process.env.PORT || 3000;
server.listen(port, () => { // Change app.listen to server.listen
    console.log(`Server running on port ${port}`);
});
