import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  amount: number;
  currency: string;
  category?: 'Food' | 'Housing' | 'Transportation' | 'Entertainment' | 'Healthcare' | 'Shopping' | 'Utilities' | 'Other';
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate: Date;
  spent: number;
  alertAt80Percent: boolean;
  alertAt100Percent: boolean;
  alert80PercentSent: boolean;
  alert100PercentSent: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>({
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
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    required: true,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR']
  },
  category: {
    type: String,
    enum: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']
  },
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  alertAt80Percent: {
    type: Boolean,
    default: true
  },
  alertAt100Percent: {
    type: Boolean,
    default: true
  },
  alert80PercentSent: {
    type: Boolean,
    default: false
  },
  alert100PercentSent: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// Virtual for progress percentage
budgetSchema.virtual('progressPercentage').get(function() {
  return this.amount > 0 ? Math.round((this.spent / this.amount) * 100) : 0;
});

// Virtual for remaining amount
budgetSchema.virtual('remaining').get(function() {
  return Math.max(0, this.amount - this.spent);
});

// Include virtuals in JSON output
budgetSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IBudget>('Budget', budgetSchema);