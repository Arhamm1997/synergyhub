import { Request, Response } from 'express';
import { Invitation } from '../models/invitation.model';
import { User } from '../models/user.model';
import { Business } from '../models/business.model';
import { sendInvitationEmail } from '../services/email.service';
import { logger } from '../utils/logger';
import { config } from '../config';
import crypto from 'crypto';

export class InvitationController {
  static async sendInvitation(req: Request, res: Response) {
    try {
      const { email, role, businessId } = req.body;
      const invitedBy = req.user.id;

      // Only admins and super admins can send invitations
      if (!['Admin', 'SuperAdmin'].includes(req.user.role)) {
        return res.status(403).json({
          message: 'Only administrators can send invitations',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists',
        });
      }

      // Check if there's an active invitation
      const existingInvitation = await Invitation.findOne({
        email,
        businessId,
        status: 'pending',
      });
      if (existingInvitation) {
        return res.status(400).json({
          message: 'An invitation has already been sent to this email',
        });
      }

      // If inviting as Admin, check admin limit (20 max)
      if (role === 'Admin') {
        const currentAdminCount = await User.countDocuments({
          role: 'Admin',
          businessId: businessId
        });

        if (currentAdminCount >= 20) {
          return res.status(400).json({
            message: 'Maximum admin limit reached (20 admins maximum)',
            currentAdmins: currentAdminCount,
            maxAdmins: 20
          });
        }
      }

      // Generate invitation token
      const token = crypto.randomBytes(32).toString('hex');

      // Create invitation with expiry of 7 days
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      const invitation = await Invitation.create({
        email,
        token,
        invitedBy,
        businessId,
        role,
        expiresAt,
      });

      // Get business name
      const business = await Business.findById(businessId);
      const businessName = business ? business.name : undefined;
      const inviterName = req.user.name;

      // Send invitation email with role-specific template
      const inviteUrl = `${config.frontendUrl}/signup?token=${token}`;
      await sendInvitationEmail(email, inviteUrl, role as "Admin" | "Member" | "Client", businessName, inviterName);

      return res.status(201).json({
        message: 'Invitation sent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        },
      });
    } catch (error) {
      logger.error('Error sending invitation:', error);
      return res.status(500).json({
        message: 'Error sending invitation',
        error: error.message,
      });
    }
  }

  static async resendInvitation(req: Request, res: Response) {
    try {
      const { invitationId } = req.params;

      const invitation = await Invitation.findById(invitationId);
      if (!invitation) {
        return res.status(404).json({
          message: 'Invitation not found',
        });
      }

      // Update expiry date
      invitation.expiresAt = new Date();
      invitation.expiresAt.setDate(invitation.expiresAt.getDate() + 7);
      invitation.status = 'pending';
      await invitation.save();

      // Get business name and inviter name
      const business = await Business.findById(invitation.business);
      const businessName = business ? business.name : undefined;
      const inviter = await User.findById(invitation.invitedBy);
      const inviterName = inviter ? inviter.name : undefined;

      // Resend invitation email with role-specific template
      const inviteUrl = `${config.frontendUrl}/signup?token=${invitation.token}`;
      await sendInvitationEmail(invitation.email, inviteUrl, invitation.role as "Admin" | "Member" | "Client", businessName, inviterName);

      return res.status(200).json({
        message: 'Invitation resent successfully',
        invitation: {
          id: invitation._id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
        },
      });
    } catch (error) {
      logger.error('Error resending invitation:', error);
      return res.status(500).json({
        message: 'Error resending invitation',
        error: error.message,
      });
    }
  }

  static async cancelInvitation(req: Request, res: Response) {
    try {
      const { invitationId } = req.params;

      const invitation = await Invitation.findByIdAndDelete(invitationId);
      if (!invitation) {
        return res.status(404).json({
          message: 'Invitation not found',
        });
      }

      return res.status(200).json({
        message: 'Invitation cancelled successfully',
      });
    } catch (error) {
      logger.error('Error cancelling invitation:', error);
      return res.status(500).json({
        message: 'Error cancelling invitation',
        error: error.message,
      });
    }
  }

  static async getBusinessInvitations(req: Request, res: Response) {
    try {
      const { businessId } = req.params;

      // If no businessId provided, use the user's default business
      let targetBusinessId = businessId;
      if (!targetBusinessId) {
        targetBusinessId = req.user.defaultBusiness || req.user.businesses?.[0];
      }

      if (!targetBusinessId) {
        return res.status(400).json({
          message: 'No business ID provided and user has no associated business',
        });
      }

      const invitations = await Invitation.find({ businessId: targetBusinessId })
        .populate('invitedBy', 'name email')
        .sort({ createdAt: -1 })
        .select('-token');

      return res.status(200).json({
        invitations,
      });
    } catch (error) {
      logger.error('Error getting business invitations:', error);
      return res.status(500).json({
        message: 'Error getting business invitations',
        error: error.message,
      });
    }
  }

  static async validateInvitation(req: Request, res: Response) {
    try {
      const { token } = req.query;

      const invitation = await Invitation.findOne({
        token,
        status: 'pending',
        expiresAt: { $gt: new Date() },
      });

      if (!invitation) {
        return res.status(404).json({
          message: 'Invalid or expired invitation',
        });
      }

      return res.status(200).json({
        invitation: {
          email: invitation.email,
          businessId: invitation.business,
          role: invitation.role,
        },
      });
    } catch (error) {
      logger.error('Error validating invitation:', error);
      return res.status(500).json({
        message: 'Error validating invitation',
        error: error.message,
      });
    }
  }
}