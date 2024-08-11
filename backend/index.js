const http = require('http');
const express = require('express');
const pty = require('node-pty');
const fs = require('fs/promises');
const path = require('path');
const cors = require('cors')
const chokidar = require('chokidar');
const { exec } = require('child_process');
const os = require('os')


var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const {Server:wsServer} = require('socket.io');

console.log(process.env.INIT_CWD);

var ptyProcess = pty.spawn('bash', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: './User',
    env: process.env
  });
  

const app = express();


app.use(cors());

const server = http.createServer(app);

const io = new wsServer({
    cors : {
        origin : "*"
    }
});

io.attach(server);

chokidar.watch('./User').on('all', (event, path) => {
    io.emit('file:refresh' , path)
  });

ptyProcess.onData(data => {

    io.emit('terminal:data', data)
})

io.on('connection' , (socket)=>{
    console.log(socket.id);

    socket.on('terminal:write' , (data)=>{
        ptyProcess.write(data);
    })
    socket.on('file:change' , async ({path , content})=>{
        console.log(content)
        try{
            await fs.writeFile(`./User${path}` , content)

        }
        catch(err){
            console.log(JSON.stringify(err))
        }
       
    } )
})

io.on('disconnect' , ()=>{
    console.log("hoo")
})

app.get('/files' ,async (req , res)=>{

    const fileTree = await generateExplorerTree4('./User')
    return res.json({tree : fileTree});

})

app.get('/files/content' , async (req , res)=>{

    try{
        const path = req.query.path;
        const sanitizedPath = path.replace(/['"]/g, '');

    console.log("PATH : " , path)
    const content = await fs.readFile(`./User${sanitizedPath}` , 'utf-8')
    console.log(content)
    return res.json({content})

    }
    catch(err){
        res.json({
            message : "OOPS"
        })
        console.log(err)
    }
    
})

app.get('/run', async (req, res) => {
    try {
        const data = await init();
        console.log(data);

        res.json({
            success: true,
            data
        });
    } catch (error) {
        console.log(error);

        res.json({
            success: false,
            error
        });
    }
});

server.listen(8000 , ()=> console.log("Server on") )


// async function generateFileTree(directory) {
//     const tree = {};

//     async function buildTree(currentDir, currentTree) {
//         const files = await fs.readdir(currentDir, { withFileTypes: true });

//         for (const file of files) {
//             const filePath = path.join(currentDir, file.name);
//             if (file.isDirectory()) {
//                 currentTree[file.name] = {};
//                 await buildTree(filePath, currentTree[file.name]);
//             } else {
//                 currentTree[file.name] = null;
//             }
//         }
//     }

//     await buildTree(directory, tree);
//     return tree;
// }


// async function generateFolderTree3(directory) {
//     async function buildTree(currentDir) {
//         const files = await fs.readdir(currentDir, { withFileTypes: true });
//         const tree = [];

//         for (const file of files) {
//             const filePath = path.join(currentDir, file.name);
//             if (file.isDirectory()) {
//                 tree.push({
//                     name: file.name,
//                     children: await buildTree(filePath)
//                 });
//             } else {
//                 tree.push({
//                     name: file.name,
//                     children: null
//                 });
//             }
//         }

//         return tree;
//     }

//     return buildTree(directory);
// }

async function generateExplorerTree4(directory) {
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




const init = () => {
    return new Promise((resolve, reject) => {
        console.log("SCRIPT RUNNING");

        // Use path.resolve to get the absolute path
        const rootDir = path.resolve(__dirname, 'User');

        // Construct the command to execute
        const command = `cd ${rootDir} && node index.js`;

        // Execute the command
        const p = exec(command);

        console.log("Executing command:", command);

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
            console.log(`Process exited with code ${code}`);
            console.log('BUILD COMPLETE');
        });

        p.on('error', (err) => {
            reject(err);
            console.error('Failed to start subprocess:', err);
        });
    });
};