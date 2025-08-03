const chokidar = require('chokidar');
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const { verifyToken } = require('@clerk/backend');
const { createPtyProcess } = require('./shell-process');
const { upsertUserFromPayload } = require("../db/user");
const Docker = require("dockerode");
const {sandbox} = require("./docker-sandbox");

const docker = new Docker();

function setupSocket(io) {
  io.use(async (socket, next) => {
    const { token, projectId, projectName } = socket.handshake.auth;

    if (!token) {
      console.log("❌ No token received");
      return next(new Error("Authentication token missing"));
    }

    if (!projectId || !projectName) {
      console.log("❌ Project details missing");
      return next(new Error("Project details missing"));
    }

    try {

      const payload = await verifyToken(token, {
        issuer: "https://infinite-pangolin-83.clerk.accounts.dev",
        authorizedParties: ["http://127.0.0.1:5173"],
      });

      await upsertUserFromPayload(payload);



      socket.userId = payload.sub;
      console.log(payload);

      const sanitize = (name) => name.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50);
      const folderName = `${sanitize(projectName)}-${projectId}`;

      const userDir = path.join(__dirname, '../User', socket.userId, folderName);
      socket.userDir = userDir;
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

  io.on('connection', async (socket) => {

    //if user is not is database save him
    const userDir = socket.userDir;
    const volumeName = path.basename(userDir);

    const imageNane = "sandbox-node";

    let container = await sandbox(volumeName , imageNane , userDir);

   
    //const ptyProcess = createPtyProcess(socket.userDir);
    const ptyProcess = createPtyProcess(socket.userDir , container);


    console.log('Client connected:', socket.id);


    console.log(userDir);

    //Bug: When I change file from termianl it does not apprear in text exitor until I send http requst again
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
