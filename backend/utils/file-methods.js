const fs = require('fs/promises');
const path = require('path');
const { exec } = require('child_process');


//Building file Tree
async function generateExplorerTree(directory) {
    let idCounter = 1;

    async function buildTree(currentDir) {
        const files = await fs.readdir(currentDir, { withFileTypes: true });
        const tree = [];

        for (const file of files) {
            const filePath = path.join(currentDir, file.name);
            const node = {
                id: (idCounter++).toString(),
                name: file.name,
                isFolder: file.isDirectory(),
                items: file.isDirectory() ? await buildTree(filePath) : []
            };
            tree.push(node);
        }

        return tree;
    }

    return {
        id: (idCounter++).toString(),
        name: path.basename(directory),
        isFolder: true,
        items: await buildTree(directory)
    };
}


//run button
const init = (selectedFilePath) => {
    return new Promise((resolve, reject) => {

        if (!selectedFilePath) {
            reject(new Error("Path parameter is missing"));
            return;
        }

        const sanitizedPath = selectedFilePath.replace(/['"]/g, '');

        const rootDir = path.resolve(__dirname, '../User');

        const command = `cd ${rootDir} && node ${sanitizedPath}`;

        const p = exec(command);

        let stdoutData = '';
        let stderrData = '';

        p.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });

        p.stderr.on('data', (data) => {
            stderrData += data.toString();
        });

        p.on('close', (code) => {
            if (code === 0) {
                resolve({ stdout: stdoutData });
            } else {
                reject({ stderr: stderrData });
            }
        });

        p.on('error', (err) => {
            reject(err);
            console.error('Failed to start subprocess:', err);
        });
    });
};


module.exports = { generateExplorerTree, init };