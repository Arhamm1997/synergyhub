import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { Business } from '../models/business.model';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get('/member-quotas', async (req, res) => {
  try {
    const { businessId } = req.query;

    if (!businessId) {
      return res.status(400).json({
        message: 'Business ID is required'
      });
    }

    const business = await Business.findById(businessId);
    if (!business) {
      return res.status(404).json({
        message: 'Business not found'
      });
    }

    // Return current member counts and limits
    res.json({
      quotas: {
        superAdmin: {
          current: business.memberCounts.superAdmin,
          limit: 1
        },
        admin: {
          current: business.memberCounts.admin,
          limit: 20
        },
        member: {
          current: business.memberCounts.member,
          limit: 1000
        },
        client: {
          current: business.memberCounts.client,
          limit: null // No limit for clients
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error fetching member quotas',
      error: error.message
    });
  }
});

export default router;