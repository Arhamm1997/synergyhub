import { api } from './api-config';
import type { Member, MemberQuota } from './types';

export async function fetchMembers(businessId: string): Promise<Member[]> {
  try {
    const response = await api.get(`/businesses/${businessId}/members`);
    return response.data.members || [];
  } catch (error: any) {
    console.error('Error fetching members:', error);
    // Return empty array instead of throwing error
    return [];
  }
}

export async function fetchMemberQuotas(businessId: string): Promise<MemberQuota> {
  try {
    const response = await api.get(`/businesses/${businessId}/quotas/members`);

    // If API returns the expected MemberQuota format
    if (response.data.id && response.data.memberId) {
      return response.data;
    }

    // If API returns different format, transform it
    const quota = response.data;
    return {
      id: `quota-${businessId}`,
      businessId: businessId,
      memberId: businessId,
      monthlyLimit: quota.total || 100,
      usedThisMonth: quota.used || 0,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1) // First day of next month
    };
  } catch (error: any) {
    console.error('Error fetching member quotas:', error);
    // Return proper MemberQuota format instead of generic object
    return {
      id: `quota-${businessId}-default`,
      businessId: businessId,
      memberId: businessId,
      monthlyLimit: 100,
      usedThisMonth: 0,
      resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
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