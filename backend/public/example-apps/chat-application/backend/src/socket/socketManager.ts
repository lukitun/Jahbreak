import { Server, Socket } from 'socket.io';
import { handleGroupChat } from './groupChat';
import { handleVideoCall } from './videoCall';
import { handleFileSharing } from './fileSharing';

export const setupSocketIO = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    // Group Chat Handlers
    handleGroupChat(socket, io);

    // Video Call Handlers
    handleVideoCall(socket, io);

    // File Sharing Handlers
    handleFileSharing(socket, io);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const broadcastToGroup = (
  io: Server, 
  groupId: string, 
  event: string, 
  data: any
) => {
  io.to(groupId).emit(event, data);
};