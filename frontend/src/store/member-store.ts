import { create } from 'zustand';
import type { Member, MemberQuota } from '@/lib/types';
import { api, API_ENDPOINTS } from '@/lib/api-config';

interface InviteMemberData {
  email: string;
  role: string;
  message?: string;
}

interface MemberState {
  members: Member[];
  currentMember: Member | null;
  businessId: string | null;
  isLoading: boolean;
  error: string | null;
  quotas: MemberQuota | null;
  // Configuration
  setBusinessId: (id: string) => void;
  // CRUD operations
  fetchMembers: (businessId?: string) => Promise<void>;
  createMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
  removeMember: (memberId: string) => void;
  // Advanced operations
  fetchQuotas: (businessId?: string) => Promise<void>;
  inviteMember: (data: InviteMemberData) => Promise<void>;
  // Utility functions
  getMemberById: (memberId: string) => Member | undefined;
  getProjectMembers: (projectId: string) => Member[];
  clearError: () => void;
}

export const useMemberStore = create<MemberState>((set, get) => ({
  members: [],
  currentMember: null,
  businessId: null,
  isLoading: false,
  error: null,
  quotas: null,

  clearError: () => {
    set({ error: null });
  },

  getMemberById: (memberId: string) => {
    return get().members.find(m => m.id === memberId);
  },

  getProjectMembers: (projectId: string) => {
    // For now, return all members. This could be enhanced to filter by project assignment
    return get().members;
  },

  setBusinessId: (id) => {
    set({ businessId: id, error: null });

    // Fetch data with error handling
    Promise.all([
      get().fetchMembers(id),
      get().fetchQuotas(id)
    ]).catch(() => {
      // Errors are handled individually in each function
      console.log('Some API calls failed, but continuing with available data');
    });
  },

  createMember: (memberData) => {
    const newMember: Member = {
      id: `MEMBER-${Date.now()}`,
      lastActive: new Date(),
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

  fetchMembers: async (businessId?: string) => {
    set({ isLoading: true });
    try {
      const targetBusinessId = businessId || get().businessId;
      if (!targetBusinessId) {
        set({ members: [], isLoading: false });
        return;
      }

      let endpoint = API_ENDPOINTS.MEMBERS.BASE;
      endpoint += `?businessId=${targetBusinessId}`;

      const response = await api.get(endpoint);
      const members = response.data.members || response.data;

      set({
        members: Array.isArray(members) ? members : [],
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      console.error('Failed to fetch members:', error);
      set({
        members: [], // Start with empty array instead of fallback
        isLoading: false,
        error: null // Don't show error to user, just use empty state
      });
    }
  },

  fetchQuotas: async (businessId?: string) => {
    try {
      const targetBusinessId = businessId || get().businessId;
      if (!targetBusinessId) {
        return;
      }

      const response = await api.get(`${API_ENDPOINTS.MEMBERS.QUOTAS}?businessId=${targetBusinessId}`);
      set({ quotas: response.data, error: null });
    } catch (error: any) {
      console.error('Failed to fetch quotas:', error);
      // Don't set error in state, just provide fallback data
      set({
        quotas: {
          total: 100,
          used: 0,
          remaining: 100
        }
      });
    }
  },

  inviteMember: async (data: InviteMemberData) => {
    const businessId = get().businessId;
    if (!businessId) {
      throw new Error('No business ID set');
    }

    set({ isLoading: true, error: null });
    try {
      await api.post(API_ENDPOINTS.MEMBERS.INVITE, {
        ...data,
        businessId
      });

      // Refresh members after successful invitation
      await get().fetchMembers();
      set({ isLoading: false });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to invite member';
      set({
        error: errorMessage,
        isLoading: false
      });
      throw new Error(errorMessage);
    }
  },
}));