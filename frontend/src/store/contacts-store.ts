import { create } from "zustand";
import type { Contact } from "@/lib/types";
import { api, API_ENDPOINTS } from "@/lib/api-config";

interface ContactsState {
    contacts: Contact[];
    isLoading: boolean;
    error: string | null;
    fetchContacts: () => Promise<void>;
    addContact: (contact: Contact) => Promise<void>;
    updateContact: (contactId: string, updates: Partial<Contact>) => Promise<void>;
    removeContact: (contactId: string) => Promise<void>;
    updateLastMessage: (contactId: string, message: string, time: string) => Promise<void>;
}

export const useContactsStore = create<ContactsState>((set) => ({
    contacts: [],
    isLoading: false,
    error: null,

    fetchContacts: async () => {
        try {
            set({ isLoading: true, error: null });
            // For now, get conversations from messages API
            const response = await api.get(API_ENDPOINTS.MESSAGES.CONVERSATIONS);
            const conversations = response.data.data || response.data || [];

            // Transform conversations to contacts format
            const contacts = conversations.map((conv: any) => ({
                id: conv._id || conv.id,
                name: conv.participants?.find((p: any) => p._id !== conv.currentUserId)?.name || 'Unknown',
                avatarUrl: conv.participants?.find((p: any) => p._id !== conv.currentUserId)?.avatarUrl || '',
                avatarHint: conv.participants?.find((p: any) => p._id !== conv.currentUserId)?.avatarHint || '',
                status: 'Online',
                lastMessage: conv.lastMessage?.content || 'No messages yet',
                time: conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleTimeString() : '',
                unread: conv.unreadCount || 0,
                isGroup: conv.participants?.length > 2
            }));

            set({ contacts, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addContact: async (contact: Contact) => {
        try {
            // For now, just add to local state
            // In a real app, this would create a new conversation
            set((state) => ({
                contacts: [...state.contacts, contact],
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateContact: async (contactId: string, updates: Partial<Contact>) => {
        try {
            // For now, just update local state
            set((state) => ({
                contacts: state.contacts.map((contact) =>
                    contact.id === contactId ? { ...contact, ...updates } : contact
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    removeContact: async (contactId: string) => {
        try {
            // For now, just remove from local state
            set((state) => ({
                contacts: state.contacts.filter((contact) => contact.id !== contactId),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateLastMessage: async (contactId: string, message: string, time: string) => {
        try {
            // For now, just update local state
            set((state) => ({
                contacts: state.contacts.map((contact) =>
                    contact.id === contactId
                        ? { ...contact, lastMessage: message, time }
                        : contact
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
}));