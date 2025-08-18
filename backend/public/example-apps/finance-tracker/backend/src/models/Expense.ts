import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  user: mongoose.Types.ObjectId;
  amount: number;
  category: string;
  date: Date;
  description: string;
  currency: string;
  receiptImage?: string;
}

const ExpenseSchema: Schema = new Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']
  },
  date: { 
    type: Date, 
    default: Date.now 
  },
  description: { 
    type: String 
  },
  currency: { 
    type: String, 
    default: 'USD' 
  },
  receiptImage: { 
    type: String 
  }
});

export default mongoose.model<IExpense>('Expense', ExpenseSchema);