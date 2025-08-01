const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();


async function upsertUserFromPayload(payload) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });

    if (!existingUser) {
      const newUser = await prisma.user.create({
        data: {
          id: payload.sub, // matching Clerk user ID
          firstName: (payload.full_name || '').split(' ')[0] || 'First',
          lastName: (payload.full_name || '').split(' ')[1] || 'Last',
          email: payload.email,
          profileUrl: payload.avatar || '',
          dateJoined: new Date(payload.registration_date * 1000),
        },
      });

      console.log("✅ User created:", newUser.id);
      return newUser;
    } else {
      console.log("ℹ️ User already exists:", existingUser.id);
      return existingUser;
    }
  } catch (err) {
    console.error("❌ Failed to upsert user:", err);
    throw err;
  }
}

async function createProjectForUser({ userId, projectId, projectName }) {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Create the project
  const project = await prisma.project.create({
    data: {
      projectId,
      projectName,
      projectTotalSize: 10000, // default total size
      projectCurrentSize: 0,
      createdBy: userId,
    }
  });

  return project;
}

async function getProjectsForUser({ userId }) {

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }


  const projects = await prisma.project.findMany({
    where: { createdBy: userId },
    select: {
      projectName: true,
      projectId: true
    }
  });

  return projects; 
}


module.exports = { upsertUserFromPayload , createProjectForUser , getProjectsForUser};
