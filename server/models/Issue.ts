import mongoose, { Document, Schema } from 'mongoose';

export enum IssueStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  REJECTED = 'rejected',
  DUPLICATE = 'duplicate'
}

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface ILocation {
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface IMetadata {
  [key: string]: any;
}

export interface IIssue extends Document {
  title: string;
  description: string;
  categoryId?: mongoose.Types.ObjectId;
  status: IssueStatus;
  priority: IssuePriority;
  location: ILocation;
  wardId?: mongoose.Types.ObjectId;
  constituencyId?: mongoose.Types.ObjectId;
  reportedBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  assignedDepartmentId?: mongoose.Types.ObjectId;
  estimatedCost?: number;
  actualCost?: number;
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  isAnonymous: boolean;
  isFeatured: boolean;
  isUrgent: boolean;
  tags: string[];
  metadata?: IMetadata;
  resolvedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const locationSchema = new Schema<ILocation>({
  address: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  }
});

const issueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  status: {
    type: String,
    enum: Object.values(IssueStatus),
    default: IssueStatus.PENDING
  },
  priority: {
    type: String,
    enum: Object.values(IssuePriority),
    default: IssuePriority.MEDIUM
  },
  location: {
    type: locationSchema,
    required: true
  },
  wardId: {
    type: Schema.Types.ObjectId,
    ref: 'Ward'
  },
  constituencyId: {
    type: Schema.Types.ObjectId,
    ref: 'Constituency'
  },
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedDepartmentId: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
  },
  estimatedCompletionDate: {
    type: Date
  },
  actualCompletionDate: {
    type: Date
  },
  upvotesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  downvotesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: 0
  },
  sharesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Schema.Types.Mixed
  },
  resolvedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
issueSchema.index({ status: 1 });
issueSchema.index({ categoryId: 1 });
issueSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });
issueSchema.index({ createdAt: -1 });
issueSchema.index({ reportedBy: 1 });
issueSchema.index({ wardId: 1 });
issueSchema.index({ priority: 1 });
issueSchema.index({ isFeatured: 1 });
issueSchema.index({ isUrgent: 1 });
issueSchema.index({ tags: 1 });

// Text search index
issueSchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text'
});

// Virtual for vote difference
issueSchema.virtual('voteDifference').get(function() {
  return this.upvotesCount - this.downvotesCount;
});

// Ensure virtuals are included in JSON
issueSchema.set('toJSON', { virtuals: true });

export const Issue = mongoose.model<IIssue>('Issue', issueSchema); 