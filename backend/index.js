const fs = require('fs/promises');
const { ptyProcess } = require('./utils/shell-process');
const { app, io } = require('./utils/server')
const { setupSocket } = require('./utils/socket')
const { generateExplorerTree, init } = require('./utils/file-methods')


setupSocket(io, ptyProcess);

app.get('/health', (req, res) => {
    res.status(200).json({ message: "Everything is good🤗" })
})

app.get('/files', async (req, res) => {

    const fileTree = await generateExplorerTree('./User')
    return res.json({ tree: fileTree });

})

app.get('/files/content', async (req, res) => {

    try {
        const path = req.query.path;
        const sanitizedPath = path.replace(/['"]/g, '');

        console.log("PATH : ", path)
        const content = await fs.readFile(`./User${sanitizedPath}`, 'utf-8')
        console.log(content)
        return res.json({ content })

    }
    catch (err) {
        res.json({
            message: "OOPS"
        })
        console.log(err)
    }

})

app.get('/run', async (req, res) => {
    try {
        const cmdPath = req.query.path;
        if (!cmdPath) {
            throw new Error("Path query parameter is missing");
        }
        console.log(`Received path: ${cmdPath}`);
        const data = await init(cmdPath);
        console.log(data);

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
