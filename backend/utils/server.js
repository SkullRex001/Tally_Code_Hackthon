const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server: wsServer } = require('socket.io');

const app = express();
const io = new wsServer({
    cors: {
        origin: '*',
    }
});

const startServer = (port) => {
    app.use(cors());

    const server = http.createServer(app);

    io.attach(server);

    server.listen(port, () => {
        console.log('Server on');
    });

}


module.exports = { app, io ,startServer}
