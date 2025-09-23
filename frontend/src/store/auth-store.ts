import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { api, API_ENDPOINTS } from '@/lib/api-config';

interface LoginData {
    email: string;
    password: string;
}

interface SignupData {
    name: string;
    email: string;
    password: string;
    businessId?: string;
    role?: string;
    invitationToken?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    token: string | null;
    // Auth operations
    login: (credentials: LoginData) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    resetPassword: (token: string, password: string) => Promise<void>;
    // Utility functions
    clearError: () => void;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null,

            clearError: () => set({ error: null }),

            setUser: (user: User) => {
                set({ user, isAuthenticated: true });
            },

            login: async (credentials: LoginData) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
                    const { user, token } = response.data.data || response.data;

                    // Store token in localStorage and axios header
                    localStorage.setItem('authToken', token);

                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.error?.message ||
                        error?.response?.data?.message ||
                        'Login failed';
                    set({
                        error: errorMessage,
                        isLoading: false,
                        isAuthenticated: false,
                        user: null,
                        token: null
                    });
                    throw new Error(errorMessage);
                }
            },

            signup: async (data: SignupData) => {
                try {
                    set({ isLoading: true, error: null });

                    const response = await api.post(API_ENDPOINTS.AUTH.SIGNUP, data);

                    // Handle successful registration
                    const { user, token } = response.data.data || response.data;

                    if (token) {
                        localStorage.setItem('authToken', token);
                        set({
                            user,
                            token,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null
                        });
                    } else {
                        // Account created but needs verification or is pending approval
                        set({ isLoading: false });
                    }
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.error?.message ||
                        error?.response?.data?.message ||
                        'Signup failed';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw new Error(errorMessage);
                }
            },

            logout: () => {
                localStorage.removeItem('authToken');
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    error: null
                });

                // Optional: Call logout endpoint
                api.post(API_ENDPOINTS.AUTH.LOGOUT).catch(() => {
                    // Ignore errors on logout
                });
            },

            refreshUser: async () => {
                try {
                    const token = localStorage.getItem('authToken');
                    if (!token) {
                        set({ isAuthenticated: false, user: null });
                        return;
                    }

                    const response = await api.get(API_ENDPOINTS.AUTH.ME);
                    const user = response.data.data || response.data.user || response.data;

                    set({
                        user,
                        isAuthenticated: true,
                        error: null
                    });
                } catch (error: any) {
                    // Token is invalid, clear it
                    localStorage.removeItem('authToken');
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        error: null
                    });
                }
            },

            verifyEmail: async (token: string) => {
                try {
                    set({ isLoading: true, error: null });

                    await api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });

                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Email verification failed';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw new Error(errorMessage);
                }
            },

            forgotPassword: async (email: string) => {
                try {
                    set({ isLoading: true, error: null });

                    await api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });

                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Failed to send reset email';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw new Error(errorMessage);
                }
            },

            resetPassword: async (token: string, password: string) => {
                try {
                    set({ isLoading: true, error: null });

                    await api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });

                    set({ isLoading: false });
                } catch (error: any) {
                    const errorMessage = error?.response?.data?.message || 'Password reset failed';
                    set({
                        error: errorMessage,
                        isLoading: false
                    });
                    throw new Error(errorMessage);
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                token: state.token,
            }),
        }
    )
);