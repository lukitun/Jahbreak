import mongoose, { Schema, Document } from 'mongoose';

export interface IBudget extends Document {
  user: mongoose.Types.ObjectId;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  year: number;
  month?: number;
}

const BudgetSchema: Schema = new Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Shopping', 'Utilities', 'Other']
  },
  amount: { 
    type: Number, 
    required: true 
  },
  period: { 
    type: String, 
    required: true,
    enum: ['monthly', 'yearly']
  },
  year: { 
    type: Number, 
    required: true 
  },
  month: { 
    type: Number, 
    validate: {
      validator: function(v: number | undefined) {
        return this.period === 'monthly' ? v !== undefined : true;
      },
      message: 'Month is required for monthly budgets'
    }
  }
});

export default mongoose.model<IBudget>('Budget', BudgetSchema);