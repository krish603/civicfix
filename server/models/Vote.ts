import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IVote extends Document {
  userId: Types.ObjectId;
  issueId: Types.ObjectId;
  voteType: 'upvote' | 'downvote';
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
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
    enum: ['upvote', 'downvote'],
    required: true
  }
}, {
  timestamps: true
});

// Ensure one vote per user per issue
VoteSchema.index({ userId: 1, issueId: 1 }, { unique: true });
VoteSchema.index({ issueId: 1 });
VoteSchema.index({ userId: 1 });

// Update issue vote counts when vote is created/updated/deleted
VoteSchema.post('save', async function() {
  const Issue = mongoose.model('Issue');
  await updateIssueVoteCounts(Issue, this.issueId);
});

VoteSchema.post('remove', async function() {
  const Issue = mongoose.model('Issue');
  await updateIssueVoteCounts(Issue, this.issueId);
});

VoteSchema.post('findOneAndDelete', async function() {
  if (this) {
    const Issue = mongoose.model('Issue');
    await updateIssueVoteCounts(Issue, this.issueId);
  }
});

// Helper function to update issue vote counts
async function updateIssueVoteCounts(Issue: any, issueId: Types.ObjectId) {
  const votes = await mongoose.model('Vote').aggregate([
    { $match: { issueId } },
    {
      $group: {
        _id: '$voteType',
        count: { $sum: 1 }
      }
    }
  ]);

  const upvotes = votes.find(v => v._id === 'upvote')?.count || 0;
  const downvotes = votes.find(v => v._id === 'downvote')?.count || 0;

  await Issue.findByIdAndUpdate(issueId, {
    upvotesCount: upvotes,
    downvotesCount: downvotes
  });
}

export default mongoose.model<IVote>('Vote', VoteSchema);
