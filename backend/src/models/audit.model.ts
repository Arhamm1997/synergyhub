import mongoose from 'mongoose';

export interface IAuditLog {
    user: mongoose.Types.ObjectId;
    business: mongoose.Types.ObjectId;
    action: string; // e.g., 'CREATE_TASK', 'UPDATE_PROJECT', 'DELETE_USER'
    resourceType: string; // e.g., 'Task', 'Project', 'User'
    resourceId: mongoose.Types.ObjectId;
    changes?: Record<string, { old: any; new: any }>;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    timestamp: Date;
}

export interface ISystemEvent {
    type: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCOUNT_LOCK' | 'PERMISSION_CHANGE' | 'SYSTEM_CONFIG' | 'USER_REGISTRATION';
    user?: mongoose.Types.ObjectId;
    business?: mongoose.Types.ObjectId;
    description: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    metadata?: Record<string, any>;
    ipAddress?: string;
    resolved: boolean;
    resolvedBy?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    timestamp: Date;
}

const auditLogSchema = new mongoose.Schema<IAuditLog>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    changes: {
        type: mongoose.Schema.Types.Mixed
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const systemEventSchema = new mongoose.Schema<ISystemEvent>({
    type: {
        type: String,
        enum: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'ACCOUNT_LOCK', 'PERMISSION_CHANGE', 'SYSTEM_CONFIG', 'USER_REGISTRATION'],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business'
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Low'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    resolved: {
        type: Boolean,
        default: false
    },
    resolvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolvedAt: Date,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Indexes for audit logs
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ business: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1 });
auditLogSchema.index({ timestamp: -1 });

// Indexes for system events
systemEventSchema.index({ type: 1, timestamp: -1 });
systemEventSchema.index({ user: 1, timestamp: -1 });
systemEventSchema.index({ business: 1, timestamp: -1 });
systemEventSchema.index({ severity: 1 });
systemEventSchema.index({ resolved: 1 });
systemEventSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs after 1 year
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
systemEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
export const SystemEvent = mongoose.model<ISystemEvent>('SystemEvent', systemEventSchema);