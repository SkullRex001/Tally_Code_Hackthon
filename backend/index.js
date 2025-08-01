const fs = require('fs/promises');
const { ptyProcess } = require('./utils/shell-process');
const { app, io, startServer } = require('./utils/server')
const { setupSocket } = require('./utils/socket')
const { generateExplorerTree, init } = require('./utils/file-methods')
const { clerkClient, requireAuth, getAuth } = require("@clerk/express")
const path = require('path');
const { createProjectForUser, getProjectsForUser , deleteProjectsForUser } = require('./db/user')
require('dotenv').config()

const { verifyToken } = require("@clerk/backend");

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing Authorization header" });

    const token = authHeader.split(' ')[1];

    try {
        const payload = await verifyToken(token, {
            issuer: "https://infinite-pangolin-83.clerk.accounts.dev",
            authorizedParties: ["http://127.0.0.1:5173"],
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

app.post('/files', authMiddleware, async (req, res) => {
    const userId = req.userId;
    const userDir = `./User/${userId}`;
    const { projectId, projectName } = req.body;
    console.log(projectId)
    console.log(projectName)

    const sanitize = (name) => name.replace(/[^a-zA-Z0-9-_]/g, "_").substring(0, 50);
    const folderName = `${sanitize(projectName)}-${projectId}`;
    const projectDir = `./User/${userId}/${folderName}`; // ✅ Project-specific folder

    try {
        await fs.mkdir(userDir, { recursive: true });
        const fileTree = await generateExplorerTree(projectDir)
        return res.json({ tree: fileTree });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to load file tree" });
    }


})

app.get('/files/content', authMiddleware, async (req, res) => {

    try {
        const userId = req.userId;
        const { path: relPath, projectId, projectName } = req.query;
        if (!relPath || !projectId || !projectName) {
            return res.status(400).json({ message: "Missing required query parameters" });
        }

        const sanitizedPath = relPath.replace(/['"]/g, '');
        const safeProjectFolder = `${projectName}-${projectId}`;
        const userFilePath = path.join(__dirname, 'User', userId, safeProjectFolder, sanitizedPath);

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
        const projectId = req.query.projectId;
        const projectName = req.query.projectName;

        if (!selectedFilePath || !projectId || !projectName) {
            return res.status(400).json({ message: "Missing path, projectId, or projectName in query" });
        }

        // const fullPath = `./User/${userId}${selectedFilePath}`;

        const sanitizedPath = selectedFilePath.replace(/['"]/g, '');
        const safeProjectFolder = `${projectName}-${projectId}`;
        const userFilePath = path.join(__dirname, 'User', userId, safeProjectFolder, sanitizedPath);
        const data = await init(userFilePath);

        res.json({ data: data.stdout });
    } catch (error) {
        console.error(error);
        res.json({ data: String(error.stderr) });
    }
});

app.post('/projects', async (req, res) => {
    const { user_id, newProjectId, newProjectName } = req.body;

    if (!user_id || !newProjectId || !newProjectName) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const project = await createProjectForUser({
            userId: user_id,
            projectId: newProjectId,
            projectName: newProjectName,
        });

        return res.status(201).json(project);
    } catch (error) {
        console.error("❌ Error in /projects:", error.message);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
});

app.get('/projects', async (req, res) => {
    const user_id = req.query.user_id;
    console.log(user_id);

    if (!user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        const project = await getProjectsForUser({ userId: user_id });

        return res.status(201).json(project);
    } catch (error) {
        console.error("❌ Error in /projects:", error.message);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
});


app.delete('/projects', async (req, res) => {
    const { user_id,
        deleteProjectId } = req.body;

    console.log(user_id);

    if (!user_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {

        const project = await deleteProjectsForUser({ userId: user_id  , deleteProjectId});

        return res.status(201).json(project);
    } catch (error) {
        console.error("❌ Error in /projects:", error.message);
        return res.status(500).json({ error: error.message || 'Server error' });
    }
});

