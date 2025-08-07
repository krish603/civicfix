import { notificationApi } from './api';

export interface CreateNotificationData {
  type: 'status_update' | 'comment' | 'upvote' | 'downvote' | 'system' | 'mention';
  title: string;
  message: string;
  userId: string;
  actionUrl?: string;
  issueId?: string;
  commentId?: string;
  relatedUserId?: string;
  metadata?: {
    issueTitle?: string;
    commentContent?: string;
    upvoteCount?: number;
    downvoteCount?: number;
  };
}

class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async createNotification(data: CreateNotificationData) {
    try {
      const response = await notificationApi.createNotification(data);
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Error creating notification:', error);
      return null;
    }
  }

  // Notification for when someone comments on a user's issue
  async notifyCommentOnIssue(
    issueOwnerId: string,
    commenterId: string,
    commenterName: string,
    issueId: string,
    issueTitle: string,
    commentContent: string
  ) {
    if (issueOwnerId === commenterId) return; // Don't notify self

    return this.createNotification({
      type: 'comment',
      title: 'New Comment on Your Issue',
      message: `${commenterName} commented on your issue "${issueTitle}"`,
      userId: issueOwnerId,
      actionUrl: `/issue/${issueId}`,
      issueId,
      relatedUserId: commenterId,
      metadata: {
        issueTitle,
        commentContent: commentContent.substring(0, 100) + (commentContent.length > 100 ? '...' : '')
      }
    });
  }

  // Notification for when someone upvotes a user's issue
  async notifyUpvoteOnIssue(
    issueOwnerId: string,
    voterId: string,
    voterName: string,
    issueId: string,
    issueTitle: string,
    upvoteCount: number
  ) {
    if (issueOwnerId === voterId) return; // Don't notify self

    return this.createNotification({
      type: 'upvote',
      title: 'Your Issue Got Upvoted',
      message: `${voterName} upvoted your issue "${issueTitle}"`,
      userId: issueOwnerId,
      actionUrl: `/issue/${issueId}`,
      issueId,
      relatedUserId: voterId,
      metadata: {
        issueTitle,
        upvoteCount
      }
    });
  }

  // Notification for when someone downvotes a user's issue
  async notifyDownvoteOnIssue(
    issueOwnerId: string,
    voterId: string,
    voterName: string,
    issueId: string,
    issueTitle: string,
    downvoteCount: number
  ) {
    if (issueOwnerId === voterId) return; // Don't notify self

    return this.createNotification({
      type: 'downvote',
      title: 'Your Issue Got Downvoted',
      message: `${voterName} downvoted your issue "${issueTitle}"`,
      userId: issueOwnerId,
      actionUrl: `/issue/${issueId}`,
      issueId,
      relatedUserId: voterId,
      metadata: {
        issueTitle,
        downvoteCount
      }
    });
  }

  // Notification for when issue status changes
  async notifyStatusUpdate(
    issueOwnerId: string,
    issueId: string,
    issueTitle: string,
    oldStatus: string,
    newStatus: string
  ) {
    const statusMessages = {
      'pending': 'is now pending review',
      'in_progress': 'is now in progress',
      'resolved': 'has been resolved',
      'under_review': 'is under review',
      'rejected': 'has been rejected',
      'duplicate': 'has been marked as duplicate'
    };

    return this.createNotification({
      type: 'status_update',
      title: 'Issue Status Updated',
      message: `Your issue "${issueTitle}" ${statusMessages[newStatus as keyof typeof statusMessages] || 'status has been updated'}`,
      userId: issueOwnerId,
      actionUrl: `/issue/${issueId}`,
      issueId,
      metadata: {
        issueTitle
      }
    });
  }

  // Notification for when someone mentions a user in a comment
  async notifyMention(
    mentionedUserId: string,
    commenterId: string,
    commenterName: string,
    issueId: string,
    issueTitle: string,
    commentContent: string
  ) {
    if (mentionedUserId === commenterId) return; // Don't notify self

    return this.createNotification({
      type: 'mention',
      title: 'You Were Mentioned',
      message: `${commenterName} mentioned you in a comment on "${issueTitle}"`,
      userId: mentionedUserId,
      actionUrl: `/issue/${issueId}`,
      issueId,
      relatedUserId: commenterId,
      metadata: {
        issueTitle,
        commentContent: commentContent.substring(0, 100) + (commentContent.length > 100 ? '...' : '')
      }
    });
  }

  // System notification
  async notifySystem(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    return this.createNotification({
      type: 'system',
      title,
      message,
      userId,
      actionUrl
    });
  }
}

export const notificationService = NotificationService.getInstance(); 