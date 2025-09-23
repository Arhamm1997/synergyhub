import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { User } from '../models/user.model';
import { Client } from '../models/client.model';
import { Business } from '../models/business.model';
import { AuditLog } from '../models/audit.model';
import { sendNotification } from '../services/notification.service';
import { AppError } from '../middleware/error-handler';

export const projectController = {
  // Get all projects with filtering and pagination
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        client,
        priority,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        businessId
      } = req.query;

      // Build filter
      const filter: any = {};
      if (businessId) filter.business = businessId;
      if (status) filter.status = status;
      if (client) filter.client = client;
      if (priority) filter.priority = priority;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Execute query
      const [projects, total] = await Promise.all([
        Project.find(filter)
          .populate('client', 'name email phone status')
          .populate('business', 'name')
          .populate('team.user', 'name profile avatarUrl status')
          .populate('projectManager', 'name profile avatarUrl')
          .populate('createdBy', 'name profile')
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Project.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single project with detailed information
  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('client', 'name email phone company status')
        .populate('business', 'name description')
        .populate('team.user', 'name profile avatarUrl status department role')
        .populate('projectManager', 'name profile avatarUrl department')
        .populate('createdBy', 'name profile')
        .populate('milestones.completedBy', 'name profile')
        .populate({
          path: 'tasks',
          populate: [
            { path: 'assignee', select: 'name profile avatarUrl status' },
            { path: 'createdBy', select: 'name profile' }
          ]
        });

      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Calculate project statistics
      const tasks = await Task.find({ project: project._id });
      const stats = {
        totalTasks: tasks.length,
        completedTasks: tasks.filter(task => task.status === 'Done').length,
        inProgressTasks: tasks.filter(task => task.status === 'In Progress').length,
        overdueTasks: tasks.filter(task =>
          task.dueDate < new Date() && task.status !== 'Done'
        ).length
      };

      res.json({
        success: true,
        data: {
          ...project.toObject(),
          statistics: stats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create project with validation
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        client,
        business,
        description,
        startDate,
        deadline,
        budget,
        team,
        milestones,
        projectManager,
        priority = 'Medium',
        visibility = 'Team',
        estimatedHours,
        tags,
        customFields
      } = req.body;

      // Validate client exists
      const clientDoc = await Client.findById(client);
      if (!clientDoc) {
        throw new AppError(404, 'Client not found');
      }

      // Validate business exists and user has access
      const businessDoc = await Business.findById(business);
      if (!businessDoc) {
        throw new AppError(404, 'Business not found');
      }

      // Validate team members exist
      if (team && team.length > 0) {
        const teamUserIds = team.map((member: any) => member.user);
        const teamUsers = await User.find({ _id: { $in: teamUserIds } });
        if (teamUsers.length !== teamUserIds.length) {
          throw new AppError(400, 'One or more team members not found');
        }
      }

      // Validate project manager
      if (projectManager) {
        const managerUser = await User.findById(projectManager);
        if (!managerUser) {
          throw new AppError(404, 'Project manager not found');
        }
      }

      const project = await Project.create({
        name,
        client,
        business,
        description,
        startDate: new Date(startDate),
        deadline: new Date(deadline),
        budget,
        team: team || [],
        milestones: milestones || [],
        projectManager,
        priority,
        visibility,
        estimatedHours,
        tags: tags || [],
        customFields: customFields || {},
        createdBy: req.user._id
      });

      await project.populate([
        { path: 'client', select: 'name email company' },
        { path: 'business', select: 'name' },
        { path: 'team.user', select: 'name profile avatarUrl' },
        { path: 'projectManager', select: 'name profile avatarUrl' },
        { path: 'createdBy', select: 'name profile' }
      ]);

      // Log audit trail
      await AuditLog.create({
        user: req.user._id,
        business,
        action: 'CREATE_PROJECT',
        resourceType: 'Project',
        resourceId: project._id,
        metadata: {
          projectName: project.name,
          clientName: clientDoc.name
        }
      });

      // Notify team members
      const notifications = [];
      if (team && team.length > 0) {
        for (const member of team) {
          if (member.user.toString() !== req.user._id.toString()) {
            notifications.push(sendNotification({
              user: member.user,
              message: `You have been added to project: ${project.name}`,
              type: 'PROJECT_ASSIGNED',
              data: { projectId: project._id }
            }));
          }
        }
      }

      // Notify project manager
      if (projectManager && projectManager.toString() !== req.user._id.toString()) {
        notifications.push(sendNotification({
          user: projectManager,
          message: `You have been assigned as project manager for: ${project.name}`,
          type: 'PROJECT_MANAGER_ASSIGNED',
          data: { projectId: project._id }
        }));
      }

      await Promise.all(notifications);

      res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  // Update project with change tracking
  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const oldProject = await Project.findById(req.params.id);
      if (!oldProject) {
        throw new AppError(404, 'Project not found');
      }

      const updates = { ...req.body };

      // Validate updates if they include references
      if (updates.client) {
        const client = await Client.findById(updates.client);
        if (!client) {
          throw new AppError(404, 'Client not found');
        }
      }

      if (updates.projectManager) {
        const manager = await User.findById(updates.projectManager);
        if (!manager) {
          throw new AppError(404, 'Project manager not found');
        }
      }

      const project = await Project.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('client', 'name email company')
        .populate('business', 'name')
        .populate('team.user', 'name profile avatarUrl')
        .populate('projectManager', 'name profile avatarUrl')
        .populate('createdBy', 'name profile');

      // Track changes for audit log
      const changes: any = {};
      Object.keys(updates).forEach(key => {
        if (JSON.stringify(oldProject[key as keyof typeof oldProject]) !== JSON.stringify(updates[key])) {
          changes[key] = {
            old: oldProject[key as keyof typeof oldProject],
            new: updates[key]
          };
        }
      });

      // Log audit trail
      if (Object.keys(changes).length > 0) {
        await AuditLog.create({
          user: req.user._id,
          business: project.business,
          action: 'UPDATE_PROJECT',
          resourceType: 'Project',
          resourceId: project._id,
          changes,
          metadata: { projectName: project.name }
        });
      }

      // Send notifications for significant changes
      const notifications = [];
      if (changes.status && project.team) {
        for (const member of project.team) {
          notifications.push(sendNotification({
            user: member.user._id,
            message: `Project "${project.name}" status changed to ${changes.status.new}`,
            type: 'PROJECT_STATUS_CHANGED',
            data: { projectId: project._id }
          }));
        }
      }

      if (changes.deadline && project.team) {
        for (const member of project.team) {
          notifications.push(sendNotification({
            user: member.user._id,
            message: `Project "${project.name}" deadline has been updated`,
            type: 'PROJECT_DEADLINE_CHANGED',
            data: { projectId: project._id }
          }));
        }
      }

      await Promise.all(notifications);

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  // Add team member to project
  async addTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId, role, hourlyRate } = req.body;

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      const user = await User.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Check if user is already in team
      const existingMember = project.team.find(member =>
        member.user.toString() === userId
      );
      if (existingMember) {
        throw new AppError(400, 'User is already a team member');
      }

      project.team.push({
        user: userId,
        role: role || 'Team Member',
        hourlyRate,
        addedAt: new Date()
      });

      await project.save();
      await project.populate('team.user', 'name profile avatarUrl');

      // Notify the new team member
      await sendNotification({
        user: userId,
        message: `You have been added to project: ${project.name}`,
        type: 'PROJECT_ASSIGNED',
        data: { projectId: project._id }
      });

      res.json({
        success: true,
        data: project.team[project.team.length - 1]
      });
    } catch (error) {
      next(error);
    }
  },

  // Remove team member from project
  async removeTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      project.team = project.team.filter(member =>
        member.user.toString() !== userId
      );

      await project.save();

      res.json({
        success: true,
        message: 'Team member removed successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Add milestone to project
  async addMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, dueDate } = req.body;

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      const milestone = {
        title,
        description,
        dueDate: new Date(dueDate),
        completed: false
      };

      project.milestones = project.milestones || [];
      project.milestones.push(milestone);
      await project.save();

      res.json({
        success: true,
        data: milestone
      });
    } catch (error) {
      next(error);
    }
  },

  // Complete milestone
  async completeMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;

      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      const milestone = project.milestones?.find(m => (m as any)._id.toString() === milestoneId);
      if (!milestone) {
        throw new AppError(404, 'Milestone not found');
      }

      milestone.completed = true;
      milestone.completedAt = new Date();
      milestone.completedBy = req.user._id;

      await project.save();

      // Notify team about milestone completion
      const notifications = project.team.map(member =>
        sendNotification({
          user: member.user,
          message: `Milestone "${milestone.title}" completed in project "${project.name}"`,
          type: 'MILESTONE_COMPLETED',
          data: { projectId: project._id, milestoneId }
        })
      );

      await Promise.all(notifications);

      res.json({
        success: true,
        data: milestone
      });
    } catch (error) {
      next(error);
    }
  },

  // Get project analytics
  async getProjectAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId, dateFrom, dateTo } = req.query;

      const matchConditions: any = {};
      if (businessId) matchConditions.business = businessId;
      if (dateFrom || dateTo) {
        matchConditions.createdAt = {};
        if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) matchConditions.createdAt.$lte = new Date(dateTo as string);
      }

      const [
        statusStats,
        priorityStats,
        budgetStats,
        completionStats
      ] = await Promise.all([
        // Status distribution
        Project.aggregate([
          { $match: matchConditions },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        // Priority distribution
        Project.aggregate([
          { $match: matchConditions },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        // Budget analysis
        Project.aggregate([
          { $match: { ...matchConditions, budget: { $exists: true } } },
          {
            $group: {
              _id: null,
              totalBudget: { $sum: '$budget.total' },
              totalSpent: { $sum: '$budget.spent' },
              avgBudget: { $avg: '$budget.total' }
            }
          }
        ]),
        // Completion rate by month
        Project.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: {
                year: { $year: '$createdAt' },
                month: { $month: '$createdAt' }
              },
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
              }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } }
        ])
      ]);

      res.json({
        success: true,
        data: {
          statusDistribution: statusStats,
          priorityDistribution: priorityStats,
          budgetAnalysis: budgetStats[0] || {},
          completionTrends: completionStats
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete project with cascading
  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('business', 'name');

      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Log audit trail before deletion
      await AuditLog.create({
        user: req.user._id,
        business: project.business._id,
        action: 'DELETE_PROJECT',
        resourceType: 'Project',
        resourceId: project._id,
        metadata: {
          projectName: project.name,
          tasksCount: await Task.countDocuments({ project: project._id })
        }
      });

      // Delete associated tasks
      await Task.deleteMany({ project: project._id });

      // Delete project
      await project.deleteOne();

      res.json({
        success: true,
        message: 'Project and associated tasks deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get project tasks with filtering
  async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, assignee, priority, page = 1, limit = 20 } = req.query;

      const filter: any = { project: req.params.id };
      if (status) filter.status = status;
      if (assignee) filter.assignee = assignee;
      if (priority) filter.priority = priority;

      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('assignee', 'name profile avatarUrl status')
          .populate('createdBy', 'name profile')
          .populate('watchers', 'name profile avatarUrl')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Task.countDocuments(filter)
      ]);

      res.json({
        success: true,
        data: {
          tasks,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};