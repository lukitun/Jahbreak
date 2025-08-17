import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  defaultCurrency: string;
  createdAt: Date;
}

const UserSchema: Schema = new Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  firstName: { 
    type: String, 
    required: true 
  },
  lastName: { 
    type: String, 
    required: true 
  },
  twoFactorSecret: { 
    type: String 
  },
  isTwoFactorEnabled: { 
    type: Boolean, 
    default: false 
  },
  defaultCurrency: { 
    type: String, 
    default: 'USD' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model<IUser>('User', UserSchema);