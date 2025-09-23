/**
 * Database cleanup script to remove all existing data for a fresh start
 * This script will clean:
 * - All users
 * - All businesses
 * - All invitations  
 * - All system events
 * - All audit logs
 */

import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Business } from '../models/business.model';
import { Invitation } from '../models/invitation.model';
import { SystemEvent, AuditLog } from '../models/audit.model';
import { config } from '../config';
import { logger } from './logger';

async function cleanupDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongoUri, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 30000,
        });
        logger.info('Connected to MongoDB for cleanup');

        // Get counts before cleanup
        const userCount = await User.countDocuments();
        const businessCount = await Business.countDocuments();
        const invitationCount = await Invitation.countDocuments();
        const systemEventCount = await SystemEvent.countDocuments();
        const auditLogCount = await AuditLog.countDocuments();

        logger.info('Current database state:', {
            users: userCount,
            businesses: businessCount,
            invitations: invitationCount,
            systemEvents: systemEventCount,
            auditLogs: auditLogCount
        });

        // Perform cleanup operations
        logger.info('Starting database cleanup...');

        // Delete all collections
        await User.deleteMany({});
        logger.info('✓ Deleted all users');

        await Business.deleteMany({});
        logger.info('✓ Deleted all businesses');

        await Invitation.deleteMany({});
        logger.info('✓ Deleted all invitations');

        await SystemEvent.deleteMany({});
        logger.info('✓ Deleted all system events');

        await AuditLog.deleteMany({});
        logger.info('✓ Deleted all audit logs');

        // Verify cleanup
        const finalUserCount = await User.countDocuments();
        const finalBusinessCount = await Business.countDocuments();
        const finalInvitationCount = await Invitation.countDocuments();
        const finalSystemEventCount = await SystemEvent.countDocuments();
        const finalAuditLogCount = await AuditLog.countDocuments();

        logger.info('Database cleanup completed! Final state:', {
            users: finalUserCount,
            businesses: finalBusinessCount,
            invitations: finalInvitationCount,
            systemEvents: finalSystemEventCount,
            auditLogs: finalAuditLogCount
        });

        console.log('\n🎉 Database cleanup successful!');
        console.log('✅ All existing data has been removed');
        console.log('✅ Ready for fresh invitation system testing');
        console.log('✅ First user signup will become admin');

    } catch (error) {
        logger.error('Database cleanup failed:', error);
        console.error('\n❌ Database cleanup failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        logger.info('Disconnected from MongoDB');
    }
}

// Run cleanup if called directly
if (require.main === module) {
    cleanupDatabase()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('Cleanup script error:', error);
            process.exit(1);
        });
}

export { cleanupDatabase };