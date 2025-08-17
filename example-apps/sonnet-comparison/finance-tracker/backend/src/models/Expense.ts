import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  category: 'Food' | 'Housing' | 'Transportation' | 'Entertainment' | 'Healthcare' | 'Shopping' | 'Utilities' | 'Other';
  description: string;
  date: Date;
  receiptUrl?: string;
  receiptPublicId?: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Digital Wallet' | 'Other';
  location?: string;
  tags: string[];
  isRecurring: boolean;
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
    required: true,
    enum: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  receiptUrl: {
    type: String
  },
  receiptPublicId: {
    type: String
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other']
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<IExpense>('Expense', expenseSchema);