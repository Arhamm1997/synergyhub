
import { create } from 'zustand';
import { initialMembers } from '@/lib/member-data';
import type { Member } from '@/lib/types';
import { api } from '@/lib/api-config';

interface MemberState {
  members: Member[];
  businessId: string | null;
  isLoading: boolean;
  error: string | null;
  setBusinessId: (id: string) => void;
  addMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  fetchMembers: () => Promise<void>;
  getMemberById: (memberId: string) => Member | undefined;
  getProjectMembers: (projectId: string) => Member[];
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: initialMembers,
  businessId: null,
  isLoading: false,
  error: null,
  
  getMemberById: (memberId: string) => {
    return get().members.find(m => m.id === memberId);
  },

  getProjectMembers: (projectId: string) => {
    // In a real implementation, we would fetch project-member assignments from the backend
    // For now, return all members as a placeholder
    return get().members;
  },

  setBusinessId: (id) => {
    set({ businessId: id });
  },

  addMember: (memberData) => {
    const newMember: Member = {
      id: `MEMBER-${Math.floor(Math.random() * 10000)}`,
      ...memberData
    };
    set((state) => ({ members: [newMember, ...state.members] }));
  },

  updateMember: (updatedMember) => {
    set((state) => ({
      members: state.members.map(m => m.id === updatedMember.id ? updatedMember : m),
    }));
  },

  removeMember: (memberId) => {
    set((state) => ({
      members: state.members.filter(m => m.id !== memberId),
    }));
  },

  fetchMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      const businessId = useMemberStore.getState().businessId;
      if (!businessId) {
        throw new Error('No business ID set');
      }

      const response = await api.get(`/businesses/${businessId}/members`);
      set({ members: response.data.members, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error?.response?.data?.message || 'Failed to fetch members',
        isLoading: false 
      });
    }
  },
}));
