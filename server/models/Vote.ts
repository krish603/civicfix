import mongoose, { Document, Schema } from 'mongoose';

export enum VoteType {
  UPVOTE = 'upvote',
  DOWNVOTE = 'downvote'
}

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  issueId: mongoose.Types.ObjectId;
  voteType: VoteType;
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<IVote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  issueId: {
    type: Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  voteType: {
    type: String,
    enum: Object.values(VoteType),
    required: true
  }
}, {
  timestamps: true
});

// Compound unique index to prevent duplicate votes
voteSchema.index({ userId: 1, issueId: 1 }, { unique: true });

// Indexes for performance
voteSchema.index({ issueId: 1 });
voteSchema.index({ userId: 1 });
voteSchema.index({ voteType: 1 });
voteSchema.index({ createdAt: -1 });

export const Vote = mongoose.model<IVote>('Vote', voteSchema); 