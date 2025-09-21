import { z } from 'zod';
import { Role, UserStatus } from '../types/enums';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(40),
  confirmPassword: z.string(),
  department: z.string().min(1, 'Department is required'),
  role: z.nativeEnum(Role).default(Role.Member)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const authValidation = {
  register: {
    body: registerSchema
  },

  login: {
    body: z.object({
      email: z.string().email('Invalid email address'),
      password: z.string().min(1, 'Password is required')
    })
  },

  updateProfile: {
    body: z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      department: z.string().min(1).optional(),
      avatarUrl: z.string().url().optional(),
      status: z.nativeEnum(UserStatus).optional()
    })
  },

  changePassword: {
    body: z.object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z.string().min(6, 'Password must be at least 6 characters').max(40),
      confirmNewPassword: z.string()
    }).refine((data) => data.newPassword === data.confirmNewPassword, {
      message: "Passwords don't match",
      path: ["confirmNewPassword"],
    })
  },

  forgotPassword: {
    body: z.object({
      email: z.string().email('Invalid email address')
    })
  },

  resetPassword: {
    body: z.object({
      password: z.string().min(6, 'Password must be at least 6 characters').max(40),
      confirmPassword: z.string()
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    })
  }
};