import { useMemo } from 'react';
import { Role, TaskPermission } from '@/lib/types';
import { ROLE_PERMISSIONS } from '@/lib/permissions';
import { useMemberStore } from '@/store/member-store';
import { useTaskStore } from '@/store/task-store';

export function useTaskPermissions(taskId: string) {
  const { currentMember } = useMemberStore();
  const { getTaskById } = useTaskStore();
  
  const permissions = useMemo(() => {
    if (!currentMember) return [];

    // Get permissions based on role
    const rolePermissions = ROLE_PERMISSIONS[currentMember.role] || [];

    // Special case: if user is the assignee, they get edit and comment permissions
    const task = getTaskById(taskId);
    const isAssignee = task?.assignee.name === currentMember.name;
    
    if (isAssignee) {
      return Array.from(new Set([
        ...rolePermissions,
        TaskPermission.EditTask,
        TaskPermission.ReadComments,
        TaskPermission.WriteComments
      ]));
    }

    return rolePermissions;
  }, [taskId, currentMember, getTaskById]);

  return {
    canView: permissions.includes(TaskPermission.ViewTask),
    canEdit: permissions.includes(TaskPermission.EditTask),
    canDelete: permissions.includes(TaskPermission.DeleteTask),
    canAssign: permissions.includes(TaskPermission.AssignTask),
    canReadComments: permissions.includes(TaskPermission.ReadComments),
    canWriteComments: permissions.includes(TaskPermission.WriteComments),
    permissions
  };
}