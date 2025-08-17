import { Server } from 'socket.io';
import { AuthenticatedSocket, TypingData } from '../types';
import { Group } from '../models/Group';
import { broadcastToGroup } from './socketManager';

// Track typing users per group
const typingUsers = new Map<string, Set<string>>(); // groupId -> Set of userIds
const typingTimeouts = new Map<string, NodeJS.Timeout>(); // userId_groupId -> timeout

export const setupTypingHandlers = (socket: AuthenticatedSocket, io: Server): void => {
  const user = socket.user;

  // User started typing
  socket.on('typing:start', async (data: { groupId: string }) => {
    try {
      const { groupId } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const typingKey = `${user.id}_${groupId}`;

      // Clear existing timeout for this user/group combo
      const existingTimeout = typingTimeouts.get(typingKey);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Add user to typing set for this group
      if (!typingUsers.has(groupId)) {
        typingUsers.set(groupId, new Set());
      }
      
      const groupTypingUsers = typingUsers.get(groupId)!;
      const wasNotTyping = !groupTypingUsers.has(user.id);
      
      groupTypingUsers.add(user.id);

      // Only broadcast if user wasn't already typing
      if (wasNotTyping) {
        const typingData: TypingData = {
          userId: user.id,
          username: user.username,
          groupId,
          isTyping: true
        };

        broadcastToGroup(io, groupId, 'typing:started', typingData, socket.id);
      }

      // Set timeout to automatically stop typing after 3 seconds
      const timeout = setTimeout(() => {
        stopTyping(user.id, groupId, io);
      }, 3000);

      typingTimeouts.set(typingKey, timeout);

    } catch (error) {
      console.error('Error handling typing start:', error);
    }
  });

  // User stopped typing
  socket.on('typing:stop', async (data: { groupId: string }) => {
    try {
      const { groupId } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        return;
      }

      stopTyping(user.id, groupId, io);

    } catch (error) {
      console.error('Error handling typing stop:', error);
    }
  });

  // Get currently typing users for a group
  socket.on('typing:get_users', async (data: { groupId: string }) => {
    try {
      const { groupId } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const groupTypingUsers = typingUsers.get(groupId) || new Set();
      const typingUsersList = Array.from(groupTypingUsers)
        .filter(userId => userId !== user.id); // Exclude current user

      socket.emit('typing:users', {
        groupId,
        typingUsers: typingUsersList
      });

    } catch (error) {
      console.error('Error getting typing users:', error);
    }
  });

  // Handle disconnect - clean up typing status
  socket.on('disconnect', async () => {
    try {
      // Clean up typing status for all groups
      for (const [groupId, groupTypingUsers] of typingUsers.entries()) {
        if (groupTypingUsers.has(user.id)) {
          stopTyping(user.id, groupId, io);
        }
      }

      // Clean up timeouts
      for (const [key, timeout] of typingTimeouts.entries()) {
        if (key.startsWith(`${user.id}_`)) {
          clearTimeout(timeout);
          typingTimeouts.delete(key);
        }
      }

    } catch (error) {
      console.error('Error cleaning up typing status on disconnect:', error);
    }
  });
};

// Helper function to stop typing
function stopTyping(userId: string, groupId: string, io: Server): void {
  const typingKey = `${userId}_${groupId}`;

  // Clear timeout
  const timeout = typingTimeouts.get(typingKey);
  if (timeout) {
    clearTimeout(timeout);
    typingTimeouts.delete(typingKey);
  }

  // Remove user from typing set
  const groupTypingUsers = typingUsers.get(groupId);
  if (groupTypingUsers && groupTypingUsers.has(userId)) {
    groupTypingUsers.delete(userId);

    // Clean up empty sets
    if (groupTypingUsers.size === 0) {
      typingUsers.delete(groupId);
    }

    // Get username for broadcast (this would typically come from a cache or database)
    // For now, we'll broadcast with just the userId
    const typingData: TypingData = {
      userId,
      username: '', // Would need to fetch this
      groupId,
      isTyping: false
    };

    broadcastToGroup(io, groupId, 'typing:stopped', typingData);
  }
}

// Utility function to get typing users for a group
export function getTypingUsers(groupId: string): string[] {
  const groupTypingUsers = typingUsers.get(groupId);
  return groupTypingUsers ? Array.from(groupTypingUsers) : [];
}

// Utility function to check if a user is typing in a group
export function isUserTyping(userId: string, groupId: string): boolean {
  const groupTypingUsers = typingUsers.get(groupId);
  return groupTypingUsers ? groupTypingUsers.has(userId) : false;
}