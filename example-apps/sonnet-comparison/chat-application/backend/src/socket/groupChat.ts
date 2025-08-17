import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types';
import { Message } from '../models/Message';
import { Group } from '../models/Group';
import { broadcastToGroup } from './socketManager';
import CryptoJS from 'crypto-js';

export const setupGroupChatHandlers = (socket: AuthenticatedSocket, io: Server): void => {
  const user = socket.user;

  // Send message
  socket.on('message:send', async (data: {
    content: string;
    groupId: string;
    messageType?: 'text' | 'file' | 'image' | 'video';
    isEncrypted?: boolean;
    replyTo?: string;
  }) => {
    try {
      const { content, groupId, messageType = 'text', isEncrypted = false, replyTo } = data;

      if (!content || !groupId) {
        socket.emit('error', { message: 'Content and group ID are required' });
        return;
      }

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        socket.emit('error', { message: 'Group not found' });
        return;
      }

      if (!group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      let messageContent = content;
      let encryptionKey = '';

      // Encrypt message if requested
      if (isEncrypted) {
        encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
        messageContent = CryptoJS.AES.encrypt(content, encryptionKey).toString();
      }

      // Create message
      const message = new Message({
        content: messageContent,
        sender: user.id,
        group: groupId,
        messageType,
        isEncrypted,
        encryptionKey,
        replyTo
      });

      await message.save();
      await message.populate('sender', 'username avatar');

      // Update group's last activity
      group.updatedAt = new Date();
      await group.save();

      // Prepare message data for broadcast
      const messageData = {
        ...message.toObject(),
        content: isEncrypted ? content : messageContent // Send original content
      };

      // Broadcast to group members
      broadcastToGroup(io, groupId, 'message:new', messageData, socket.id);
      
      // Send confirmation to sender
      socket.emit('message:sent', { messageId: message._id, ...messageData });

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Edit message
  socket.on('message:edit', async (data: {
    messageId: string;
    content: string;
  }) => {
    try {
      const { messageId, content } = data;

      if (!content) {
        socket.emit('error', { message: 'Content is required' });
        return;
      }

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user owns the message
      if (message.sender.toString() !== user.id) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Check edit window (5 minutes)
      const editWindow = 5 * 60 * 1000;
      const messageAge = Date.now() - message.createdAt.getTime();
      if (messageAge > editWindow) {
        socket.emit('error', { message: 'Message edit window expired' });
        return;
      }

      let messageContent = content;

      // Re-encrypt if original was encrypted
      if (message.isEncrypted && message.encryptionKey) {
        messageContent = CryptoJS.AES.encrypt(content, message.encryptionKey).toString();
      }

      message.content = messageContent;
      message.editedAt = new Date();
      await message.save();

      const editData = {
        messageId,
        content,
        editedAt: message.editedAt
      };

      // Broadcast edit to group
      broadcastToGroup(io, message.group.toString(), 'message:edited', editData);

    } catch (error) {
      console.error('Error editing message:', error);
      socket.emit('error', { message: 'Failed to edit message' });
    }
  });

  // Delete message
  socket.on('message:delete', async (data: { messageId: string }) => {
    try {
      const { messageId } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Check if user owns the message or is group admin
      const group = await Group.findById(message.group);
      const isOwner = message.sender.toString() === user.id;
      const isAdmin = group && group.admins.includes(user.id as any);

      if (!isOwner && !isAdmin) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      await message.softDelete();

      // Broadcast deletion to group
      broadcastToGroup(io, message.group.toString(), 'message:deleted', {
        messageId,
        deletedAt: message.deletedAt
      });

    } catch (error) {
      console.error('Error deleting message:', error);
      socket.emit('error', { message: 'Failed to delete message' });
    }
  });

  // Mark messages as read
  socket.on('messages:mark_read', async (data: {
    groupId: string;
    messageIds: string[];
  }) => {
    try {
      const { groupId, messageIds } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Mark messages as read
      await Message.updateMany(
        {
          _id: { $in: messageIds },
          group: groupId,
          'readBy.user': { $ne: user.id }
        },
        {
          $addToSet: {
            readBy: {
              user: user.id,
              readAt: new Date()
            }
          }
        }
      );

      // Broadcast read receipts to group
      broadcastToGroup(io, groupId, 'messages:read', {
        userId: user.id,
        messageIds,
        readAt: new Date()
      }, socket.id);

    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // React to message
  socket.on('message:react', async (data: {
    messageId: string;
    emoji: string;
    action: 'add' | 'remove';
  }) => {
    try {
      const { messageId, emoji, action } = data;

      const message = await Message.findById(messageId);
      if (!message) {
        socket.emit('error', { message: 'Message not found' });
        return;
      }

      // Verify user is member of the group
      const group = await Group.findById(message.group);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      const reactionData = {
        messageId,
        userId: user.id,
        username: user.username,
        emoji,
        action,
        timestamp: new Date()
      };

      // Broadcast reaction to group
      broadcastToGroup(io, message.group.toString(), 'message:reaction', reactionData);

    } catch (error) {
      console.error('Error reacting to message:', error);
      socket.emit('error', { message: 'Failed to react to message' });
    }
  });

  // Get message history
  socket.on('messages:get_history', async (data: {
    groupId: string;
    page?: number;
    limit?: number;
    before?: string; // message ID
  }) => {
    try {
      const { groupId, page = 1, limit = 50, before } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      let query: any = {
        group: groupId,
        deletedAt: { $exists: false }
      };

      // If loading messages before a specific message
      if (before) {
        const beforeMessage = await Message.findById(before);
        if (beforeMessage) {
          query.createdAt = { $lt: beforeMessage.createdAt };
        }
      }

      const messages = await Message.find(query)
        .populate('sender', 'username avatar')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip((page - 1) * limit);

      // Decrypt messages
      const decryptedMessages = messages.map((message: any) => {
        if (message.isEncrypted && message.encryptionKey) {
          try {
            const decryptedContent = CryptoJS.AES.decrypt(
              message.content,
              message.encryptionKey
            ).toString(CryptoJS.enc.Utf8);
            
            return {
              ...message.toObject(),
              content: decryptedContent
            };
          } catch (error) {
            return {
              ...message.toObject(),
              content: '[Encrypted message - decryption failed]'
            };
          }
        }
        return message.toObject();
      });

      socket.emit('messages:history', {
        groupId,
        messages: decryptedMessages.reverse(),
        pagination: {
          page,
          limit,
          hasMore: messages.length === limit
        }
      });

    } catch (error) {
      console.error('Error getting message history:', error);
      socket.emit('error', { message: 'Failed to get message history' });
    }
  });
};