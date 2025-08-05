import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  issueId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  content: string;
  isOfficial: boolean;
  isSolution: boolean;
  likesCount: number;
  isEdited: boolean;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  isOfficial: {
    type: Boolean,
    default: false
  },
  isSolution: {
    type: Boolean,
    default: false
  },
  likesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  deletedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ issueId: 1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentId: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ isOfficial: 1 });
commentSchema.index({ isSolution: 1 });

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

// Ensure virtuals are included in JSON
commentSchema.set('toJSON', { virtuals: true });

export const Comment = mongoose.model<IComment>('Comment', commentSchema); 