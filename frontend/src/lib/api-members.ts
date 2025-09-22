import { api } from './api-config';
import type { Member, MemberQuota } from './types';

export async function fetchMembers(businessId: string): Promise<Member[]> {
  try {
    const response = await api.get(`/businesses/${businessId}/members`);
    return response.data.members;
  } catch (error: any) {
    console.error('Error fetching members:', error);
    throw new Error(error?.response?.data?.message || 'Failed to fetch members');
  }
}

export async function fetchMemberQuotas(businessId: string): Promise<MemberQuota> {
  try {
    const response = await api.get(`/businesses/${businessId}/quotas/members`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching member quotas:', error);
    // Return default quotas if fetch fails
    return {
      total: 5,
      used: 0,
      remaining: 5
    };
  }
}

export async function inviteMember(businessId: string, data: { 
  email: string;
  role: string;
  message?: string;
}) {
  try {
    const response = await api.post(`/businesses/${businessId}/members/invite`, data);
    return response.data;
  } catch (error: any) {
    console.error('Error inviting member:', error);
    throw new Error(error?.response?.data?.message || 'Failed to invite member');
  }
}