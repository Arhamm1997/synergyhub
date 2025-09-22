
import { create } from 'zustand';
import { initialMembers } from '@/lib/member-data';
import type { Member, MemberQuota } from '@/lib/types';
import { fetchMembers, fetchMemberQuotas, inviteMember } from '@/lib/api-members';

interface MemberState {
  members: Member[];
  currentMember: Member | null;
  businessId: string | null;
  isLoading: boolean;
  error: string | null;
  quotas: MemberQuota | null;
  setBusinessId: (id: string) => void;
  addMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  fetchMembers: () => Promise<void>;
  fetchQuotas: () => Promise<void>;
  inviteMember: (data: { email: string; role: string; message?: string }) => Promise<void>;
  getMemberById: (memberId: string) => Member | undefined;
  getProjectMembers: (projectId: string) => Member[];
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: initialMembers,
  currentMember: null,
  businessId: null,
  isLoading: false,
  error: null,
  quotas: null,
  
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
    // Fetch both members and quotas when business ID is set
    get().fetchMembers();
    get().fetchQuotas();
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
      const businessId = get().businessId;
      if (!businessId) {
        throw new Error('No business ID set');
      }

      const members = await fetchMembers(businessId);
      set({ members, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error?.message || 'Failed to fetch members',
        isLoading: false 
      });
    }
  },

  fetchQuotas: async () => {
    try {
      const businessId = get().businessId;
      if (!businessId) {
        throw new Error('No business ID set');
      }

      const quotas = await fetchMemberQuotas(businessId);
      set({ quotas });
    } catch (error: any) {
      set({ 
        error: error?.message || 'Failed to fetch member quotas'
      });
    }
  },

  inviteMember: async (data) => {
    const businessId = get().businessId;
    if (!businessId) {
      throw new Error('No business ID set');
    }

    try {
      await inviteMember(businessId, data);
      // Refresh members and quotas after successful invitation
      await get().fetchMembers();
      await get().fetchQuotas();
    } catch (error: any) {
      throw error;
    }
  },
}));
