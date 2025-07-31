const fs = require('fs/promises');
const { ptyProcess } = require('./utils/shell-process');
const { app, io, startServer } = require('./utils/server')
const { setupSocket } = require('./utils/socket')
const { generateExplorerTree, init } = require('./utils/file-methods')
const { clerkClient, requireAuth, getAuth } = require("@clerk/express")
require('dotenv').config()



startServer(8000);

setupSocket(io, ptyProcess);

app.get('/health', (req, res) => {
    res.status(200).json({ message: "Everything is good🤗" })
})

app.get('/files', requireAuth(), async (req, res) => {

    const fileTree = await generateExplorerTree('./User')
    return res.json({ tree: fileTree });

})

app.get('/files/content', requireAuth(), async (req, res) => {

    try {
        const path = req.query.path;
        const sanitizedPath = path.replace(/['"]/g, '');
        const content = await fs.readFile(`./User${sanitizedPath}`, 'utf-8')
        return res.json({ content })

    }
    catch (err) {
        res.json({
            message: "OOPS"
        })
        console.log(err)
    }

})

app.get('/run', requireAuth(), async (req, res) => {
    try {
        const selectedFilePath = req.query.path;
        if (!selectedFilePath) {
            throw new Error("Path query parameter is missing");
        }
        const data = await init(selectedFilePath);

        res.json({
            data: data.stdout
        });
    } catch (error) {
        console.log(error);

        res.json({
            data: String(error.stderr)
        });
    }
});
