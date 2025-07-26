const os = require('os');
const pty = require('node-pty');
const path = require('path');
const fs = require('fs');


const cwdPath = path.resolve(__dirname, '../User');

if (!fs.existsSync(cwdPath)) {
  fs.mkdirSync(cwdPath, { recursive: true });
}

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

//console.log('Init working directory:', cwdPath);

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: cwdPath,
  env: process.env
});

module.exports = { ptyProcess };
