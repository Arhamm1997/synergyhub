import mongoose from 'mongoose';

export interface ITeamMember {
    user: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
    permissions?: string[];
}

export interface ITeam {
    name: string;
    description?: string;
    business: mongoose.Types.ObjectId;
    lead: mongoose.Types.ObjectId;
    members: ITeamMember[];
    projects?: mongoose.Types.ObjectId[];
    isActive: boolean;
    tags?: string[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const teamMemberSchema = new mongoose.Schema<ITeamMember>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'Member'
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    permissions: [String]
});

const teamSchema = new mongoose.Schema<ITeam>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true
    },
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [teamMemberSchema],
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [String],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Virtual for member count
teamSchema.virtual('memberCount').get(function () {
    return this.members ? this.members.length : 0;
});

// Virtual for active projects count
teamSchema.virtual('activeProjectsCount', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'team',
    count: true,
    match: { status: { $ne: 'Completed' } }
});

// Include virtuals in JSON
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

// Indexes
teamSchema.index({ name: 1, business: 1 }, { unique: true });
teamSchema.index({ business: 1 });
teamSchema.index({ lead: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ isActive: 1 });
teamSchema.index({ tags: 1 });

export const Team = mongoose.model<ITeam>('Team', teamSchema);