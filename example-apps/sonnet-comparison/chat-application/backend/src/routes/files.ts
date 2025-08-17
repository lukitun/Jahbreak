import express from 'express';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { File } from '../models/File';
import { Group } from '../models/Group';
import { Message } from '../models/Message';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// Upload file
router.post('/upload', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.body;
  const userId = req.user!.id;

  if (!groupId) {
    return res.status(400).json({ message: 'Group ID is required' });
  }

  if (!req.files || !req.files.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const uploadedFile = req.files.file as UploadedFile;

  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (uploadedFile.size > maxSize) {
    return res.status(413).json({ message: 'File size exceeds 100MB limit' });
  }

  // Check if user is member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    // Generate unique filename
    const fileExtension = path.extname(uploadedFile.name);
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save file
    await uploadedFile.mv(filePath);

    // Save file info to database
    const file = new File({
      originalName: uploadedFile.name,
      filename: uniqueFilename,
      path: filePath,
      mimetype: uploadedFile.mimetype,
      size: uploadedFile.size,
      uploadedBy: userId,
      group: groupId
    });

    await file.save();
    await file.populate('uploadedBy', 'username avatar');

    // Create message for file share
    let messageType = 'file';
    if (uploadedFile.mimetype.startsWith('image/')) {
      messageType = 'image';
    } else if (uploadedFile.mimetype.startsWith('video/')) {
      messageType = 'video';
    }

    const message = new Message({
      content: `Shared a file: ${uploadedFile.name}`,
      sender: userId,
      group: groupId,
      messageType,
      fileUrl: `/api/files/${file._id}/download`,
      fileName: uploadedFile.name,
      fileSize: uploadedFile.size
    });

    await message.save();
    await message.populate('sender', 'username avatar');

    res.status(201).json({
      message: 'File uploaded successfully',
      file: {
        ...file.toObject(),
        url: `/api/files/${file._id}/download`
      },
      messageData: message
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'File upload failed' });
  }
}));

// Download file
router.get('/:fileId/download', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await File.findById(fileId);
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Check if user is member of the group
  const group = await Group.findById(file.group);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // Check if file exists
    await fs.access(file.path);

    // Increment download count
    await file.incrementDownload();

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Length', file.size.toString());

    // Send file
    res.sendFile(path.resolve(file.path));
  } catch (error) {
    console.error('File download error:', error);
    res.status(404).json({ message: 'File not found on disk' });
  }
}));

// Get file info
router.get('/:fileId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await File.findById(fileId).populate('uploadedBy', 'username avatar');
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Check if user is member of the group
  const group = await Group.findById(file.group);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    file: {
      ...file.toObject(),
      url: `/api/files/${file._id}/download`
    }
  });
}));

// Get files for a group
router.get('/group/:groupId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { groupId } = req.params;
  const { page = 1, limit = 20 } = req.query;
  const userId = req.user!.id;

  // Check if user is member of the group
  const group = await Group.findById(groupId);
  if (!group) {
    return res.status(404).json({ message: 'Group not found' });
  }

  if (!group.members.includes(userId as any)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const files = await (File as any).findByGroup(
    groupId,
    parseInt(page as string),
    parseInt(limit as string)
  );

  const filesWithUrls = files.map((file: any) => ({
    ...file.toObject(),
    url: `/api/files/${file._id}/download`
  }));

  res.json({
    files: filesWithUrls,
    pagination: {
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: files.length === parseInt(limit as string)
    }
  });
}));

// Delete file
router.delete('/:fileId', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.params;
  const userId = req.user!.id;

  const file = await File.findById(fileId);
  if (!file) {
    return res.status(404).json({ message: 'File not found' });
  }

  // Check if user uploaded the file or is group admin
  const group = await Group.findById(file.group);
  const isUploader = file.uploadedBy.toString() === userId;
  const isAdmin = group && group.admins.includes(userId as any);

  if (!isUploader && !isAdmin) {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    // Delete file from disk
    await fs.unlink(file.path);
  } catch (error) {
    console.error('Error deleting file from disk:', error);
    // Continue with database deletion even if file deletion fails
  }

  // Delete file from database
  await File.findByIdAndDelete(fileId);

  res.json({ message: 'File deleted successfully' });
}));

// Get file statistics for a group
router.get('/group/:groupId/stats', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
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

  const stats = await (File as any).getGroupStats(groupId);

  res.json({
    stats: stats.length > 0 ? stats[0] : {
      totalFiles: 0,
      totalSize: 0,
      totalDownloads: 0,
      fileTypes: {}
    }
  });
}));

// Search files
router.get('/search/:query', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { query } = req.params;
  const { groupId, page = 1, limit = 20 } = req.query;
  const userId = req.user!.id;

  if (!query || query.length < 2) {
    return res.status(400).json({ message: 'Search query must be at least 2 characters' });
  }

  let searchFilter: any = {
    originalName: { $regex: query, $options: 'i' }
  };

  if (groupId) {
    // Search in specific group
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

  const files = await File.find(searchFilter)
    .populate('uploadedBy', 'username avatar')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit as string));

  const filesWithUrls = files.map(file => ({
    ...file.toObject(),
    url: `/api/files/${file._id}/download`
  }));

  res.json({
    files: filesWithUrls,
    pagination: {
      currentPage: parseInt(page as string),
      limit: parseInt(limit as string),
      hasMore: files.length === parseInt(limit as string)
    }
  });
}));

export default router;