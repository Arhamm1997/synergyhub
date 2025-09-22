import { create } from 'zustand';
import { AdminUser, AdminInvitation, AdminAuditLog, Role } from '@/lib/types';

interface AdminStore {
  admins: AdminUser[];
  invitations: AdminInvitation[];
  auditLogs: AdminAuditLog[];
  isLoading: boolean;
  error: string | null;
  
  // Admin Management
  addAdmin: (email: string, role: Role) => Promise<void>;
  removeAdmin: (adminId: string) => Promise<void>;
  updateAdminRole: (adminId: string, newRole: Role) => Promise<void>;
  toggleAdminStatus: (adminId: string) => Promise<void>;
  
  // Invitation Management
  createInvitation: (email: string, role: Role) => Promise<void>;
  revokeInvitation: (invitationId: string) => Promise<void>;
  
  // Audit Logs
  logAction: (action: string, targetUser: string, details: string) => Promise<void>;
  getAuditLogs: (limit?: number) => Promise<AdminAuditLog[]>;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  admins: [],
  invitations: [],
  auditLogs: [],
  isLoading: false,
  error: null,

  addAdmin: async (email: string, role: Role) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/admins', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      
      if (!response.ok) throw new Error('Failed to add admin');
      
      const newAdmin = await response.json();
      set(state => ({
        admins: [...state.admins, newAdmin],
      }));
      
      await get().logAction('add_admin', email, `Added new admin with role ${role}`);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  removeAdmin: async (adminId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
      });
      
      set(state => ({
        admins: state.admins.filter(admin => admin.id !== adminId),
      }));
      
      await get().logAction('remove_admin', adminId, 'Removed admin');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateAdminRole: async (adminId: string, newRole: Role) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      await fetch(`/api/admins/${adminId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      
      set(state => ({
        admins: state.admins.map(admin =>
          admin.id === adminId ? { ...admin, role: newRole } : admin
        ),
      }));
      
      await get().logAction('update_role', adminId, `Updated role to ${newRole}`);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleAdminStatus: async (adminId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      const admin = get().admins.find(a => a.id === adminId);
      if (!admin) throw new Error('Admin not found');
      
      // TODO: Replace with actual API call
      await fetch(`/api/admins/${adminId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      
      set(state => ({
        admins: state.admins.map(a =>
          a.id === adminId ? { ...a, isActive: !a.isActive } : a
        ),
      }));
      
      await get().logAction(
        'toggle_status',
        adminId,
        `${admin.isActive ? 'Deactivated' : 'Activated'} admin account`
      );
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  createInvitation: async (email: string, role: Role) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/admin-invitations', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      
      const newInvitation = await response.json();
      set(state => ({
        invitations: [...state.invitations, newInvitation],
      }));
      
      await get().logAction('create_invitation', email, `Created invitation for role ${role}`);
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  revokeInvitation: async (invitationId: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      await fetch(`/api/admin-invitations/${invitationId}`, {
        method: 'DELETE',
      });
      
      set(state => ({
        invitations: state.invitations.filter(inv => inv.id !== invitationId),
      }));
      
      await get().logAction('revoke_invitation', invitationId, 'Revoked admin invitation');
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      set({ isLoading: false });
    }
  },

  logAction: async (action: string, targetUser: string, details: string) => {
    try {
      const logEntry: AdminAuditLog = {
        id: Date.now().toString(), // Replace with proper UUID in production
        action,
        performedBy: 'current-user', // Replace with actual user ID
        targetUser,
        details,
        timestamp: new Date(),
      };
      
      // TODO: Replace with actual API call
      await fetch('/api/admin-audit-logs', {
        method: 'POST',
        body: JSON.stringify(logEntry),
      });
      
      set(state => ({
        auditLogs: [logEntry, ...state.auditLogs],
      }));
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  },

  getAuditLogs: async (limit = 50) => {
    try {
      set({ isLoading: true, error: null });
      
      // TODO: Replace with actual API call
      const response = await fetch(`/api/admin-audit-logs?limit=${limit}`);
      const logs = await response.json();
      
      set({ auditLogs: logs });
      return logs;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Unknown error' });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));