import { Server } from 'socket.io';
import { AuthenticatedSocket, VideoCallData, PeerConnectionData } from '../types';
import { Group } from '../models/Group';
import { broadcastToGroup } from './socketManager';

// Store active video calls
const activeVideoCalls = new Map<string, VideoCallData>();
const userCallStatus = new Map<string, { callId: string; status: 'calling' | 'in_call' | 'busy' }>();

export const setupVideoCallHandlers = (socket: AuthenticatedSocket, io: Server): void => {
  const user = socket.user;

  // Initiate video call
  socket.on('video_call:initiate', async (data: {
    groupId: string;
    callType: 'audio' | 'video';
  }) => {
    try {
      const { groupId, callType } = data;

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

      // Check if user is already in a call
      if (userCallStatus.has(user.id)) {
        socket.emit('error', { message: 'Already in a call' });
        return;
      }

      // Check if there's already an active call in the group
      const existingCall = Array.from(activeVideoCalls.values())
        .find(call => call.groupId === groupId);

      if (existingCall) {
        // Join existing call if under participant limit
        if (existingCall.participants.length >= 10) {
          socket.emit('error', { message: 'Call is full (max 10 participants)' });
          return;
        }

        existingCall.participants.push(user.id);
        userCallStatus.set(user.id, { 
          callId: existingCall.callId, 
          status: 'in_call' 
        });

        // Notify existing participants
        broadcastToGroup(io, groupId, 'video_call:participant_joined', {
          callId: existingCall.callId,
          participant: {
            id: user.id,
            username: user.username
          },
          participants: existingCall.participants
        }, socket.id);

        // Send call info to the joining user
        socket.emit('video_call:joined', {
          callId: existingCall.callId,
          participants: existingCall.participants,
          isScreenSharing: existingCall.isScreenSharing
        });

      } else {
        // Create new call
        const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const videoCallData: VideoCallData = {
          callId,
          groupId,
          participants: [user.id],
          isScreenSharing: false,
          startedBy: user.id,
          startedAt: new Date()
        };

        activeVideoCalls.set(callId, videoCallData);
        userCallStatus.set(user.id, { callId, status: 'calling' });

        // Notify all group members about incoming call
        broadcastToGroup(io, groupId, 'video_call:incoming', {
          callId,
          callType,
          initiator: {
            id: user.id,
            username: user.username
          },
          groupName: group.name
        }, socket.id);

        socket.emit('video_call:initiated', { callId });
      }

    } catch (error) {
      console.error('Error initiating video call:', error);
      socket.emit('error', { message: 'Failed to initiate video call' });
    }
  });

  // Answer video call
  socket.on('video_call:answer', async (data: { callId: string }) => {
    try {
      const { callId } = data;

      const call = activeVideoCalls.get(callId);
      if (!call) {
        socket.emit('error', { message: 'Call not found' });
        return;
      }

      // Check participant limit
      if (call.participants.length >= 10) {
        socket.emit('error', { message: 'Call is full' });
        return;
      }

      // Check if user is already in a call
      if (userCallStatus.has(user.id)) {
        socket.emit('error', { message: 'Already in a call' });
        return;
      }

      // Add user to call
      call.participants.push(user.id);
      userCallStatus.set(user.id, { callId, status: 'in_call' });

      // Notify all participants
      broadcastToGroup(io, call.groupId, 'video_call:participant_joined', {
        callId,
        participant: {
          id: user.id,
          username: user.username
        },
        participants: call.participants
      });

      socket.emit('video_call:answered', {
        callId,
        participants: call.participants
      });

    } catch (error) {
      console.error('Error answering video call:', error);
      socket.emit('error', { message: 'Failed to answer video call' });
    }
  });

  // Reject video call
  socket.on('video_call:reject', (data: { callId: string }) => {
    try {
      const { callId } = data;

      const call = activeVideoCalls.get(callId);
      if (!call) return;

      // Notify call initiator
      broadcastToGroup(io, call.groupId, 'video_call:rejected', {
        callId,
        rejectedBy: {
          id: user.id,
          username: user.username
        }
      });

    } catch (error) {
      console.error('Error rejecting video call:', error);
    }
  });

  // End video call
  socket.on('video_call:end', (data: { callId: string }) => {
    try {
      const { callId } = data;

      const call = activeVideoCalls.get(callId);
      if (!call) return;

      // Remove user from call
      call.participants = call.participants.filter(id => id !== user.id);
      userCallStatus.delete(user.id);

      if (call.participants.length === 0) {
        // End call if no participants left
        activeVideoCalls.delete(callId);
        broadcastToGroup(io, call.groupId, 'video_call:ended', { callId });
      } else {
        // Notify remaining participants
        broadcastToGroup(io, call.groupId, 'video_call:participant_left', {
          callId,
          participant: {
            id: user.id,
            username: user.username
          },
          participants: call.participants
        });
      }

    } catch (error) {
      console.error('Error ending video call:', error);
    }
  });

  // WebRTC signaling
  socket.on('video_call:signal', (data: PeerConnectionData & { callId: string }) => {
    try {
      const { callId, userId: targetUserId, signal, type } = data;

      const call = activeVideoCalls.get(callId);
      if (!call || !call.participants.includes(user.id)) {
        socket.emit('error', { message: 'Not in this call' });
        return;
      }

      // Forward signal to target user
      io.to(`user:${targetUserId}`).emit('video_call:signal', {
        callId,
        userId: user.id,
        signal,
        type
      });

    } catch (error) {
      console.error('Error handling video call signal:', error);
    }
  });

  // Screen sharing
  socket.on('video_call:screen_share_start', (data: { callId: string }) => {
    try {
      const { callId } = data;

      const call = activeVideoCalls.get(callId);
      if (!call || !call.participants.includes(user.id)) {
        socket.emit('error', { message: 'Not in this call' });
        return;
      }

      call.isScreenSharing = true;

      // Notify all participants
      broadcastToGroup(io, call.groupId, 'video_call:screen_share_started', {
        callId,
        sharedBy: {
          id: user.id,
          username: user.username
        }
      }, socket.id);

    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  });

  socket.on('video_call:screen_share_stop', (data: { callId: string }) => {
    try {
      const { callId } = data;

      const call = activeVideoCalls.get(callId);
      if (!call || !call.participants.includes(user.id)) {
        return;
      }

      call.isScreenSharing = false;

      // Notify all participants
      broadcastToGroup(io, call.groupId, 'video_call:screen_share_stopped', {
        callId,
        stoppedBy: {
          id: user.id,
          username: user.username
        }
      }, socket.id);

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  });

  // Mute/unmute audio
  socket.on('video_call:audio_toggle', (data: { callId: string; muted: boolean }) => {
    try {
      const { callId, muted } = data;

      const call = activeVideoCalls.get(callId);
      if (!call || !call.participants.includes(user.id)) {
        return;
      }

      // Notify all participants
      broadcastToGroup(io, call.groupId, 'video_call:audio_toggled', {
        callId,
        userId: user.id,
        muted
      }, socket.id);

    } catch (error) {
      console.error('Error toggling audio:', error);
    }
  });

  // Enable/disable video
  socket.on('video_call:video_toggle', (data: { callId: string; enabled: boolean }) => {
    try {
      const { callId, enabled } = data;

      const call = activeVideoCalls.get(callId);
      if (!call || !call.participants.includes(user.id)) {
        return;
      }

      // Notify all participants
      broadcastToGroup(io, call.groupId, 'video_call:video_toggled', {
        callId,
        userId: user.id,
        enabled
      }, socket.id);

    } catch (error) {
      console.error('Error toggling video:', error);
    }
  });

  // Handle disconnect cleanup
  socket.on('disconnect', () => {
    // Clean up user from any active calls
    const userCall = userCallStatus.get(user.id);
    if (userCall) {
      const call = activeVideoCalls.get(userCall.callId);
      if (call) {
        call.participants = call.participants.filter(id => id !== user.id);
        userCallStatus.delete(user.id);

        if (call.participants.length === 0) {
          activeVideoCalls.delete(userCall.callId);
          broadcastToGroup(io, call.groupId, 'video_call:ended', { 
            callId: userCall.callId 
          });
        } else {
          broadcastToGroup(io, call.groupId, 'video_call:participant_left', {
            callId: userCall.callId,
            participant: {
              id: user.id,
              username: user.username
            },
            participants: call.participants
          });
        }
      }
    }
  });
};