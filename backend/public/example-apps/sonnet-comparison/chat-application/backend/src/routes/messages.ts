import express from 'express';
import { Message } from '../models/Message';
import { Group } from '../models/Group';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import CryptoJS from 'crypto-js';

const router = express.Router();

// Get messages for a group
router.get('/group/:groupId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const userId = req.user!.id;

  // Check if user is member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const messages = await (Message as any).findByGroup(
    groupId,
    parseInt(page as string),
    parseInt(limit as string)
  );

  // Decrypt messages if they are encrypted
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
        console.error('Decryption error:', error);
        return {
          ...message.toObject(),
          content: '[Encrypted message - decryption failed]'
        };
      }
    }
    return message.toObject();
  });

  res.json({
    messages: decryptedMessages.reverse(),
    pagination: {
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: messages.length === parseInt(limit as string)
    }
  });
}));

// Send a message
router.post('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { content, groupId, messageType = 'text', isEncrypted = false } = req.body;
  const userId = req.user!.id;

  if (!content || !groupId) {
    return res.status(400).json({ message: 'Content and group ID are required' });
  }

  // Check if user is member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  let messageContent = content;
  let encryptionKey = '';

  // Encrypt message if requested
  if (isEncrypted) {
    encryptionKey = CryptoJS.lib.WordArray.random(256/8).toString();
    messageContent = CryptoJS.AES.encrypt(content, encryptionKey).toString();
  }

  const message = new Message({
    content: messageContent,
    sender: userId,
    group: groupId,
    messageType,
    isEncrypted,
    encryptionKey
  });

  await message.save();
  await message.populate('sender', 'username avatar');

  // Update group's updatedAt timestamp
  group.updatedAt = new Date();
  await group.save();

  // Return decrypted content for the response
  const responseMessage = {
    ...message.toObject(),
    content: isEncrypted ? content : messageContent
  };

  res.status(201).json({
    message: 'Message sent successfully',
    data: responseMessage
  });
}));

// Edit a message
router.put('/:messageId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user owns the message
  if (message.sender.toString() !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Check if message was sent within edit window (e.g., 5 minutes)
  const editWindow = 5 * 60 * 1000; // 5 minutes
  const now = new Date();
  const messageAge = now.getTime() - message.createdAt.getTime();

  if (messageAge > editWindow) {
    return res.status(400).json({ message: 'Message edit window expired' });
  }

  let messageContent = content;

  // Re-encrypt if original was encrypted
  if (message.isEncrypted && message.encryptionKey) {
    messageContent = CryptoJS.AES.encrypt(content, message.encryptionKey).toString();
  }

  message.content = messageContent;
  message.editedAt = new Date();
  await message.save();

  res.json({
    message: 'Message updated successfully',
    data: {
      ...message.toObject(),
      content: content // Return original content
    }
  });
}));

// Delete a message
router.delete('/:messageId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const userId = req.user!.id;

  const message = await Message.findById(messageId);
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  // Check if user owns the message or is group admin
  const group = await Group.findById(message.group);
  const isOwner = message.sender.toString() === userId;
  const isAdmin = group && group.admins.includes(userId as any);

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await message.softDelete();

  res.json({ message: 'Message deleted successfully' });
}));

// Mark message as read
router.post('/:messageId/read', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { messageId } = req.params;
  const userId = req.user!.id;

  const message = await (Message as any).markAsRead(messageId, userId);
  
  if (!message) {
    return res.status(404).json({ message: 'Message not found' });
  }

  res.json({ message: 'Message marked as read' });
}));

// Get unread message count for a group
router.get('/group/:groupId/unread', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const userId = req.user!.id;

  // Check if user is member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const unreadCount = await (Message as any).getUnreadCount(groupId, userId);

  res.json({ unreadCount });
}));

// Search messages
router.get('/search', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { query, groupId, page = 1, limit = 20 } = req.query;
  const userId = req.user!.id;

  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  let searchFilter: any = {
    $text: { $search: query as string },
    deletedAt: { $exists: false }
  };

  if (groupId) {
    // Check if user is member of the specific group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (!group.members.includes(userId as any)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    searchFilter.group = groupId;
  } else {
    // Search in all groups user is member of
    const userGroups = await Group.find({ members: userId }).select('_id');
    const groupIds = userGroups.map(group => group._id);
    searchFilter.group = { $in: groupIds };
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const messages = await Message.find(searchFilter)
    .populate('sender', 'username avatar')
    .populate('group', 'name')
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string));

  res.json({
    messages,
    pagination: {
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: messages.length === parseInt(limit as string)
    }
  });
}));

export default router;