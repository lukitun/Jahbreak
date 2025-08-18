export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: User[];
  admins: User[];
  owner: User;
  isPrivate: boolean;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  content: string;
  sender: User;
  group: string;
  messageType: 'text' | 'file' | 'image' | 'video' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isEncrypted: boolean;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface FileData {
  _id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  uploadedBy: User;
  group: string;
  downloadCount: number;
  createdAt: Date;
  url: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface VideoCallData {
  callId: string;
  groupId: string;
  participants: string[];
  isScreenSharing: boolean;
  startedBy: string;
  startedAt: Date;
}

export interface PeerConnectionData {
  userId: string;
  peerId: string;
  signal: any;
  type: 'offer' | 'answer' | 'ice-candidate';
}

export interface TypingData {
  userId: string;
  username: string;
  groupId: string;
  isTyping: boolean;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  socketId?: string;
}

export interface ChatState {
  messages: Message[];
  currentGroup: Group | null;
  groups: Group[];
  onlineUsers: string[];
  typingUsers: TypingData[];
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface VideoCallState {
  currentCall: VideoCallData | null;
  isInCall: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  participants: string[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
}

export interface FileUploadProgress {
  uploadId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error?: string;
}

export interface ChatContextType {
  // State
  messages: Message[];
  currentGroup: Group | null;
  groups: Group[];
  onlineUsers: string[];
  typingUsers: TypingData[];
  isLoading: boolean;
  error: string | null;

  // Actions
  sendMessage: (content: string, messageType?: string, isEncrypted?: boolean) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  markMessagesAsRead: (messageIds: string[]) => void;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  startTyping: (groupId: string) => void;
  stopTyping: (groupId: string) => void;
  setCurrentGroup: (group: Group | null) => void;
  loadGroups: () => void;
  loadMessages: (groupId: string, page?: number) => void;
}

export interface VideoCallContextType {
  // State
  currentCall: VideoCallData | null;
  isInCall: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  participants: string[];
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;

  // Actions
  initiateCall: (groupId: string, callType: 'audio' | 'video') => void;
  answerCall: (callId: string) => void;
  rejectCall: (callId: string) => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  startScreenShare: () => void;
  stopScreenShare: () => void;
}

export interface NotificationData {
  id: string;
  type: 'message' | 'call' | 'file' | 'system';
  title: string;
  message: string;
  groupId?: string;
  userId?: string;
  timestamp: Date;
  read: boolean;
}