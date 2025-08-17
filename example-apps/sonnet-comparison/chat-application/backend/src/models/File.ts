import mongoose, { Schema } from 'mongoose';
import { IFile } from '../types';

const fileSchema = new Schema<IFile>({
  originalName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  path: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true,
    min: 0,
    max: 100 * 1024 * 1024 // 100MB limit
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
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
fileSchema.index({ group: 1, createdAt: -1 });
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ filename: 1 });
fileSchema.index({ mimetype: 1 });

// Static method to find files by group
fileSchema.statics.findByGroup = function(groupId: string, page: number = 1, limit: number = 20) {
  const skip = (page - 1) * limit;
  return this.find({ group: groupId })
    .populate('uploadedBy', 'username avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get file statistics
fileSchema.statics.getGroupStats = function(groupId: string) {
  return this.aggregate([
    { $match: { group: new mongoose.Types.ObjectId(groupId) } },
    {
      $group: {
        _id: null,
        totalFiles: { $sum: 1 },
        totalSize: { $sum: '$size' },
        totalDownloads: { $sum: '$downloadCount' },
        fileTypes: {
          $push: '$mimetype'
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalFiles: 1,
        totalSize: 1,
        totalDownloads: 1,
        fileTypes: {
          $reduce: {
            input: '$fileTypes',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $arrayToObject: [
                    [
                      {
                        k: '$$this',
                        v: {
                          $add: [
                            { $ifNull: [{ $getField: { field: '$$this', input: '$$value' } }, 0] },
                            1
                          ]
                        }
                      }
                    ]
                  ]
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

// Instance method to increment download count
fileSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  return this.save();
};

// Pre-save middleware to validate file size
fileSchema.pre('save', function(next) {
  const maxSize = 100 * 1024 * 1024; // 100MB
  if (this.size > maxSize) {
    const error = new Error('File size exceeds 100MB limit');
    return next(error);
  }
  next();
});

export const File = mongoose.model<IFile>('File', fileSchema);