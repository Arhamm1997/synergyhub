import mongoose from 'mongoose';

export interface ITimeEntry {
    user: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    task?: mongoose.Types.ObjectId;
    description: string;
    startTime: Date;
    endTime?: Date;
    duration?: number; // in minutes
    billable: boolean;
    hourlyRate?: number;
    isManual: boolean; // true if manually entered, false if tracked
    tags?: string[];
    approved: boolean;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    invoiced: boolean;
    invoiceId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITimeSheet {
    user: mongoose.Types.ObjectId;
    business: mongoose.Types.ObjectId;
    weekStarting: Date; // Monday of the week
    entries: mongoose.Types.ObjectId[];
    totalHours: number;
    billableHours: number;
    status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
    submittedAt?: Date;
    approvedBy?: mongoose.Types.ObjectId;
    approvedAt?: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const timeEntrySchema = new mongoose.Schema<ITimeEntry>({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    },
    task: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: Date,
    duration: {
        type: Number,
        min: 0
    },
    billable: {
        type: Boolean,
        default: true
    },
    hourlyRate: Number,
    isManual: {
        type: Boolean,
        default: false
    },
    tags: [String],
    approved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    invoiced: {
        type: Boolean,
        default: false
    },
    invoiceId: String
}, {
    timestamps: true
});

const timeSheetSchema = new mongoose.Schema<ITimeSheet>({
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
    weekStarting: {
        type: Date,
        required: true
    },
    entries: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TimeEntry'
    }],
    totalHours: {
        type: Number,
        default: 0,
        min: 0
    },
    billableHours: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Approved', 'Rejected'],
        default: 'Draft'
    },
    submittedAt: Date,
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: Date,
    notes: String
}, {
    timestamps: true
});

// Pre-save middleware to calculate duration if not provided
timeEntrySchema.pre('save', function (next) {
    if (this.startTime && this.endTime && !this.duration) {
        this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
    }
    next();
});

// Virtual for earnings calculation
timeEntrySchema.virtual('earnings').get(function () {
    if (!this.duration || !this.hourlyRate) return 0;
    return (this.duration / 60) * this.hourlyRate;
});

// Indexes for time entries
timeEntrySchema.index({ user: 1, startTime: -1 });
timeEntrySchema.index({ project: 1 });
timeEntrySchema.index({ task: 1 });
timeEntrySchema.index({ billable: 1 });
timeEntrySchema.index({ approved: 1 });
timeEntrySchema.index({ invoiced: 1 });
timeEntrySchema.index({ tags: 1 });

// Indexes for time sheets
timeSheetSchema.index({ user: 1, weekStarting: -1 }, { unique: true });
timeSheetSchema.index({ business: 1 });
timeSheetSchema.index({ status: 1 });
timeSheetSchema.index({ approvedBy: 1 });

// Include virtuals in JSON
timeEntrySchema.set('toJSON', { virtuals: true });
timeSheetSchema.set('toJSON', { virtuals: true });

export const TimeEntry = mongoose.model<ITimeEntry>('TimeEntry', timeEntrySchema);
export const TimeSheet = mongoose.model<ITimeSheet>('TimeSheet', timeSheetSchema);