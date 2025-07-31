const chokidar = require('chokidar');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { verifyToken } = require('@clerk/backend');
const { createPtyProcess } = require('./shell-process');


function setupSocket(io) {
  io.use(async (socket, next) => {
    const { token } = socket.handshake.auth;

    if (!token) {
      console.log("❌ No token received");
      return next(new Error("Authentication token missing"));
    }

    try {
      const payload = await verifyToken(token, {
        issuer: "https://infinite-pangolin-83.clerk.accounts.dev",
        authorizedParties: ["http://127.0.0.1:5173"],
      });

      socket.userId = payload.sub;
       

      // ✅ Create folder if it doesn't exist
      const userDir = path.join(__dirname, '../User', socket.userId);
      if (!fsSync.existsSync(userDir)) {
        fsSync.mkdirSync(userDir, { recursive: true });
      }

      console.log("✅ Token verified, user:", payload.sub);
      next();
    } catch (err) {
      console.error("❌ JWT verification failed:", err.message);
      next(new Error("Unauthorized WebSocket"));
    }
  });

  io.on('connection', (socket) => {

    const ptyProcess = createPtyProcess(socket.userId);


    console.log('Client connected:', socket.id);

    const userDir = path.join(__dirname, '../User', socket.userId);
    console.log(userDir);

    // ✅ Watch this user's folder only
    const watcher = chokidar.watch(userDir).on('all', (event, filePath) => {
      const relativePath = path.relative(userDir, filePath);
      io.to(socket.id).emit('file:refresh', relativePath);
    });

    ptyProcess.onData(data => {
      io.to(socket.id).emit('terminal:data', data);
    });

    socket.on('terminal:write', (data) => {
      ptyProcess.write(data);
    });

    socket.on('file:change', async ({ path: relPath, content }) => {
      const fullPath = path.join(userDir, relPath);
      await fs.writeFile(fullPath, content);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      watcher.close();
    });
  });
}

module.exports = { setupSocket };
