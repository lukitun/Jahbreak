import express from 'express';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { Message } from '../models/Message';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Get all groups for user
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id;

  const groups = await (Group as any).findByUser(userId);

  res.json({ groups });
}));

// Create a new group
router.post('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { name, description, isPrivate = false, maxMembers = 100 } = req.body;
  const userId = req.user!.id;

  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  if (maxMembers < 2 || maxMembers > 100) {
    return res.status(400).json({ message: 'Max members must be between 2 and 100' });
  }

  const group = new Group({
    name: name.trim(),
    description: description?.trim() || '',
    owner: userId,
    members: [userId],
    admins: [userId],
    isPrivate,
    maxMembers
  });

  await group.save();
  await group.populate('members', 'username avatar isOnline lastSeen');
  await group.populate('owner', 'username avatar');

  // Send welcome message
  const welcomeMessage = new Message({
    content: `Welcome to ${group.name}! 🎉`,
    sender: userId,
    group: group._id,
    messageType: 'system'
  });
  await welcomeMessage.save();

  res.status(201).json({
    message: 'Group created successfully',
    group
  });
}));

// Get group details
router.get('/:groupId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const userId = req.user!.id;

  const group = await Group.findById(groupId)
    .populate('members', 'username avatar isOnline lastSeen')
    .populate('owner', 'username avatar')
    .populate('admins', 'username avatar');

  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.some((member: any) => member._id.toString() === userId)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({ group });
}));

// Update group
router.put('/:groupId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { name, description, avatar, maxMembers } = req.body;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Check if user is admin
  if (!group.admins.includes(userId as any)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (name) group.name = name.trim();
  if (description !== undefined) group.description = description.trim();
  if (avatar !== undefined) group.avatar = avatar;
  if (maxMembers && maxMembers >= group.members.length && maxMembers <= 100) {
    group.maxMembers = maxMembers;
  }

  await group.save();
  await group.populate('members', 'username avatar isOnline lastSeen');
  await group.populate('owner', 'username avatar');

  res.json({
    message: 'Group updated successfully',
    group
  });
}));

// Join a group
router.post('/:groupId/join', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (group.isPrivate) {
    return res.status(403).json({ message: 'Cannot join private group without invitation' });
  }

  if (group.members.includes(userId as any)) {
    return res.status(400).json({ message: 'Already a member of this group' });
  }

  if (group.members.length >= group.maxMembers) {
    return res.status(400).json({ message: 'Group is full' });
  }

  group.members.push(userId as any);
  await group.save();

  // Send join message
  const user = await User.findById(userId);
  const joinMessage = new Message({
    content: `${user?.username} joined the group`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await joinMessage.save();

  res.json({ message: 'Joined group successfully' });
}));

// Leave a group
router.post('/:groupId/leave', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(400).json({ message: 'Not a member of this group' });
  }

  if (group.owner.toString() === userId) {
    return res.status(400).json({ message: 'Owner cannot leave group. Transfer ownership first.' });
  }

  // Remove from members and admins
  group.members = group.members.filter(id => id.toString() !== userId);
  group.admins = group.admins.filter(id => id.toString() !== userId);
  await group.save();

  // Send leave message
  const user = await User.findById(userId);
  const leaveMessage = new Message({
    content: `${user?.username} left the group`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await leaveMessage.save();

  res.json({ message: 'Left group successfully' });
}));

// Add member to group
router.post('/:groupId/members', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { userId: newMemberId } = req.body;
  const userId = req.user!.id;

  if (!newMemberId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Check if current user is admin
  if (!group.admins.includes(userId as any)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  // Check if new member exists
  const newMember = await User.findById(newMemberId);
  if (!newMember) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (group.members.includes(newMemberId)) {
    return res.status(400).json({ message: 'User is already a member' });
  }

  if (group.members.length >= group.maxMembers) {
    return res.status(400).json({ message: 'Group is full' });
  }

  group.members.push(newMemberId);
  await group.save();

  // Send add message
  const addMessage = new Message({
    content: `${newMember.username} was added to the group`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await addMessage.save();

  res.json({ message: 'Member added successfully' });
}));

// Remove member from group
router.delete('/:groupId/members/:memberId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId, memberId } = req.params;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Check if current user is admin
  if (!group.admins.includes(userId as any)) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  if (group.owner.toString() === memberId) {
    return res.status(400).json({ message: 'Cannot remove group owner' });
  }

  if (!group.members.includes(memberId as any)) {
    return res.status(400).json({ message: 'User is not a member' });
  }

  const memberToRemove = await User.findById(memberId);
  
  // Remove from members and admins
  group.members = group.members.filter(id => id.toString() !== memberId);
  group.admins = group.admins.filter(id => id.toString() !== memberId);
  await group.save();

  // Send removal message
  const removeMessage = new Message({
    content: `${memberToRemove?.username} was removed from the group`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await removeMessage.save();

  res.json({ message: 'Member removed successfully' });
}));

// Promote member to admin
router.post('/:groupId/admins', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { userId: targetUserId } = req.body;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Only owner can promote admins
  if (group.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Owner access required' });
  }

  if (!group.members.includes(targetUserId)) {
    return res.status(400).json({ message: 'User is not a member' });
  }

  if (group.admins.includes(targetUserId)) {
    return res.status(400).json({ message: 'User is already an admin' });
  }

  group.admins.push(targetUserId);
  await group.save();

  const targetUser = await User.findById(targetUserId);
  const promoteMessage = new Message({
    content: `${targetUser?.username} was promoted to admin`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await promoteMessage.save();

  res.json({ message: 'Member promoted to admin successfully' });
}));

// Transfer ownership
router.post('/:groupId/transfer-ownership', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { userId: newOwnerId } = req.body;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Only current owner can transfer ownership
  if (group.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Owner access required' });
  }

  if (!group.members.includes(newOwnerId)) {
    return res.status(400).json({ message: 'New owner must be a member' });
  }

  group.owner = newOwnerId;
  
  // Ensure new owner is admin
  if (!group.admins.includes(newOwnerId)) {
    group.admins.push(newOwnerId);
  }

  await group.save();

  const newOwner = await User.findById(newOwnerId);
  const transferMessage = new Message({
    content: `Ownership transferred to ${newOwner?.username}`,
    sender: userId,
    group: groupId,
    messageType: 'system'
  });
  await transferMessage.save();

  res.json({ message: 'Ownership transferred successfully' });
}));

// Delete group
router.delete('/:groupId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const userId = req.user!.id;

  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  // Only owner can delete group
  if (group.owner.toString() !== userId) {
    return res.status(403).json({ message: 'Owner access required' });
  }

  // Delete all messages in the group
  await Message.deleteMany({ group: groupId });

  // Delete the group
  await Group.findByIdAndDelete(groupId);

  res.json({ message: 'Group deleted successfully' });
}));

// Search groups
router.get('/search/:query', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { query } = req.params;
  const { page = 1, limit = 20 } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters' });
  }

  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  const groups = await Group.find({
    $and: [
      { isPrivate: false },
      {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ]
      }
    ]
  })
    .populate('owner', 'username avatar')
    .select('name description avatar members maxMembers createdAt')
    .skip(skip)
    .limit(parseInt(limit as string))
    .sort({ createdAt: -1 });

  res.json({
    groups: groups.map(group => ({
      ...group.toObject(),
      memberCount: group.members.length
    })),
    pagination: {
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: groups.length === parseInt(limit as string)
    }
  });
}));

export default router;