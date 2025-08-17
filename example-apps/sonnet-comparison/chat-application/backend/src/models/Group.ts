import mongoose, { Schema } from 'mongoose';
import { IGroup } from '../types';

const groupSchema = new Schema<IGroup>({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  avatar: {
    type: String,
    default: ''
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  maxMembers: {
    type: Number,
    default: 100,
    min: 2,
    max: 100
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
groupSchema.index({ members: 1 });
groupSchema.index({ owner: 1 });
groupSchema.index({ name: 'text', description: 'text' });
groupSchema.index({ createdAt: -1 });

// Ensure owner is always in members and admins
groupSchema.pre('save', function(next) {
  if (!this.members.includes(this.owner)) {
    this.members.push(this.owner);
  }
  if (!this.admins.includes(this.owner)) {
    this.admins.push(this.owner);
  }
  next();
});

// Validate member count
groupSchema.pre('save', function(next) {
  if (this.members.length > this.maxMembers) {
    const error = new Error(`Group cannot have more than ${this.maxMembers} members`);
    return next(error);
  }
  next();
});

// Static method to find groups by user
groupSchema.statics.findByUser = function(userId: string) {
  return this.find({ members: userId })
    .populate('members', 'username avatar isOnline lastSeen')
    .populate('owner', 'username avatar')
    .sort({ updatedAt: -1 });
};

export const Group = mongoose.model<IGroup>('Group', groupSchema);