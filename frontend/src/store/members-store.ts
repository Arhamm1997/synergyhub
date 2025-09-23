import { create } from "zustand";
import type { Member } from "@/lib/types";

interface MembersState {
    members: Member[];
    isLoading: boolean;
    error: string | null;
    fetchMembers: () => Promise<void>;
    addMember: (member: Omit<Member, 'id'>) => Promise<void>;
    updateMember: (memberId: string, updates: Partial<Member>) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    updateMemberAvatar: (memberId: string, avatarUrl: string) => Promise<void>;
}

export const useMembersStore = create<MembersState>((set) => ({
    members: [],
    isLoading: false,
    error: null,

    fetchMembers: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await fetch("/api/members");
            if (!response.ok) {
                throw new Error("Failed to fetch members");
            }
            const data = await response.json();
            set({ members: data.members, isLoading: false });
        } catch (error) {
            set({ error: (error as Error).message, isLoading: false });
        }
    },

    addMember: async (member) => {
        try {
            const response = await fetch("/api/members", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(member),
            });

            if (!response.ok) {
                throw new Error("Failed to add member");
            }

            const newMember = await response.json();
            set((state) => ({
                members: [...state.members, newMember],
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateMember: async (memberId: string, updates: Partial<Member>) => {
        try {
            const response = await fetch(`/api/members/${memberId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                throw new Error("Failed to update member");
            }

            const updatedMember = await response.json();
            set((state) => ({
                members: state.members.map((member) =>
                    member.id === memberId ? updatedMember : member
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    removeMember: async (memberId: string) => {
        try {
            const response = await fetch(`/api/members/${memberId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to remove member");
            }

            set((state) => ({
                members: state.members.filter((member) => member.id !== memberId),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    updateMemberAvatar: async (memberId: string, avatarUrl: string) => {
        try {
            const response = await fetch(`/api/members/${memberId}/avatar`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ avatarUrl }),
            });

            if (!response.ok) {
                throw new Error("Failed to update member avatar");
            }

            set((state) => ({
                members: state.members.map((member) =>
                    member.id === memberId ? { ...member, avatarUrl } : member
                ),
            }));
        } catch (error) {
            set({ error: (error as Error).message });
            throw error;
        }
    },
}));