import { io, Socket } from 'socket.io-client';
import { getTokens } from './api';
import { Message, TypingData, VideoCallData, PeerConnectionData, UserPresence } from '../types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      const tokens = getTokens();
      
      if (!tokens) {
        reject(new Error('No authentication token available'));
        return;
      }

      const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

      this.socket = io(serverUrl, {
        auth: {
          token: tokens.accessToken,
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        this.reconnectAttempts = 0;
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.handleReconnect();
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        if (reason === 'io server disconnect') {
          // Server disconnected the socket, try to reconnect
          this.handleReconnect();
        }
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

      // Setup connection timeout
      setTimeout(() => {
        if (!this.socket?.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 10000);
    });
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
      
      setTimeout(() => {
        this.connect().catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Group management
  joinGroup(groupId: string) {
    this.socket?.emit('group:join', { groupId });
  }

  leaveGroup(groupId: string) {
    this.socket?.emit('group:leave', { groupId });
  }

  // Message handling
  sendMessage(content: string, groupId: string, messageType = 'text', isEncrypted = false, replyTo?: string) {
    this.socket?.emit('message:send', {
      content,
      groupId,
      messageType,
      isEncrypted,
      replyTo,
    });
  }

  editMessage(messageId: string, content: string) {
    this.socket?.emit('message:edit', { messageId, content });
  }

  deleteMessage(messageId: string) {
    this.socket?.emit('message:delete', { messageId });
  }

  markMessagesAsRead(groupId: string, messageIds: string[]) {
    this.socket?.emit('messages:mark_read', { groupId, messageIds });
  }

  reactToMessage(messageId: string, emoji: string, action: 'add' | 'remove') {
    this.socket?.emit('message:react', { messageId, emoji, action });
  }

  getMessageHistory(groupId: string, page = 1, limit = 50, before?: string) {
    this.socket?.emit('messages:get_history', { groupId, page, limit, before });
  }

  // Typing indicators
  startTyping(groupId: string) {
    this.socket?.emit('typing:start', { groupId });
  }

  stopTyping(groupId: string) {
    this.socket?.emit('typing:stop', { groupId });
  }

  getTypingUsers(groupId: string) {
    this.socket?.emit('typing:get_users', { groupId });
  }

  // Video calls
  initiateVideoCall(groupId: string, callType: 'audio' | 'video') {
    this.socket?.emit('video_call:initiate', { groupId, callType });
  }

  answerVideoCall(callId: string) {
    this.socket?.emit('video_call:answer', { callId });
  }

  rejectVideoCall(callId: string) {
    this.socket?.emit('video_call:reject', { callId });
  }

  endVideoCall(callId: string) {
    this.socket?.emit('video_call:end', { callId });
  }

  sendVideoSignal(callId: string, userId: string, signal: any, type: string) {
    this.socket?.emit('video_call:signal', { callId, userId, signal, type });
  }

  startScreenShare(callId: string) {
    this.socket?.emit('video_call:screen_share_start', { callId });
  }

  stopScreenShare(callId: string) {
    this.socket?.emit('video_call:screen_share_stop', { callId });
  }

  toggleAudio(callId: string, muted: boolean) {
    this.socket?.emit('video_call:audio_toggle', { callId, muted });
  }

  toggleVideo(callId: string, enabled: boolean) {
    this.socket?.emit('video_call:video_toggle', { callId, enabled });
  }

  // File handling
  startFileUpload(groupId: string, fileName: string, fileSize: number, fileType: string) {
    this.socket?.emit('file:upload_start', { groupId, fileName, fileSize, fileType });
  }

  updateFileUploadProgress(uploadId: string, groupId: string, progress: number) {
    this.socket?.emit('file:upload_progress', { uploadId, groupId, progress });
  }

  completeFileUpload(data: {
    uploadId: string;
    groupId: string;
    fileId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType: string;
  }) {
    this.socket?.emit('file:upload_complete', data);
  }

  failFileUpload(uploadId: string, groupId: string, error: string) {
    this.socket?.emit('file:upload_failed', { uploadId, groupId, error });
  }

  shareFile(fileId: string, groupId: string, fileName: string, fileSize: number, fileType: string) {
    this.socket?.emit('file:share', { fileId, groupId, fileName, fileSize, fileType });
  }

  deleteFile(fileId: string, groupId: string, fileName: string) {
    this.socket?.emit('file:delete', { fileId, groupId, fileName });
  }

  // Presence
  updatePresence(status: 'online' | 'away' | 'busy') {
    this.socket?.emit('presence:update', { status });
  }

  getOnlineUsers(groupId: string) {
    this.socket?.emit('users:get_online', { groupId });
  }

  // Event listeners
  onMessageReceived(callback: (message: Message) => void) {
    this.socket?.on('message:new', callback);
  }

  onMessageSent(callback: (data: any) => void) {
    this.socket?.on('message:sent', callback);
  }

  onMessageEdited(callback: (data: { messageId: string; content: string; editedAt: Date }) => void) {
    this.socket?.on('message:edited', callback);
  }

  onMessageDeleted(callback: (data: { messageId: string; deletedAt: Date }) => void) {
    this.socket?.on('message:deleted', callback);
  }

  onMessageReaction(callback: (data: any) => void) {
    this.socket?.on('message:reaction', callback);
  }

  onMessagesRead(callback: (data: { userId: string; messageIds: string[]; readAt: Date }) => void) {
    this.socket?.on('messages:read', callback);
  }

  onMessageHistory(callback: (data: any) => void) {
    this.socket?.on('messages:history', callback);
  }

  onTypingStarted(callback: (data: TypingData) => void) {
    this.socket?.on('typing:started', callback);
  }

  onTypingStopped(callback: (data: TypingData) => void) {
    this.socket?.on('typing:stopped', callback);
  }

  onTypingUsers(callback: (data: { groupId: string; typingUsers: string[] }) => void) {
    this.socket?.on('typing:users', callback);
  }

  onUserJoined(callback: (data: { userId: string; username: string; joinedAt: Date }) => void) {
    this.socket?.on('user:joined', callback);
  }

  onUserLeft(callback: (data: { userId: string; username: string; leftAt: Date }) => void) {
    this.socket?.on('user:left', callback);
  }

  onUsersOnline(callback: (data: { groupId: string; users: any[] }) => void) {
    this.socket?.on('users:online', callback);
  }

  onPresenceUpdated(callback: (data: UserPresence) => void) {
    this.socket?.on('presence:updated', callback);
  }

  // Video call events
  onIncomingCall(callback: (data: any) => void) {
    this.socket?.on('video_call:incoming', callback);
  }

  onCallInitiated(callback: (data: { callId: string }) => void) {
    this.socket?.on('video_call:initiated', callback);
  }

  onCallAnswered(callback: (data: any) => void) {
    this.socket?.on('video_call:answered', callback);
  }

  onCallJoined(callback: (data: any) => void) {
    this.socket?.on('video_call:joined', callback);
  }

  onCallRejected(callback: (data: any) => void) {
    this.socket?.on('video_call:rejected', callback);
  }

  onCallEnded(callback: (data: { callId: string }) => void) {
    this.socket?.on('video_call:ended', callback);
  }

  onParticipantJoined(callback: (data: any) => void) {
    this.socket?.on('video_call:participant_joined', callback);
  }

  onParticipantLeft(callback: (data: any) => void) {
    this.socket?.on('video_call:participant_left', callback);
  }

  onVideoSignal(callback: (data: PeerConnectionData & { callId: string }) => void) {
    this.socket?.on('video_call:signal', callback);
  }

  onScreenShareStarted(callback: (data: any) => void) {
    this.socket?.on('video_call:screen_share_started', callback);
  }

  onScreenShareStopped(callback: (data: any) => void) {
    this.socket?.on('video_call:screen_share_stopped', callback);
  }

  onAudioToggled(callback: (data: { callId: string; userId: string; muted: boolean }) => void) {
    this.socket?.on('video_call:audio_toggled', callback);
  }

  onVideoToggled(callback: (data: { callId: string; userId: string; enabled: boolean }) => void) {
    this.socket?.on('video_call:video_toggled', callback);
  }

  // File events
  onFileUploadStarted(callback: (data: any) => void) {
    this.socket?.on('file:upload_started', callback);
  }

  onFileUploadProgress(callback: (data: any) => void) {
    this.socket?.on('file:upload_progress', callback);
  }

  onFileUploadCompleted(callback: (data: any) => void) {
    this.socket?.on('file:upload_completed', callback);
  }

  onFileUploadFailed(callback: (data: any) => void) {
    this.socket?.on('file:upload_failed', callback);
  }

  onFileShared(callback: (data: any) => void) {
    this.socket?.on('file:shared', callback);
  }

  onFileDeleted(callback: (data: any) => void) {
    this.socket?.on('file:deleted', callback);
  }

  onFilesList(callback: (data: any) => void) {
    this.socket?.on('files:list', callback);
  }

  // Error handling
  onError(callback: (error: any) => void) {
    this.socket?.on('error', callback);
  }

  // Remove event listeners
  removeAllListeners() {
    this.socket?.removeAllListeners();
  }

  off(event: string, callback?: Function) {
    if (callback) {
      this.socket?.off(event, callback);
    } else {
      this.socket?.off(event);
    }
  }
}

export const socketService = new SocketService();
export default socketService;