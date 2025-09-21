
import { create } from 'zustand';
import { initialMembers } from '@/lib/member-data';
import type { Member } from '@/lib/types';

interface MemberState {
  members: Member[];
  addMember: (memberData: Omit<Member, 'id'>) => void;
  updateMember: (member: Member) => void;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: initialMembers,
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
}));
