import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Department, Role, UserStatus } from '../types/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  department: Department;
  avatarUrl?: string;
  avatarHint?: string;
  status: UserStatus;
  details?: string;
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

type UserModel = mongoose.Model<IUser, {}, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  role: {
    type: String,
    enum: ['Admin', 'Team Lead', 'Employee', 'Client'],
    required: true
  },
  department: {
    type: String,
    required: true
  },
  avatarUrl: String,
  avatarHint: String,
  status: {
    type: String,
    enum: ['Online', 'Offline', 'Away'],
    default: UserStatus.Offline
  },
  details: String,
  lastActive: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.method('comparePassword', async function(password: string) {
  return bcrypt.compare(password, this.password);
});

// Hide password in JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);