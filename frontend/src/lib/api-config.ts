import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000';

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ADMIN_REQUESTS: '/auth/admin-requests',
  },
  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
  },
  // Businesses
  BUSINESSES: {
    BASE: '/businesses',
    BY_ID: (id: string) => `/businesses/${id}`,
    MEMBERS: (id: string) => `/businesses/${id}/members`,
    ANALYTICS: (id: string) => `/businesses/${id}/analytics`,
    INVITE: (id: string) => `/businesses/${id}/invite`,
  },
  // Projects
  PROJECTS: {
    BASE: '/projects',
    BY_ID: (id: string) => `/projects/${id}`,
    TASKS: (id: string) => `/projects/${id}/tasks`,
    ANALYTICS: (id: string) => `/projects/${id}/analytics`,
  },
  // Tasks
  TASKS: {
    BASE: '/tasks',
    BY_ID: (id: string) => `/tasks/${id}`,
    COMMENTS: (id: string) => `/tasks/${id}/comments`,
    TIME_LOGS: (id: string) => `/tasks/${id}/time-logs`,
  },
  // Clients
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
  },
  // Members
  MEMBERS: {
    BASE: '/members',
    BY_ID: (id: string) => `/members/${id}`,
    QUOTAS: '/members/quotas',
    INVITE: '/members/invite',
  },
  // Messages
  MESSAGES: {
    BASE: '/messages',
    BY_ID: (id: string) => `/messages/${id}`,
    CONVERSATIONS: '/messages/conversations',
  },
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string) => `/notifications/${id}`,
    MARK_READ: '/notifications/mark-read',
    PREFERENCES: '/notifications/preferences',
  },
  // Invitations
  INVITATIONS: {
    BASE: '/invitations',
    VALIDATE: '/invitations/validate',
    BY_TOKEN: (token: string) => `/invitations/${token}`,
  },
  // Upload
  UPLOAD: {
    AVATAR: '/upload/avatar',
    FILES: '/upload/files',
  },
  // Health
  HEALTH: '/health',
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for cookies/session
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear invalid token
      localStorage.removeItem('authToken');

      // Redirect to login page
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to create URLs with the base API URL
export const createApiUrl = (endpoint: string) => `${API_BASE_URL}${endpoint}`;