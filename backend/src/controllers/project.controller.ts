import { Request, Response, NextFunction } from 'express';
import { Project } from '../models/project.model';
import { Task } from '../models/task.model';
import { AppError } from '../middleware/error-handler';

export const projectController = {
  // Get all projects
  async getProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await Project.find()
        .populate('client', 'name logoUrl')
        .populate('team', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      res.json({
        success: true,
        data: projects
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single project
  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findById(req.params.id)
        .populate('client', 'name logoUrl')
        .populate('team', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  // Create project
  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.create({
        ...req.body,
        createdBy: req.user._id
      });

      await project.populate([
        { path: 'client', select: 'name logoUrl' },
        { path: 'team', select: 'name avatarUrl avatarHint' },
        { path: 'createdBy', select: 'name' }
      ]);

      res.status(201).json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  // Update project
  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      )
        .populate('client', 'name logoUrl')
        .populate('team', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      res.json({
        success: true,
        data: project
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete project
  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await Project.findById(req.params.id);
      if (!project) {
        throw new AppError(404, 'Project not found');
      }

      // Delete associated tasks
      await Task.deleteMany({ project: project._id });

      // Delete project
      await project.deleteOne();

      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  },

  // Get project tasks
  async getProjectTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const tasks = await Task.find({ project: req.params.id })
        .populate('assignee', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      res.json({
        success: true,
        data: tasks
      });
    } catch (error) {
      next(error);
    }
  }
};