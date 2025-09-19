import { Request, Response } from 'express';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';

export class BusinessController {
  async createBusiness(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const owner = req.user?._id;

      const business = new Business({
        name,
        description,
        owner,
        members: [owner]
      });

      await business.save();
      await User.findByIdAndUpdate(owner, { $push: { businesses: business._id } });

      res.status(201).json(business);
    } catch (error) {
      logger.error('Error creating business:', error);
      res.status(500).json({ message: 'Error creating business' });
    }
  }

  async getAllBusinesses(req: Request, res: Response) {
    try {
      const userId = req.user?._id;
      const businesses = await Business.find({ members: userId })
        .populate('owner', 'name email')
        .populate('members', 'name email');

      res.json(businesses);
    } catch (error) {
      logger.error('Error getting businesses:', error);
      res.status(500).json({ message: 'Error getting businesses' });
    }
  }

  async getBusinessById(req: Request, res: Response) {
    try {
      const business = await Business.findById(req.params.id)
        .populate('owner', 'name email')
        .populate('members', 'name email');

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      res.json(business);
    } catch (error) {
      logger.error('Error getting business:', error);
      res.status(500).json({ message: 'Error getting business' });
    }
  }

  async updateBusiness(req: Request, res: Response) {
    try {
      const { name, description } = req.body;
      const business = await Business.findById(req.params.id);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      if (business.owner.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      business.name = name;
      business.description = description;
      await business.save();

      res.json(business);
    } catch (error) {
      logger.error('Error updating business:', error);
      res.status(500).json({ message: 'Error updating business' });
    }
  }

  async deleteBusiness(req: Request, res: Response) {
    try {
      const business = await Business.findById(req.params.id);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      if (business.owner.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      await business.deleteOne();
      await User.updateMany(
        { businesses: business._id },
        { $pull: { businesses: business._id } }
      );

      res.json({ message: 'Business deleted' });
    } catch (error) {
      logger.error('Error deleting business:', error);
      res.status(500).json({ message: 'Error deleting business' });
    }
  }

  async addMember(req: Request, res: Response) {
    try {
      const { email } = req.body;
      const business = await Business.findById(req.params.id);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      if (business.owner.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      const member = await User.findOne({ email });
      if (!member) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (business.members.includes(member._id)) {
        return res.status(400).json({ message: 'User already a member' });
      }

      business.members.push(member._id);
      await business.save();

      await User.findByIdAndUpdate(member._id, {
        $push: { businesses: business._id }
      });

      res.json(business);
    } catch (error) {
      logger.error('Error adding member:', error);
      res.status(500).json({ message: 'Error adding member' });
    }
  }

  async removeMember(req: Request, res: Response) {
    try {
      const { id, memberId } = req.params;
      const business = await Business.findById(id);

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      if (business.owner.toString() !== req.user?._id.toString()) {
        return res.status(403).json({ message: 'Not authorized' });
      }

      if (business.owner.toString() === memberId) {
        return res.status(400).json({ message: 'Cannot remove owner' });
      }

      business.members = business.members.filter(
        m => m.toString() !== memberId
      );
      await business.save();

      await User.findByIdAndUpdate(memberId, {
        $pull: { businesses: business._id }
      });

      res.json(business);
    } catch (error) {
      logger.error('Error removing member:', error);
      res.status(500).json({ message: 'Error removing member' });
    }
  }
}