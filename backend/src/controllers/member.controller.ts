import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Business } from '../models/business.model';
import { AppError } from '../utils/errors';
import { DEFAULT_ROLE_PERMISSIONS } from '../types/enums';

export const membersController = {
    // Get all members for a business
    async getBusinessMembers(req: Request, res: Response, next: NextFunction) {
        try {
            const businessId = req.params.businessId;
            const business = await Business.findById(businessId)
                .populate('members.user', '-password');

            if (!business) {
                throw new AppError('Business not found', 404);
            }

            res.json({
                success: true,
                data: business.members
            });
        } catch (error) {
            next(error);
        }
    },

    // Add a member to a business
    async addBusinessMember(req: Request, res: Response, next: NextFunction) {
        try {
            const { businessId } = req.params;
            const { userId, role } = req.body;

            const business = await Business.findById(businessId);
            if (!business) {
                throw new AppError('Business not found', 404);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            await business.addMember(new mongoose.Types.ObjectId(userId), role);

            // Add business to user's businesses array if not already there
            if (!user.businesses.includes(business._id)) {
                user.businesses.push(business._id);
                if (!user.defaultBusiness) {
                    user.defaultBusiness = business._id;
                }
                await user.save();
            }

            // Update user permissions based on role
            user.permissions = DEFAULT_ROLE_PERMISSIONS[role];
            await user.save();

            res.json({
                success: true,
                message: 'Member added successfully',
                data: await Business.findById(businessId).populate('members.user', '-password')
            });
        } catch (error) {
            next(error);
        }
    },

    // Remove a member from a business
    async removeBusinessMember(req: Request, res: Response, next: NextFunction) {
        try {
            const { businessId, userId } = req.params;

            const business = await Business.findById(businessId);
            if (!business) {
                throw new AppError('Business not found', 404);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            await business.removeMember(new mongoose.Types.ObjectId(userId));

            // Remove business from user's businesses array
            user.businesses = user.businesses.filter(b => !b.equals(business._id));
            if (user.defaultBusiness?.equals(business._id)) {
                user.defaultBusiness = user.businesses[0] || null;
            }
            await user.save();

            res.json({
                success: true,
                message: 'Member removed successfully'
            });
        } catch (error) {
            next(error);
        }
    },

    // Update a member's role in a business
    async updateBusinessMemberRole(req: Request, res: Response, next: NextFunction) {
        try {
            const { businessId, userId } = req.params;
            const { role } = req.body;

            const business = await Business.findById(businessId);
            if (!business) {
                throw new AppError('Business not found', 404);
            }

            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            await business.updateMemberRole(new mongoose.Types.ObjectId(userId), role);

            // Update user permissions based on new role
            user.permissions = DEFAULT_ROLE_PERMISSIONS[role];
            await user.save();

            res.json({
                success: true,
                message: 'Member role updated successfully',
                data: await Business.findById(businessId).populate('members.user', '-password')
            });
        } catch (error) {
            next(error);
        }
    },

    // Update member avatar
    async updateMemberAvatar(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId } = req.params;
            const { avatarUrl, avatarHint } = req.body;

            const user = await User.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }

            user.avatarUrl = avatarUrl;
            user.avatarHint = avatarHint;
            await user.save();

            res.json({
                success: true,
                message: 'Avatar updated successfully',
                data: {
                    avatarUrl: user.avatarUrl,
                    avatarHint: user.avatarHint
                }
            });
        } catch (error) {
            next(error);
        }
    }
};