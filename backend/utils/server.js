const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server: wsServer } = require('socket.io');

const app = express();
app.use(express.json());
const io = new wsServer({
    cors: {
      origin: 'http://127.0.0.1:5173',
        credentials : true
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
