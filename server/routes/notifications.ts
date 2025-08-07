import { Router, Request, Response } from 'express';
import { Notification } from '../models';
import { authenticate } from '../middleware/auth';
import { mockDataService } from '../services/mockData';
import mongoose from 'mongoose';

const router = Router();

// Get user's notifications
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const notifications = await mockDataService.getNotifications(req.user._id);
      return res.json({
        success: true,
        data: notifications
      });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const filter: any = { userId: req.user._id };
    if (unreadOnly === 'true') {
      filter.read = false;
    }

    const notifications = await Notification.find(filter)
      .populate('issueId', 'title')
      .populate('commentId', 'content')
      .populate('relatedUserId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Notification.countDocuments(filter);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const result = await mockDataService.markNotificationAsRead(req.params.id, req.user._id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      return res.json({
        success: true,
        message: 'Notification marked as read'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      await mockDataService.markAllNotificationsAsRead(req.user._id);
      return res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    }

    await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete notification
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const result = await mockDataService.deleteNotification(req.params.id, req.user._id);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }
      return res.json({
        success: true,
        message: 'Notification deleted'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create notification (for internal use)
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      type,
      title,
      message,
      userId,
      actionUrl,
      issueId,
      commentId,
      relatedUserId,
      metadata
    } = req.body;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const notification = await mockDataService.createNotification({
        type,
        title,
        message,
        userId,
        actionUrl,
        issueId,
        commentId,
        relatedUserId,
        metadata
      });
      return res.status(201).json({
        success: true,
        message: 'Notification created',
        data: { notification }
      });
    }

    const notification = new Notification({
      type,
      title,
      message,
      userId,
      actionUrl,
      issueId,
      commentId,
      relatedUserId,
      metadata
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: 'Notification created',
      data: { notification }
    });
  } catch (error: any) {
    console.error('Create notification error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 