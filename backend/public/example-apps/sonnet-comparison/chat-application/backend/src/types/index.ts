import { Document } from 'mongoose';
import { Socket } from 'socket.io';

export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  publicKey?: string;
  refreshTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IGroup extends Document {
  _id: string;
  name: string;
  description?: string;
  avatar?: string;
  members: string[];
  admins: string[];
  owner: string;
  isPrivate: boolean;
  maxMembers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMessage extends Document {
  _id: string;
  content: string;
  sender: string;
  group: string;
  messageType: 'text' | 'file' | 'image' | 'video' | 'system';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  isEncrypted: boolean;
  encryptionKey?: string;
  readBy: Array<{
    user: string;
    readAt: Date;
  }>;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFile extends Document {
  _id: string;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  uploadedBy: string;
  group: string;
  isPublic: boolean;
  downloadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    username: string;
    email: string;
  };
}

export interface JWTPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  iat?: number;
  exp?: number;
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

export interface FileUploadData {
  file: Buffer;
  filename: string;
  mimetype: string;
  size: number;
  groupId: string;
  uploadedBy: string;
}

export interface GroupMemberData {
  userId: string;
  username: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

export interface TypingData {
  userId: string;
  username: string;
  groupId: string;
  isTyping: boolean;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  lastSeen: Date;
  socketId?: string;
}

export interface GroupSettings {
  allowFileSharing: boolean;
  allowVideoCalls: boolean;
  maxFileSize: number;
  messageRetention: number; // days
  requireApprovalForJoin: boolean;
}

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedMessage {
  encryptedContent: string;
  encryptionKey: string;
  iv: string;
}