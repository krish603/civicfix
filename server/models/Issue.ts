import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IIssue extends Document {
  title: string;
  description: string;
  categoryId?: Types.ObjectId;
  status: 'pending' | 'under_review' | 'approved' | 'in_progress' | 'resolved' | 'rejected' | 'duplicate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  locationAddress: string;
  latitude?: number;
  longitude?: number;
  wardId?: Types.ObjectId;
  constituencyId?: Types.ObjectId;
  reportedBy: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  assignedDepartmentId?: Types.ObjectId;
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
  images: {
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    fileSize?: number;
    fileType?: string;
    isPrimary: boolean;
  }[];
  metadata?: Record<string, any>;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IssueSchema = new Schema<IIssue>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'in_progress', 'resolved', 'rejected', 'duplicate'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  locationAddress: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  latitude: {
    type: Number,
    min: [-90, 'Invalid latitude'],
    max: [90, 'Invalid latitude']
  },
  longitude: {
    type: Number,
    min: [-180, 'Invalid longitude'],
    max: [180, 'Invalid longitude']
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
    min: [0, 'Cost cannot be negative']
  },
  actualCost: {
    type: Number,
    min: [0, 'Cost cannot be negative']
  },
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  upvotesCount: {
    type: Number,
    default: 0,
    min: [0, 'Upvotes count cannot be negative']
  },
  downvotesCount: {
    type: Number,
    default: 0,
    min: [0, 'Downvotes count cannot be negative']
  },
  commentsCount: {
    type: Number,
    default: 0,
    min: [0, 'Comments count cannot be negative']
  },
  viewsCount: {
    type: Number,
    default: 0,
    min: [0, 'Views count cannot be negative']
  },
  sharesCount: {
    type: Number,
    default: 0,
    min: [0, 'Shares count cannot be negative']
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
    trim: true,
    lowercase: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    altText: String,
    fileSize: Number,
    fileType: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  metadata: {
    type: Schema.Types.Mixed
  },
  resolvedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
IssueSchema.index({ status: 1 });
IssueSchema.index({ priority: 1 });
IssueSchema.index({ reportedBy: 1 });
IssueSchema.index({ createdAt: -1 });
IssueSchema.index({ locationAddress: 'text', title: 'text', description: 'text' });
IssueSchema.index({ latitude: 1, longitude: 1 });
IssueSchema.index({ tags: 1 });
IssueSchema.index({ upvotesCount: -1 });

// Virtual for total votes
IssueSchema.virtual('totalVotes').get(function() {
  return this.upvotesCount - this.downvotesCount;
});

// Virtual for vote score (upvotes - downvotes)
IssueSchema.virtual('voteScore').get(function() {
  const total = this.upvotesCount + this.downvotesCount;
  if (total === 0) return 0;
  return (this.upvotesCount / total) * 100;
});

// Pre-save middleware to set resolvedAt when status changes to resolved
IssueSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

export default mongoose.model<IIssue>('Issue', IssueSchema);
