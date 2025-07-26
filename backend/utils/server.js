const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server: wsServer } = require('socket.io');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new wsServer({
  cors: {
    origin: '*',
  },
});

io.attach(server);

server.listen(8000, () => {
  console.log('Server on');
});

module.exports = {app , io}
