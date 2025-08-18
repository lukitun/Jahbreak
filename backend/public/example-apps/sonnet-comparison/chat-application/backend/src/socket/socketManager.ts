import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types';
import { setUserOnline, setUserOffline } from '../config/redis';
import { setupGroupChatHandlers } from './groupChat';
import { setupVideoCallHandlers } from './videoCall';
import { setupFileHandlers } from './fileHandlers';
import { setupTypingHandlers } from './typing';

export const setupSocketIO = (io: Server): void => {
  io.on('connection', async (socket: AuthenticatedSocket) => {
    const user = socket.user;
    console.log(`User connected: ${user.username} (${user.id})`);

    // Set user online in Redis
    await setUserOnline(user.id, socket.id);

    // Join user to their personal room
    socket.join(`user:${user.id}`);

    // Setup handlers
    setupGroupChatHandlers(socket, io);
    setupVideoCallHandlers(socket, io);
    setupFileHandlers(socket, io);
    setupTypingHandlers(socket, io);

    // Handle user presence updates
    socket.on('presence:update', async (data: { status: 'online' | 'away' | 'busy' }) => {
      try {
        await setUserOnline(user.id, socket.id);
        
        // Broadcast presence update to all user's groups
        const userGroups = await getUserGroups(user.id);
        userGroups.forEach(groupId => {
          socket.to(`group:${groupId}`).emit('presence:updated', {
            userId: user.id,
            status: data.status,
            lastSeen: new Date()
          });
        });
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    // Handle joining groups
    socket.on('group:join', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;
        
        // Verify user is member of the group (would need to check with database)
        // For now, assuming verification is done on client side
        
        socket.join(`group:${groupId}`);
        
        // Notify others in the group
        socket.to(`group:${groupId}`).emit('user:joined', {
          userId: user.id,
          username: user.username,
          joinedAt: new Date()
        });
        
        console.log(`User ${user.username} joined group ${groupId}`);
      } catch (error) {
        console.error('Error joining group:', error);
        socket.emit('error', { message: 'Failed to join group' });
      }
    });

    // Handle leaving groups
    socket.on('group:leave', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;
        
        socket.leave(`group:${groupId}`);
        
        // Notify others in the group
        socket.to(`group:${groupId}`).emit('user:left', {
          userId: user.id,
          username: user.username,
          leftAt: new Date()
        });
        
        console.log(`User ${user.username} left group ${groupId}`);
      } catch (error) {
        console.error('Error leaving group:', error);
      }
    });

    // Handle getting online users
    socket.on('users:get_online', async (data: { groupId: string }) => {
      try {
        const { groupId } = data;
        const onlineUsers = await getOnlineUsersInGroup(io, groupId);
        socket.emit('users:online', { groupId, users: onlineUsers });
      } catch (error) {
        console.error('Error getting online users:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${user.username} (${user.id})`);
      
      try {
        // Set user offline in Redis
        await setUserOffline(user.id);
        
        // Broadcast offline status to all user's groups
        const userGroups = await getUserGroups(user.id);
        userGroups.forEach(groupId => {
          socket.to(`group:${groupId}`).emit('presence:updated', {
            userId: user.id,
            status: 'offline',
            lastSeen: new Date()
          });
        });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

// Helper function to get user's groups
async function getUserGroups(userId: string): Promise<string[]> {
  // This would typically query the database for user's groups
  // For now, returning empty array - would need to implement with actual Group model
  try {
    const { Group } = await import('../models/Group');
    const groups = await Group.find({ members: userId }).select('_id');
    return groups.map(group => group._id.toString());
  } catch (error) {
    console.error('Error getting user groups:', error);
    return [];
  }
}

// Helper function to get online users in a group
async function getOnlineUsersInGroup(io: Server, groupId: string): Promise<any[]> {
  try {
    const sockets = await io.in(`group:${groupId}`).fetchSockets();
    const onlineUsers = sockets.map((socket: any) => ({
      id: socket.user.id,
      username: socket.user.username,
      socketId: socket.id
    }));
    
    // Remove duplicates (same user with multiple connections)
    const uniqueUsers = onlineUsers.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );
    
    return uniqueUsers;
  } catch (error) {
    console.error('Error getting online users:', error);
    return [];
  }
}

// Utility function to broadcast to a group
export const broadcastToGroup = (
  io: Server,
  groupId: string,
  event: string,
  data: any,
  excludeSocket?: string
): void => {
  if (excludeSocket) {
    io.to(`group:${groupId}`).except(excludeSocket).emit(event, data);
  } else {
    io.to(`group:${groupId}`).emit(event, data);
  }
};

// Utility function to broadcast to a user
export const broadcastToUser = (
  io: Server,
  userId: string,
  event: string,
  data: any
): void => {
  io.to(`user:${userId}`).emit(event, data);
};