import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { AppError } from '../middleware/error-handler';
import { sendNotification } from '../services/notification.service';

export const taskController = {
  // Get all tasks
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query.assignee ? { assignee: req.query.assignee } : {};
      
      const tasks = await Task.find(filter)
        .populate('project', 'name')
        .populate('assignee', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single task
  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findById(req.params.id)
        .populate('project', 'name')
        .populate('assignee', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

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

  // Create task
  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      // Check if project exists
      const project = await Project.findById(req.body.project);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      const task = await Task.create({
        ...req.body,
        createdBy: req.user._id
      });

      await task.populate([
        { path: 'project', select: 'name' },
        { path: 'assignee', select: 'name avatarUrl avatarHint' },
        { path: 'createdBy', select: 'name' }
      ]);

      // Send notification to assignee
      await sendNotification({
        user: task.assignee,
        message: `You have been assigned a new task: ${task.title}`,
        type: 'TASK_ASSIGNED',
        data: {
          taskId: task._id,
          projectId: task.project
        }
      });

      res.status(201).json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Update task
  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      )
        .populate('project', 'name')
        .populate('assignee', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      // If status changed to 'Done', notify project team lead
      if (req.body.status === 'Done') {
        const project = await Project.findById(task.project).populate('team');
        const teamLead = project?.team.find((member: any) => member.role === 'Team Lead');
        
        if (teamLead) {
          await sendNotification({
            user: teamLead._id,
            message: `Task "${task.title}" has been marked as complete`,
            type: 'TASK_COMPLETED',
            data: {
              taskId: task._id,
              projectId: task.project
            }
          });
        }
      }

      res.json({
        success: true,
        data: task
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete task
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) {
        throw new AppError(404, 'Task not found');
      }

      await task.deleteOne();

      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
};