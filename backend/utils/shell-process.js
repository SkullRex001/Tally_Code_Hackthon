const os = require('os');
const pty = require('node-pty');
const path = require('path');
const fs = require('fs');

function createPtyProcess(userId) {
  const userDir = path.resolve(__dirname, `../User/${userId}`);

  // Ensure the user's folder exists

  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: userDir,
    env: process.env
  });

  return ptyProcess;
}

module.exports = { createPtyProcess };
