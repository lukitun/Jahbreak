import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

const readBySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const messageSchema = new Schema<IMessage>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'video', 'system'],
    default: 'text'
  },
  fileUrl: {
    type: String,
    default: ''
  },
  fileName: {
    type: String,
    default: ''
  },
  fileSize: {
    type: Number,
    default: 0
  },
  isEncrypted: {
    type: Boolean,
    default: false
  },
  encryptionKey: {
    type: String,
    default: ''
  },
  readBy: [readBySchema],
  editedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
messageSchema.index({ group: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: -1 });
messageSchema.index({ group: 1, messageType: 1 });

// Static method to find messages by group with pagination
messageSchema.statics.findByGroup = function(
  groupId: string, 
  page: number = 1, 
  limit: number = 50
) {
  const skip = (page - 1) * limit;
  return this.find({ 
    group: groupId, 
    deletedAt: { $exists: false } 
  })
    .populate('sender', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to mark message as read
messageSchema.statics.markAsRead = function(messageId: string, userId: string) {
  return this.findByIdAndUpdate(
    messageId,
    {
      $addToSet: {
        readBy: {
          user: userId,
          readAt: new Date()
        }
      }
    },
    { new: true }
  );
};

// Static method to get unread message count
messageSchema.statics.getUnreadCount = function(groupId: string, userId: string) {
  return this.countDocuments({
    group: groupId,
    'readBy.user': { $ne: userId },
    sender: { $ne: userId },
    deletedAt: { $exists: false }
  });
};

// Instance method to soft delete
messageSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

export const Message = mongoose.model<IMessage>('Message', messageSchema);