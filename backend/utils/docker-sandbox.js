const Docker = require("dockerode");
const path = require("path");

const docker = new Docker();

const sandbox = async (name, imageName, userDir) => {
    let volume;

    // 🔹 Check or create Docker volume
    try {
        const volumes = await docker.listVolumes();
        const existingVolume = volumes.Volumes.find(v => v.Name === name);

        if (!existingVolume) {
            volume = await docker.createVolume({ Name: name });
            console.log("📦 Docker volume created:", name);
        } else {
            console.log("📦 Volume already exists:", name);
        }
    } catch (err) {
        console.error("❌ Volume error:", err);
        return null;
    }

    // 🔹 Check if container already exists
    let container;
    try {
        const containers = await docker.listContainers({ all: true });
        const existing = containers.find(c =>
            c.Names.includes("/" + name) // Docker prepends '/' to container names
        );

        if (existing) {
            container = docker.getContainer(existing.Id);

            // Try starting if not running
            if (existing.State !== "running") {
                try {
                    await container.start();
                    console.log("🚀 Existing container started:", existing.Id);
                } catch (startErr) {
                    if (startErr.statusCode === 304) {
                        console.log("⚠️ Container already running (304):", existing.Id);
                    } else {
                        console.error("❌ Failed to start container:", startErr.message);
                        return null;
                    }
                }
            } else {
                console.log("🟢 Container already running:", existing.Id);
            }

            return container;
        }
    } catch (err) {
        console.error("❌ Error checking existing containers:", err.message);
        return null;
    }

    // 🔹 Create new container if not found
    try {
        container = await docker.createContainer({
            Image: imageName,
            name,
            Tty: true,
            Cmd: ["/bin/bash"],
            WorkingDir: "/home/sandboxuser",
            HostConfig: {
                Mounts: [
                    {
                        Target: "/home/sandboxuser",
                        Source: path.resolve(userDir),
                        Type: "bind",
                    },
                ],
                NetworkMode: "bridge",
                AutoRemove: false,
                Memory: 256 * 1024 * 1024, // 256 MB
                CpuShares: 256,
            },
            User: `${process.getuid()}:${process.getgid()}`

        });

        await container.start();
        console.log("🚀 New container started:", container.id);
        return container;
    } catch (err) {
        console.error("❌ Failed to create/start container:", err.message);
        return null;
    }
};

module.exports = { sandbox };
