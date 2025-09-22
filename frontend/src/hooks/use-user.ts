import { create } from 'zustand';
import { api, API_ENDPOINTS } from '@/lib/api-config';
import type { User } from '@/lib/types';

interface UserState {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useUser = create<UserState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await api.get(API_ENDPOINTS.AUTH.ME);
      set({ user: response.data.data, error: null });
    } catch (error) {
      set({ error: error as Error });
    } finally {
      set({ isLoading: false });
    }
  },
  setUser: (user) => set({ user })
}));