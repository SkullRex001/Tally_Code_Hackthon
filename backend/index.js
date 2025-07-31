const fs = require('fs/promises');
const { ptyProcess } = require('./utils/shell-process');
const { app, io, startServer } = require('./utils/server')
const { setupSocket } = require('./utils/socket')
const { generateExplorerTree, init } = require('./utils/file-methods')
const { clerkClient, requireAuth, getAuth } = require("@clerk/express")
const path = require('path');
require('dotenv').config()

const { verifyToken } = require("@clerk/backend");

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

    const token = authHeader.split(' ')[1];

    try {
        const payload = await verifyToken(token, {
            issuer: "https://infinite-pangolin-83.clerk.accounts.dev",
            authorizedParties: ["http://127.0.0.1:5173"], // 👈 same as socket
        });
        req.userId = payload.sub;
        next();
    } catch (err) {
        console.error("❌ JWT verification failed:", err.message);
        return res.status(401).json({ error: "Unauthorized" });
    }
}



startServer(8000);

setupSocket(io);



app.get('/health', (req, res) => {
    res.status(200).json({ message: "Everything is good🤗" })
})

app.get('/files', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const userDir = `./User/${userId}`;
    try {
        await fs.mkdir(userDir, { recursive: true });
        const fileTree = await generateExplorerTree(`./User/${userId}`)
        return res.json({ tree: fileTree });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load file tree" });
    }


})

app.get('/files/content', authMiddleware, async (req, res) => {

   try {
        const userId = req.userId;
        const pathParam = req.query.path;
        const sanitizedPath = pathParam.replace(/['"]/g, '');
        const userFilePath = `./User/${userId}${sanitizedPath}`;

        const content = await fs.readFile(userFilePath, 'utf-8');
        return res.json({ content });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to read file" });
    }
})

app.get('/run', authMiddleware, async (req, res) => {
    try {
        const userId = req.userId;
        const selectedFilePath = req.query.path;

        if (!selectedFilePath) {
            throw new Error("Path query parameter is missing");
        }

        // const fullPath = `./User/${userId}${selectedFilePath}`;
        const fullPath = path.join(__dirname, 'User', userId, selectedFilePath);
        const data = await init(fullPath);

        res.json({ data: data.stdout });
    } catch (error) {
        console.error(error);
        res.json({ data: String(error.stderr) });
    }
});
