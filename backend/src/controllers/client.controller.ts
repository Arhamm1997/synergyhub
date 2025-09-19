import { Request, Response, NextFunction } from 'express';
import { Client } from '../models/client.model';
import { Project } from '../models/project.model';
import { AppError } from '../middleware/error-handler';

export const clientController = {
  // Get all clients
  async getClients(req: Request, res: Response, next: NextFunction) {
    try {
      const clients = await Client.find()
        .populate('assignees', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      res.json({
        success: true,
        data: clients
      });
    } catch (error) {
      next(error);
    }
  },

  // Get single client
  async getClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.findById(req.params.id)
        .populate('assignees', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      if (!client) {
        throw new AppError(404, 'Client not found');
      }

      // Get client's projects
      const projects = await Project.find({ client: req.params.id })
        .populate('team', 'name avatarUrl avatarHint');

      res.json({
        success: true,
        data: {
          ...client.toObject(),
          projects
        }
      });
    } catch (error) {
      next(error);
    }
  },

  // Create client
  async createClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.create({
        ...req.body,
        createdBy: req.user._id
      });

      await client.populate([
        { path: 'assignees', select: 'name avatarUrl avatarHint' },
        { path: 'createdBy', select: 'name' }
      ]);

      res.status(201).json({
        success: true,
        data: client
      });
    } catch (error) {
      next(error);
    }
  },

  // Update client
  async updateClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true }
      )
        .populate('assignees', 'name avatarUrl avatarHint')
        .populate('createdBy', 'name');

      if (!client) {
        throw new AppError(404, 'Client not found');
      }

      res.json({
        success: true,
        data: client
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete client
  async deleteClient(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        throw new AppError(404, 'Client not found');
      }

      // Check if client has any projects
      const projectCount = await Project.countDocuments({ client: client._id });
      if (projectCount > 0) {
        throw new AppError(400, 'Cannot delete client with active projects');
      }

      await client.deleteOne();

      res.json({
        success: true,
        data: null
      });
    } catch (error) {
      next(error);
    }
  }
};