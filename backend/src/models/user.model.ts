import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Department, Role, UserStatus, Permission } from '../types/enums';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  permissions?: Permission[];
  department: Department;
  avatarUrl?: string;
  avatarHint?: string;
  status: UserStatus;
  details?: string;
  businesses?: mongoose.Types.ObjectId[];
  lastActive?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
}

type UserDocument = IUser & Document & {
  password?: string;
};

type UserModel = mongoose.Model<UserDocument, {}, IUserMethods>;

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
    enum: Role,
    required: true,
    default: Role.Member
  },
  permissions: [{
    type: String,
    enum: Permission
  }],
  department: {
    type: String,
    enum: Department,
    required: true
  },
  avatarUrl: String,
  avatarHint: String,
  status: {
    type: String,
    enum: Object.values(UserStatus),
    default: UserStatus.Offline
  },
  details: String,
  businesses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  }],
  lastActive: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    (this as any).password = await bcrypt.hash((this as any).password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.method('comparePassword', async function(password: string) {
  return bcrypt.compare(password, (this as any).password);
});

// Hide password in JSON
userSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model<IUser, UserModel>('User', userSchema);