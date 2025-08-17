const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User, TaskList, TaskListMember } = require('../models');

const connectedUsers = new Map(); // userId -> socketId mapping

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Socket authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user || !user.isActive) {
        return next(new Error('Invalid or inactive user'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User ${socket.user.firstName} ${socket.user.lastName} connected`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Update user's last seen time
    await User.update(
      { lastSeenAt: new Date() },
      { where: { id: socket.userId } }
    );

    // Join user to their task list rooms
    try {
      const userTaskLists = await TaskList.findAll({
        include: [
          {
            model: User,
            as: 'members',
            where: { id: socket.userId },
            through: { attributes: [] },
          },
        ],
      });

      userTaskLists.forEach(taskList => {
        socket.join(`taskList:${taskList.id}`);
      });

      // Also join task lists created by user
      const createdTaskLists = await TaskList.findAll({
        where: { createdBy: socket.userId },
      });

      createdTaskLists.forEach(taskList => {
        socket.join(`taskList:${taskList.id}`);
      });

      console.log(`User ${socket.userId} joined ${userTaskLists.length + createdTaskLists.length} task list rooms`);
    } catch (error) {
      console.error('Error joining task list rooms:', error);
    }

    // Broadcast user online status
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      user: socket.user,
      timestamp: new Date(),
    });

    // Handle joining specific task list room
    socket.on('join:taskList', async (taskListId) => {
      try {
        // Verify user has access to this task list
        const taskList = await TaskList.findByPk(taskListId, {
          include: [
            {
              model: User,
              as: 'members',
              where: { id: socket.userId },
              required: false,
            },
          ],
        });

        if (taskList && (
          taskList.createdBy === socket.userId || 
          taskList.members.some(member => member.id === socket.userId)
        )) {
          socket.join(`taskList:${taskListId}`);
          console.log(`User ${socket.userId} joined task list ${taskListId}`);
          
          socket.emit('joined:taskList', { taskListId });
        } else {
          socket.emit('error', { message: 'Access denied to task list' });
        }
      } catch (error) {
        console.error('Error joining task list:', error);
        socket.emit('error', { message: 'Failed to join task list' });
      }
    });

    // Handle leaving task list room
    socket.on('leave:taskList', (taskListId) => {
      socket.leave(`taskList:${taskListId}`);
      console.log(`User ${socket.userId} left task list ${taskListId}`);
      socket.emit('left:taskList', { taskListId });
    });

    // Handle typing indicators for task updates
    socket.on('typing:start', (data) => {
      socket.to(`taskList:${data.taskListId}`).emit('typing:start', {
        userId: socket.userId,
        user: socket.user,
        taskId: data.taskId,
        timestamp: new Date(),
      });
    });

    socket.on('typing:stop', (data) => {
      socket.to(`taskList:${data.taskListId}`).emit('typing:stop', {
        userId: socket.userId,
        taskId: data.taskId,
        timestamp: new Date(),
      });
    });

    // Handle user presence updates
    socket.on('presence:update', async (data) => {
      try {
        await User.update(
          { lastSeenAt: new Date() },
          { where: { id: socket.userId } }
        );

        socket.broadcast.emit('presence:updated', {
          userId: socket.userId,
          status: data.status || 'active',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    // Handle task focus events (who's viewing/editing what)
    socket.on('task:focus', (data) => {
      socket.to(`taskList:${data.taskListId}`).emit('task:focused', {
        userId: socket.userId,
        user: socket.user,
        taskId: data.taskId,
        timestamp: new Date(),
      });
    });

    socket.on('task:blur', (data) => {
      socket.to(`taskList:${data.taskListId}`).emit('task:blurred', {
        userId: socket.userId,
        taskId: data.taskId,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.firstName} ${socket.user.lastName} disconnected`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Update last seen time
      try {
        await User.update(
          { lastSeenAt: new Date() },
          { where: { id: socket.userId } }
        );
      } catch (error) {
        console.error('Error updating last seen on disconnect:', error);
      }

      // Broadcast user offline status
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error('Socket error for user', socket.userId, ':', error);
    });
  });

  // Middleware to attach io to requests
  const attachIO = (req, res, next) => {
    req.io = io;
    next();
  };

  return { io, attachIO, connectedUsers };
};

module.exports = { setupSocket };