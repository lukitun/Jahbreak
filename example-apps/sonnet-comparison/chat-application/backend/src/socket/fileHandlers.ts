import { Server } from 'socket.io';
import { AuthenticatedSocket } from '../types';
import { Group } from '../models/Group';
import { broadcastToGroup } from './socketManager';

export const setupFileHandlers = (socket: AuthenticatedSocket, io: Server): void => {
  const user = socket.user;

  // File upload progress
  socket.on('file:upload_start', async (data: {
    groupId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => {
    try {
      const { groupId, fileName, fileSize, fileType } = data;

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

      // Check file size limit (100MB)
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (fileSize > maxSize) {
        socket.emit('error', { message: 'File size exceeds 100MB limit' });
        return;
      }

      // Notify group members about upload start
      broadcastToGroup(io, groupId, 'file:upload_started', {
        uploadId: `${user.id}_${Date.now()}`,
        fileName,
        fileSize,
        fileType,
        uploader: {
          id: user.id,
          username: user.username
        }
      }, socket.id);

      socket.emit('file:upload_ready', { 
        message: 'Ready to receive file',
        uploadId: `${user.id}_${Date.now()}`
      });

    } catch (error) {
      console.error('Error starting file upload:', error);
      socket.emit('error', { message: 'Failed to start file upload' });
    }
  });

  // File upload progress update
  socket.on('file:upload_progress', (data: {
    uploadId: string;
    groupId: string;
    progress: number;
  }) => {
    try {
      const { uploadId, groupId, progress } = data;

      // Broadcast progress to group members
      broadcastToGroup(io, groupId, 'file:upload_progress', {
        uploadId,
        progress,
        uploader: {
          id: user.id,
          username: user.username
        }
      }, socket.id);

    } catch (error) {
      console.error('Error updating file upload progress:', error);
    }
  });

  // File upload completed
  socket.on('file:upload_complete', async (data: {
    uploadId: string;
    groupId: string;
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }) => {
    try {
      const { uploadId, groupId, fileId, fileName, fileUrl, fileSize, fileType } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast file upload completion to group
      broadcastToGroup(io, groupId, 'file:upload_completed', {
        uploadId,
        fileId,
        fileName,
        fileUrl,
        fileSize,
        fileType,
        uploader: {
          id: user.id,
          username: user.username
        },
        uploadedAt: new Date()
      }, socket.id);

    } catch (error) {
      console.error('Error completing file upload:', error);
      socket.emit('error', { message: 'Failed to complete file upload' });
    }
  });

  // File upload failed
  socket.on('file:upload_failed', (data: {
    uploadId: string;
    groupId: string;
    error: string;
  }) => {
    try {
      const { uploadId, groupId, error } = data;

      // Notify group members about upload failure
      broadcastToGroup(io, groupId, 'file:upload_failed', {
        uploadId,
        error,
        uploader: {
          id: user.id,
          username: user.username
        }
      }, socket.id);

    } catch (error) {
      console.error('Error handling file upload failure:', error);
    }
  });

  // File download request
  socket.on('file:download_request', async (data: {
    fileId: string;
    groupId: string;
  }) => {
    try {
      const { fileId, groupId } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast download notification (optional, for analytics)
      broadcastToGroup(io, groupId, 'file:download_requested', {
        fileId,
        downloader: {
          id: user.id,
          username: user.username
        },
        requestedAt: new Date()
      }, socket.id);

      socket.emit('file:download_ready', { 
        fileId,
        downloadUrl: `/api/files/${fileId}/download`
      });

    } catch (error) {
      console.error('Error handling file download request:', error);
      socket.emit('error', { message: 'Failed to process download request' });
    }
  });

  // File share notification
  socket.on('file:share', async (data: {
    fileId: string;
    groupId: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }) => {
    try {
      const { fileId, groupId, fileName, fileSize, fileType } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast file share to group
      broadcastToGroup(io, groupId, 'file:shared', {
        fileId,
        fileName,
        fileSize,
        fileType,
        sharedBy: {
          id: user.id,
          username: user.username
        },
        sharedAt: new Date(),
        downloadUrl: `/api/files/${fileId}/download`
      }, socket.id);

    } catch (error) {
      console.error('Error sharing file:', error);
      socket.emit('error', { message: 'Failed to share file' });
    }
  });

  // File delete notification
  socket.on('file:delete', async (data: {
    fileId: string;
    groupId: string;
    fileName: string;
  }) => {
    try {
      const { fileId, groupId, fileName } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // Broadcast file deletion to group
      broadcastToGroup(io, groupId, 'file:deleted', {
        fileId,
        fileName,
        deletedBy: {
          id: user.id,
          username: user.username
        },
        deletedAt: new Date()
      }, socket.id);

    } catch (error) {
      console.error('Error deleting file:', error);
      socket.emit('error', { message: 'Failed to delete file' });
    }
  });

  // Get file list for group
  socket.on('files:get_list', async (data: {
    groupId: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      const { groupId, page = 1, limit = 20 } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.members.includes(user.id as any)) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      // This would typically fetch from database
      // For now, just acknowledging the request
      socket.emit('files:list', {
        groupId,
        files: [], // Would be populated from database
        pagination: {
          page,
          limit,
          hasMore: false
        }
      });

    } catch (error) {
      console.error('Error getting file list:', error);
      socket.emit('error', { message: 'Failed to get file list' });
    }
  });
};