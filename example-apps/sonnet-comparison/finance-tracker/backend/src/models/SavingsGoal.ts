import mongoose, { Document, Schema } from 'mongoose';

export interface ISavingsGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: Date;
  category: 'Emergency Fund' | 'Vacation' | 'Car' | 'House' | 'Education' | 'Retirement' | 'Investment' | 'Other';
  description?: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const savingsGoalSchema = new Schema<ISavingsGoal>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']
  },
  targetDate: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Emergency Fund', 'Vacation', 'Car', 'House', 'Education', 'Retirement', 'Investment', 'Other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function() {
  return this.targetAmount > 0 ? Math.round((this.currentAmount / this.targetAmount) * 100) : 0;
});

// Virtual for remaining amount
savingsGoalSchema.virtual('remainingAmount').get(function() {
  return Math.max(0, this.targetAmount - this.currentAmount);
});

// Include virtuals in JSON output
savingsGoalSchema.set('toJSON', { virtuals: true });

// Mark as completed when target is reached
savingsGoalSchema.pre('save', function(next) {
  if (this.currentAmount >= this.targetAmount && !this.isCompleted) {
    this.isCompleted = true;
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<ISavingsGoal>('SavingsGoal', savingsGoalSchema);