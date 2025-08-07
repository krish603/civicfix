import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  type: 'status_update' | 'comment' | 'upvote' | 'downvote' | 'system' | 'mention';
  title: string;
  message: string;
  userId: mongoose.Types.ObjectId;
  read: boolean;
  actionUrl?: string;
  issueId?: mongoose.Types.ObjectId;
  commentId?: mongoose.Types.ObjectId;
  relatedUserId?: mongoose.Types.ObjectId;
  metadata?: {
    issueTitle?: string;
    commentContent?: string;
    upvoteCount?: number;
    downvoteCount?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  type: {
    type: String,
    enum: ['status_update', 'comment', 'upvote', 'downvote', 'system', 'mention'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue'
  },
  commentId: {
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  },
  relatedUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    issueTitle: String,
    commentContent: String,
    upvoteCount: Number,
    downvoteCount: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema); 