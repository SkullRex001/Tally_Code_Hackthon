const chokidar = require('chokidar');
const fs = require('fs/promises');
const {clerkClient}  = require("@clerk/clerk-sdk-node");


function setupSocket(io, ptyProcess) {

    // Socket.IO auth middleware
  // io.use(async (socket, next) => {
  //   const { token } = socket.handshake.auth;
  //   if (!token) {
  //     const err = new Error("Authentication token missing");
  //     err.data = { reason: "No token" };
  //     return next(err);
  //   }

  //   try {
  //     const session = await clerkClient.sessions.verifySession(token);
  //     socket.userId = session.userId;
  //     next();
  //   } catch (error) {
  //     console.error("Socket authentication failed:", error);
  //     const err = new Error("Unauthorized WebSocket");
  //     err.data = { reason: "Invalid token" };
  //     next(err);
  //   }
  // });


//////////////////////////////////////////////////
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
