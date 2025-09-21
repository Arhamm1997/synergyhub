import { Request, Response } from 'express';
import { Business } from '../models/business.model';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export class BusinessController {
  // Helper method to validate ObjectId
  private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

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
      const { businessId } = req.params;

      // Validate ObjectId
      if (!this.isValidObjectId(businessId)) {
        return res.status(400).json({ message: 'Invalid business ID format' });
      }

      const business = await Business.findById(businessId)
        .populate('owner', 'name email')
        .populate('members', 'name email');

      if (!business) {
        return res.status(404).json({ message: 'Business not found' });
      }

      // Check if user is member of this business
      const userId = req.user?._id;
      const isMember = business.members.some((member: any) => 
        member._id.toString() === userId?.toString()
      );

      if (!isMember) {
        return res.status(403).json({ message: 'Not authorized to view this business' });
      }

      res.json(business);
    } catch (error) {
      logger.error('Error getting business:', error);
      res.status(500).json({ message: 'Error getting business' });
    }
  }

  async getMemberQuotas(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      logger.info(`Getting member quotas for business: ${businessId}`);

      if (!req.user?._id) {
        logger.error('No user found in request');
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Validate ObjectId
      if (!this.isValidObjectId(businessId)) {
        logger.warn(`Invalid business ID format: ${businessId}`);
        return res.status(400).json({ message: 'Invalid business ID format' });
      }

      const business = await Business.findById(businessId)
        .populate('members', 'name email')
        .populate('owner', '_id');

      if (!business) {
        logger.warn(`Business not found: ${businessId}`);
        return res.status(404).json({ message: 'Business not found' });
      }

      // Check if user is member of this business
      const userId = req.user._id;
      const isMember = business.members.some((member: any) => 
        member._id.toString() === userId?.toString()
      );

      if (!isMember) {
        logger.warn(`User ${userId} not authorized to view business ${businessId}`);
        return res.status(403).json({ message: 'Not authorized to view this business' });
      }

      // Generate member quotas with role-based limits
      const memberQuotas = business.members.map((member: any) => {
        const isOwner = member._id.toString() === business.owner.toString();
        const role = isOwner ? 'owner' : 'member';

        return {
          memberId: member._id,
          memberName: member.name,
          memberEmail: member.email,
          role,
          quotas: {
            tasks: {
              limit: isOwner ? -1 : 100, // -1 means unlimited
              used: 0
            },
            projects: {
              limit: isOwner ? -1 : 10,
              used: 0
            },
            storage: {
              limit: isOwner ? -1 : 5120, // 5GB in MB
              used: 0
            }
          }
        };
      });

      const response = {
        businessId: business._id,
        businessName: business.name,
        memberQuotas,
        quotaLimits: {
          maxMembers: 1000,
          maxAdmins: 20,
          currentMembers: business.members.length,
          currentAdmins: business.members.filter((m: any) => m.role === 'admin').length
        }
      };

      logger.info(`Successfully retrieved quotas for business ${businessId}`);
      res.json(response);
    } catch (error) {
      logger.error('Error getting member quotas:', error);
      res.status(500).json({ 
        message: 'Error getting member quotas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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