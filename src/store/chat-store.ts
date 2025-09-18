
import { create } from 'zustand';
import type { Contact } from '@/lib/types';

interface ChatState {
  isOpen: boolean;
  contact: Contact | null;
  openChat: () => void;
  closeChat: () => void;
  setContact: (contact: Contact) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  contact: null,
  openChat: () => set({ isOpen: true }),
  closeChat: () => set({ isOpen: false }),
  setContact: (contact) => set({ contact }),
}));
