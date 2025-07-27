const chokidar = require('chokidar');
const fs = require('fs/promises');

function setupSocket(io, ptyProcess) {
  chokidar.watch('./User').on('all', (event, path) => {
    io.emit('file:refresh', path);
  });

  ptyProcess.onData(data => {
    io.emit('terminal:data', data);
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('terminal:write', (data) => {
      ptyProcess.write(data);
    });

    socket.on('file:change', async ({ path, content }) => {
      await fs.writeFile(`./User${path}`, content);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  io.on('disconnect', () => {
    console.log("hoo");
  });
}

module.exports = { setupSocket };
