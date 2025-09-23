import { create } from "zustand";

interface Message {
    id: string;
    sender: string;
    text: string;
    time: string;
    isMe: boolean;
    avatarUrl?: string;
    avatarHint?: string;
}

interface MessagesState {
    messages: Message[];
    isLoading: boolean;
    error: string | null;
    fetchMessages: (contactId: string) => Promise<void>;
    sendMessage: (contactId: string, text: string) => Promise<void>;
}

export const useMessagesStore = create<MessagesState>((set, get) => ({
    messages: [],
    isLoading: false,
    error: null,

    fetchMessages: async (contactId: string) => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch(`/api/messages/${contactId}`);
            if (!response.ok) {
                throw new Error("Failed to fetch messages");
            }
            const data = await response.json();
            set({ messages: data.messages, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    sendMessage: async (contactId: string, text: string) => {
        try {
            const response = await fetch(`/api/messages/${contactId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text }),
            });

            if (!response.ok) {
                throw new Error("Failed to send message");
            }

            const newMessage = await response.json();
            set((state) => ({
                messages: [...state.messages, newMessage],
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },
}));