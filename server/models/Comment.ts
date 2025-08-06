import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IComment extends Document {
  issueId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId;
  content: string;
  isOfficial: boolean;
  isSolution: boolean;
  likesCount: number;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
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
    ref: 'Comment',
    default: null
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
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
    min: [0, 'Likes count cannot be negative']
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
CommentSchema.index({ issueId: 1, createdAt: -1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ parentId: 1 });

// Virtual for replies
CommentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentId'
});

// Pre-save middleware to set editedAt when content is modified
CommentSchema.pre('save', function(next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

// Update issue comment count when comment is created/deleted
CommentSchema.post('save', async function() {
  if (this.isNew) {
    await mongoose.model('Issue').findByIdAndUpdate(
      this.issueId,
      { $inc: { commentsCount: 1 } }
    );
  }
});

CommentSchema.post('remove', async function() {
  await mongoose.model('Issue').findByIdAndUpdate(
    this.issueId,
    { $inc: { commentsCount: -1 } }
  );
});

export default mongoose.model<IComment>('Comment', CommentSchema);
