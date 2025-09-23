import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { User } from '../models/user.model';
import { AuditLog } from '../models/audit.model';
import { AppError } from '../middleware/error-handler';
import { sendNotification } from '../services/notification.service';

export const taskController = {
  // Get all tasks with advanced filtering and pagination
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        page = 1,
        limit = 10,
        assignee,
        project,
        status,
        priority,
        tags,
        labels,
        dueDate,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter: any = {};

      if (assignee) filter.assignee = assignee;
      if (project) filter.project = project;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (tags) filter.tags = { $in: Array.isArray(tags) ? tags : [tags] };
      if (labels) filter.labels = { $in: Array.isArray(labels) ? labels : [labels] };
      if (dueDate) {
        const date = new Date(dueDate as string);
        filter.dueDate = { $lte: date };
      }
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Calculate pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const skip = (pageNum - 1) * limitNum;

      // Execute query
      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate('project', 'name client')
          .populate('assignee', 'name profile avatarUrl status')
          .populate('createdBy', 'name profile')
          .populate('watchers', 'name profile avatarUrl')
          .populate('dependencies', 'title status')
          .populate('comments.author', 'name profile avatarUrl')
          .sort(sort)
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
  },

  // Get single task with detailed information
  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findById(req.params.id)
        .populate('project', 'name client budget milestones')
        .populate('assignee', 'name profile avatarUrl status department')
        .populate('createdBy', 'name profile')
        .populate('watchers', 'name profile avatarUrl')
        .populate('dependencies', 'title status progress')
        .populate('subtasks.assignee', 'name profile avatarUrl')
        .populate('subtasks.completedBy', 'name profile')
        .populate('comments.author', 'name profile avatarUrl')
        .populate('timeEntries.user', 'name profile avatarUrl');

      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Create task with enhanced features
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if project exists
      const project = await Project.findById(req.body.project);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Check if assignee exists and is part of the project
      const assignee = await User.findById(req.body.assignee);
      if (!assignee) {
        throw new AppError(404, 'Assignee not found');
      }

      // Validate dependencies exist
      if (req.body.dependencies && req.body.dependencies.length > 0) {
        const dependencyTasks = await Task.find({ _id: { $in: req.body.dependencies } });
        if (dependencyTasks.length !== req.body.dependencies.length) {
          throw new AppError(400, 'One or more dependency tasks not found');
        }
      }

      const task = await Task.create({
        ...req.body,
        createdBy: req.user._id,
        watchers: [req.user._id, req.body.assignee] // Auto-add creator and assignee as watchers
      });

      await task.populate([
        { path: 'project', select: 'name client' },
        { path: 'assignee', select: 'name profile avatarUrl' },
        { path: 'createdBy', select: 'name profile' },
        { path: 'watchers', select: 'name profile avatarUrl' },
        { path: 'dependencies', select: 'title status' }
      ]);

      // Log audit trail
      await AuditLog.create({
        user: req.user._id,
        business: project.business,
        action: 'CREATE_TASK',
        resourceType: 'Task',
        resourceId: task._id,
        metadata: { taskTitle: task.title, projectName: project.name }
      });

      // Send notifications
      const notifications = [];

      // Notify assignee
      if (task.assignee.toString() !== req.user._id.toString()) {
        notifications.push(sendNotification({
          user: task.assignee,
          message: `You have been assigned a new task: ${task.title}`,
          type: 'TASK_ASSIGNED',
          data: { taskId: task._id, projectId: task.project }
        }));
      }

      // Notify watchers
      const watchers = task.watchers.filter(w =>
        w._id.toString() !== req.user._id.toString() &&
        w._id.toString() !== task.assignee.toString()
      );

      for (const watcher of watchers) {
        notifications.push(sendNotification({
          user: watcher._id,
          message: `New task created: ${task.title}`,
          type: 'TASK_CREATED',
          data: { taskId: task._id, projectId: task.project }
        }));
      }

      await Promise.all(notifications);

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Update task with change tracking
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const oldTask = await Task.findById(req.params.id);
      if (!oldTask) {
        throw new AppError(404, 'Task not found');
      }

      const updates = { ...req.body };

      // If status is changing to Done, set completion info
      if (updates.status === 'Done' && oldTask.status !== 'Done') {
        updates.completedAt = new Date();
        updates.completedBy = req.user._id;
      }

      const task = await Task.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      )
        .populate('project', 'name client business')
        .populate('assignee', 'name profile avatarUrl')
        .populate('createdBy', 'name profile')
        .populate('watchers', 'name profile avatarUrl')
        .populate('completedBy', 'name profile');

      // Track changes for audit log
      const changes: any = {};
      Object.keys(updates).forEach(key => {
        if (oldTask[key as keyof typeof oldTask] !== updates[key]) {
          changes[key] = {
            old: oldTask[key as keyof typeof oldTask],
            new: updates[key]
          };
        }
      });

      // Log audit trail
      if (Object.keys(changes).length > 0) {
        await AuditLog.create({
          user: req.user._id,
          business: (task.project as any).business,
          action: 'UPDATE_TASK',
          resourceType: 'Task',
          resourceId: task._id,
          changes,
          metadata: { taskTitle: task.title }
        });
      }

      // Send notifications for status changes
      if (changes.status) {
        const notifications = [];

        if (changes.status.new === 'Done') {
          // Notify project team lead
          const project = await Project.findById(task.project).populate('team.user projectManager');
          const teamLead = project?.projectManager || project?.team.find((member: any) =>
            member.role.toLowerCase().includes('lead') ||
            member.role.toLowerCase().includes('manager')
          )?.user;

          if (teamLead && teamLead.toString() !== req.user._id.toString()) {
            notifications.push(sendNotification({
              user: teamLead,
              message: `Task "${task.title}" has been marked as complete`,
              type: 'TASK_COMPLETED',
              data: { taskId: task._id, projectId: task.project }
            }));
          }

          // Notify all watchers
          task.watchers.forEach((watcher: any) => {
            if (watcher._id.toString() !== req.user._id.toString()) {
              notifications.push(sendNotification({
                user: watcher._id,
                message: `Task "${task.title}" has been completed`,
                type: 'TASK_COMPLETED',
                data: { taskId: task._id, projectId: task.project }
              }));
            }
          });
        }

        if (changes.assignee) {
          // Notify new assignee
          notifications.push(sendNotification({
            user: changes.assignee.new,
            message: `You have been assigned to task: ${task.title}`,
            type: 'TASK_ASSIGNED',
            data: { taskId: task._id, projectId: task.project }
          }));
        }

        await Promise.all(notifications);
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Add comment to task
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const { content } = req.body;
      if (!content || !content.trim()) {
        throw new AppError(400, 'Comment content is required');
      }

      const task = await Task.findById(req.params.id);
      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      const comment = {
        author: req.user._id,
        content: content.trim(),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      task.comments = task.comments || [];
      task.comments.push(comment);
      await task.save();

      await task.populate('comments.author', 'name profile avatarUrl');

      // Notify watchers
      const notifications = task.watchers?.map((watcher: any) => {
        if (watcher.toString() !== req.user._id.toString()) {
          return sendNotification({
            user: watcher,
            message: `New comment on task "${task.title}"`,
            type: 'TASK_COMMENT',
            data: { taskId: task._id }
          });
        }
      }).filter(Boolean) || [];

      await Promise.all(notifications);

      res.status(201).json({
        success: true,
        data: task.comments[task.comments.length - 1]
      });
    } catch (error) {
      next(error);
    }
  },

  // Add time entry to task
  async addTimeEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const { startTime, endTime, duration, description } = req.body;

      const task = await Task.findById(req.params.id);
      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      const timeEntry = {
        user: req.user._id,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
        duration,
        description
      };

      // Calculate duration if not provided
      if (!timeEntry.duration && timeEntry.endTime) {
        timeEntry.duration = Math.round((timeEntry.endTime.getTime() - timeEntry.startTime.getTime()) / (1000 * 60));
      }

      task.timeEntries = task.timeEntries || [];
      task.timeEntries.push(timeEntry);
      await task.save();

      res.status(201).json({
        success: true,
        data: timeEntry
      });
    } catch (error) {
      next(error);
    }
  },

  // Toggle task watcher
  async toggleWatcher(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      const userId = req.user._id;
      const watchers = task.watchers || [];
      const isWatching = watchers.some(w => w.toString() === userId.toString());

      if (isWatching) {
        task.watchers = watchers.filter(w => w.toString() !== userId.toString());
      } else {
        task.watchers = [...watchers, userId];
      }

      await task.save();

      res.json({
        success: true,
        data: {
          isWatching: !isWatching,
          watchersCount: task.watchers.length
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete task with audit trail
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findById(req.params.id).populate('project', 'business name');
      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      // Log audit trail before deletion
      await AuditLog.create({
        user: req.user._id,
        business: (task.project as any).business,
        action: 'DELETE_TASK',
        resourceType: 'Task',
        resourceId: task._id,
        metadata: {
          taskTitle: task.title,
          projectName: (task.project as any).name
        }
      });

      await task.deleteOne();

      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  // Get task analytics
  async getTaskAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const { project, assignee, dateFrom, dateTo } = req.query;

      const matchConditions: any = {};
      if (project) matchConditions.project = project;
      if (assignee) matchConditions.assignee = assignee;
      if (dateFrom || dateTo) {
        matchConditions.createdAt = {};
        if (dateFrom) matchConditions.createdAt.$gte = new Date(dateFrom as string);
        if (dateTo) matchConditions.createdAt.$lte = new Date(dateTo as string);
      }

      const [statusStats, priorityStats, overdueTasks, completionRate] = await Promise.all([
        // Status distribution
        Task.aggregate([
          { $match: matchConditions },
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ]),
        // Priority distribution
        Task.aggregate([
          { $match: matchConditions },
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]),
        // Overdue tasks
        Task.countDocuments({
          ...matchConditions,
          dueDate: { $lt: new Date() },
          status: { $ne: 'Done' }
        }),
        // Completion rate
        Task.aggregate([
          { $match: matchConditions },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ['$status', 'Done'] }, 1, 0] }
              }
            }
          }
        ])
      ]);

      const completionRatePercentage = completionRate[0] ?
        Math.round((completionRate[0].completed / completionRate[0].total) * 100) : 0;

      res.json({
        success: true,
        data: {
          statusDistribution: statusStats,
          priorityDistribution: priorityStats,
          overdueTasks,
          completionRate: completionRatePercentage,
          totalTasks: completionRate[0]?.total || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }
};