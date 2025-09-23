import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { Department, Role, UserStatus } from '../types/enums';

export interface IUserProfile {
  firstName: string;
  lastName: string;
  title?: string; // Job title
  bio?: string;
  phone?: string;
  timezone?: string;
  location?: string;
  skills?: string[];
  languages?: string[];
  experience?: string; // e.g., "5+ years", "Senior level"
}

export interface IUserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    taskUpdates: boolean;
    projectUpdates: boolean;
    mentions: boolean;
  };
  workingHours: {
    start: string; // "09:00"
    end: string; // "17:00"
    timezone: string;
    workingDays: number[]; // [1,2,3,4,5] for Mon-Fri
  };
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  permissions: string[];
  department?: Department;
  profile: IUserProfile;
  avatarUrl?: string;
  avatarHint?: string;
  status: UserStatus;
  details?: string;
  businesses: mongoose.Types.ObjectId[];
  lastActive?: Date;
  defaultBusiness?: mongoose.Types.ObjectId;
  preferences: IUserPreferences;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
  employeeId?: string;
  hireDate?: Date;
  hourlyRate?: number;
  manager?: mongoose.Types.ObjectId;
  directReports?: mongoose.Types.ObjectId[];
  twoFactorEnabled: boolean;
  loginAttempts: number;
  lockUntil?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(password: string): Promise<boolean>;
  incLoginAttempts(): Promise<any>;
  resetLoginAttempts(): Promise<any>;
}

type UserDocument = IUser & Document & {
  password?: string;
};

type UserModel = mongoose.Model<UserDocument, Record<string, never>, IUserMethods>;

// Define role-based permissions inline
const rolePermissions = {
  [Role.SuperAdmin]: [
    'manage_all', 'manage_business', 'manage_users', 'manage_projects',
    'manage_tasks', 'view_analytics', 'system_config'
  ],
  [Role.Admin]: [
    'manage_projects', 'manage_tasks', 'manage_members', 'view_reports'
  ],
  [Role.Member]: [
    'create_tasks', 'edit_own_tasks', 'view_tasks', 'upload_files'
  ],
  [Role.Client]: [
    'view_assigned_tasks', 'comment_tasks', 'upload_files'
  ]
};

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
    enum: Object.values(Role),
    required: true,
    default: Role.Member
  },
  permissions: {
    type: [String],
    default: function () {
      return rolePermissions[this.role] || rolePermissions[Role.Member];
    }
  },
  department: {
    type: String,
    enum: Object.values(Department),
    required: false
  },
  profile: {
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    title: String,
    bio: String,
    phone: String,
    timezone: {
      type: String,
      default: 'UTC'
    },
    location: String,
    skills: [String],
    languages: [String],
    experience: String
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
    ref: 'Business',
    required: true
  }],
  defaultBusiness: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business'
  },
  lastActive: Date,
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      taskUpdates: {
        type: Boolean,
        default: true
      },
      projectUpdates: {
        type: Boolean,
        default: true
      },
      mentions: {
        type: Boolean,
        default: true
      }
    },
    workingHours: {
      start: {
        type: String,
        default: '09:00'
      },
      end: {
        type: String,
        default: '17:00'
      },
      timezone: {
        type: String,
        default: 'UTC'
      },
      workingDays: {
        type: [Number],
        default: [1, 2, 3, 4, 5] // Monday to Friday
      }
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLoginAt: Date,
  employeeId: String,
  hireDate: Date,
  hourlyRate: Number,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  directReports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    (this as any).password = await bcrypt.hash((this as any).password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Set permissions based on role when role changes
userSchema.pre('save', function (next) {
  if (this.isModified('role')) {
    this.permissions = rolePermissions[this.role] || rolePermissions[Role.Member];
  }

  // Auto-populate name from profile if name is not set
  if (!this.name && this.profile && this.profile.firstName && this.profile.lastName) {
    this.name = `${this.profile.firstName} ${this.profile.lastName}`;
  }

  next();
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  if (this.profile && this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.name;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Method to increment login attempts
userSchema.method('incLoginAttempts', function () {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates: any = { $inc: { loginAttempts: 1 } };

  // If we've reached max attempts and haven't been locked, lock the account
  const isCurrentlyLocked = !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
  if (this.loginAttempts + 1 >= 5 && !isCurrentlyLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }

  return this.updateOne(updates);
});

// Method to reset login attempts
userSchema.method('resetLoginAttempts', function () {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
});

// Compare password method
userSchema.method('comparePassword', async function (password: string) {
  return bcrypt.compare(password, (this as any).password);
});

// Additional indexes for better performance
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ employeeId: 1 }, { sparse: true, unique: true });
userSchema.index({ role: 1 });
userSchema.index({ department: 1 });
userSchema.index({ status: 1 });
userSchema.index({ manager: 1 });
userSchema.index({ 'businesses': 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ lastActive: -1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Include virtuals in JSON
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model<IUser, UserModel>('User', userSchema);