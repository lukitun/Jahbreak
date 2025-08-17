import { Socket, Server } from 'socket.io';
import Group from '../models/Group';
import Message from '../models/Message';
import { encryptMessage, decryptMessage } from '../utils/encryption';

export const handleGroupChat = (socket: Socket, io: Server) => {
  // Join Group
  socket.on('join_group', async (groupId: string) => {
    try {
      const group = await Group.findById(groupId);
      if (!group) {
        return socket.emit('group_error', 'Group not found');
      }

      // Check participant limit
      if (group.participants.length >= 100) {
        return socket.emit('group_error', 'Group participant limit reached');
      }

      socket.join(groupId);
      socket.emit('group_joined', groupId);
    } catch (error) {
      socket.emit('group_error', 'Error joining group');
    }
  });

  // Send Group Message
  socket.on('send_group_message', async (data: {
    groupId: string, 
    message: string, 
    senderId: string
  }) => {
    try {
      const { groupId, message, senderId } = data;
      
      // Encrypt message
      const encryptedMessage = encryptMessage(message);

      const newMessage = new Message({
        group: groupId,
        sender: senderId,
        content: encryptedMessage,
        type: 'text'
      });

      await newMessage.save();

      // Broadcast to group with encrypted message
      io.to(groupId).emit('receive_group_message', {
        ...newMessage.toJSON(),
        content: message  // Send decrypted to recipients
      });
    } catch (error) {
      socket.emit('message_error', 'Failed to send message');
    }
  });

  // Leave Group
  socket.on('leave_group', (groupId: string) => {
    socket.leave(groupId);
    socket.emit('group_left', groupId);
  });
};