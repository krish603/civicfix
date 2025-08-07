import { Router, Request, Response } from 'express';
import { Issue, Vote, Comment, Category } from '../models';
import { authenticate, optionalAuth } from '../middleware/auth';
import { mockDataService } from '../services/mockData';
import mongoose from 'mongoose';

const router = Router();

// Get all issues with filtering, sorting, and pagination
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const result = await mockDataService.getIssues(req.query);
      return res.json({
        success: true,
        data: result
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      location,
      userId
    } = req.query;

    // Build filter object
    const filter: any = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.categoryId = category;
    if (userId) filter.reportedBy = userId;

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { locationAddress: { $regex: search, $options: 'i' } }
      ];
    }

    if (location) {
      filter.locationAddress = { $regex: location, $options: 'i' };
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get issues with population
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name avatar')
      .populate('categoryId', 'name iconName colorHex')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Issue.countDocuments(filter);

    // If user is authenticated, get their votes for these issues
    let userVotes: any = {};
    if (req.user) {
      const issueIds = issues.map(issue => issue._id);
      const votes = await Vote.find({
        userId: req.user._id,
        issueId: { $in: issueIds }
      });

      userVotes = votes.reduce((acc: any, vote: any) => {
        acc[vote.issueId.toString()] = vote.voteType;
        return acc;
      }, {});
    }

    // Add user vote information to issues
    const issuesWithVotes = issues.map(issue => ({
      ...issue,
      hasUserVoted: userVotes[issue._id.toString()] || null
    }));

    res.json({
      success: true,
      data: {
        issues: issuesWithVotes,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get issues reported by the current user
router.get('/user', authenticate, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const userIssues = await mockDataService.getUserIssues(req.user._id);
      return res.json({
        success: true,
        data: userIssues
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter: any = {
      reportedBy: req.user._id
    };

    if (status) filter.status = status;

    // Build sort object
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Get user's issues with population
    const issues = await Issue.find(filter)
      .populate('reportedBy', 'name avatar')
      .populate('categoryId', 'name iconName colorHex')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Issue.countDocuments(filter);

    // Get user's votes for these issues
    const issueIds = issues.map(issue => issue._id);
    const votes = await Vote.find({
      userId: req.user._id,
      issueId: { $in: issueIds }
    });

    const userVotes = votes.reduce((acc: any, vote: any) => {
      acc[vote.issueId.toString()] = vote.voteType;
      return acc;
    }, {});

    // Add user vote information to issues
    const issuesWithVotes = issues.map(issue => ({
      ...issue,
      hasUserVoted: userVotes[issue._id.toString()] || null
    }));

    res.json({
      success: true,
      data: issuesWithVotes
    });
  } catch (error) {
    console.error('Get user issues error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single issue by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const issue = await mockDataService.getIssueById(req.params.id);
      
      if (!issue) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      // Increment view count
      issue.viewsCount += 1;

      // Set user vote based on authentication
      let hasUserVoted = null;
      if (req.user) {
        hasUserVoted = issue.hasUserVoted;
      }

      return res.json({
        success: true,
        data: {
          issue: {
            ...issue,
            hasUserVoted
          }
        }
      });
    }

    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name avatar location')
      .populate('categoryId', 'name iconName colorHex')
      .populate('assignedTo', 'name avatar')
      .populate('assignedDepartmentId', 'name email phone');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Increment view count
    await Issue.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } });

    // Get user's vote if authenticated
    let hasUserVoted = null;
    if (req.user) {
      const vote = await Vote.findOne({
        userId: req.user._id,
        issueId: issue._id
      });
      hasUserVoted = vote ? vote.voteType : null;
    }

    res.json({
      success: true,
      data: {
        issue: {
          ...issue.toObject(),
          hasUserVoted
        }
      }
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new issue
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      categoryId,
      locationAddress,
      latitude,
      longitude,
      priority,
      tags,
      images,
      isAnonymous = false
    } = req.body;

    // Validate required fields
    if (!title || !description || !locationAddress) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and location are required'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const issue = await mockDataService.createIssue({
        title,
        description,
        categoryId,
        locationAddress,
        priority,
        tags,
        images
      });

      return res.status(201).json({
        success: true,
        message: 'Issue created successfully',
        data: { issue }
      });
    }

    // Handle category - could be ID or name
    let actualCategoryId = null;
    if (categoryId) {
      // Check if it's a valid ObjectId first
      if (mongoose.Types.ObjectId.isValid(categoryId)) {
        const category = await Category.findById(categoryId);
        if (!category || !category.isActive) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category'
          });
        }
        actualCategoryId = categoryId;
             } else {
         // Try to find category by name with flexible matching
         const categoryName = categoryId.toLowerCase();
         let category = null;
         
         // Try exact match first
         category = await Category.findOne({ 
           name: { $regex: new RegExp(`^${categoryId}$`, 'i') },
           isActive: true 
         });
         
         // If not found, try partial matches
         if (!category) {
           if (categoryName.includes('infrastructure')) {
             category = await Category.findOne({ name: 'Infrastructure', isActive: true });
           } else if (categoryName.includes('safety')) {
             category = await Category.findOne({ name: 'Public Safety', isActive: true });
           } else if (categoryName.includes('environment')) {
             category = await Category.findOne({ name: 'Environment', isActive: true });
           } else if (categoryName.includes('transportation')) {
             category = await Category.findOne({ name: 'Transportation', isActive: true });
           } else if (categoryName.includes('health') || categoryName.includes('sanitation')) {
             category = await Category.findOne({ name: 'Health & Sanitation', isActive: true });
           }
         }
         
         if (!category) {
           return res.status(400).json({
             success: false,
             message: 'Invalid category'
           });
         }
         actualCategoryId = category._id;
       }
    }

    const issue = new Issue({
      title,
      description,
      categoryId: actualCategoryId,
      locationAddress,
      latitude,
      longitude,
      priority: priority || 'medium',
      tags: tags || [],
      images: images || [],
      isAnonymous,
      reportedBy: req.user._id,
      status: 'pending'
    });

    await issue.save();

    // Populate the created issue
    await issue.populate('reportedBy', 'name avatar');
    await issue.populate('categoryId', 'name iconName colorHex');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: {
        issue
      }
    });
  } catch (error: any) {
    console.error('Create issue error:', error);

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

// Vote on an issue
router.post('/:id/vote', authenticate, async (req: Request, res: Response) => {
  try {
    const { voteType } = req.body;
    const issueId = req.params.id;
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const result = await mockDataService.voteOnIssue(issueId, voteType, userId);
      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Issue not found'
        });
      }

      return res.json({
        success: true,
        message: 'Vote processed',
        data: result
      });
    }

    // Check if issue exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user already voted
    const existingVote = await Vote.findOne({ userId, issueId });

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Remove vote if same type
        await Vote.findByIdAndDelete(existingVote._id);
      } else {
        // Update vote type
        existingVote.voteType = voteType;
        await existingVote.save();
      }
    } else {
      // Create new vote
      const vote = new Vote({ userId, issueId, voteType });
      await vote.save();
    }

    // Get updated vote counts
    const upvotesCount = await Vote.countDocuments({ issueId, voteType: 'upvote' });
    const downvotesCount = await Vote.countDocuments({ issueId, voteType: 'downvote' });
    
    // Get current user vote
    const currentVote = await Vote.findOne({ userId, issueId });

    res.json({
      success: true,
      message: 'Vote processed',
      data: {
        upvotesCount,
        downvotesCount,
        hasUserVoted: currentVote ? currentVote.voteType : null
      }
    });
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get comments for an issue
router.get('/:id/comments', optionalAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const result = await mockDataService.getComments(req.params.id, pageNum, limitNum);
      return res.json({
        success: true,
        data: result
      });
    }

    const skip = (pageNum - 1) * limitNum;

    const comments = await Comment.find({ 
      issueId: req.params.id,
      parentId: null // Only top-level comments
    })
      .populate('userId', 'name avatar role')
      .populate({
        path: 'replies',
        populate: {
          path: 'userId',
          select: 'name avatar role'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Comment.countDocuments({ 
      issueId: req.params.id,
      parentId: null 
    });

    res.json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add comment to an issue
router.post('/:id/comments', authenticate, async (req: Request, res: Response) => {
  try {
    const { content, parentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use mock data service
      const comment = await mockDataService.addComment(
        req.params.id, 
        content.trim(), 
        req.user._id, 
        req.user.name
      );
      
      return res.status(201).json({
        success: true,
        message: 'Comment added successfully',
        data: {
          comment
        }
      });
    }

    // Check if issue exists
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // If parentId provided, check if parent comment exists
    if (parentId) {
      const parentComment = await Comment.findById(parentId);
      if (!parentComment || parentComment.issueId.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    const comment = new Comment({
      issueId: req.params.id,
      userId: req.user._id,
      content: content.trim(),
      parentId: parentId || null,
      isOfficial: ['admin', 'moderator'].includes(req.user.role)
    });

    await comment.save();
    await comment.populate('userId', 'name avatar role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment
      }
    });
  } catch (error: any) {
    console.error('Add comment error:', error);
    
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

// Update an issue (only by the reporter or admin)
router.patch('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is the reporter or an admin
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own issues'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['title', 'description', 'priority', 'tags', 'images'];
    const updates: any = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('reportedBy', 'name avatar')
     .populate('categoryId', 'name iconName colorHex');

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: {
        issue: updatedIssue
      }
    });
  } catch (error: any) {
    console.error('Update issue error:', error);
    
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

// Delete an issue (only by the reporter or admin)
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const issue = await Issue.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is the reporter or an admin
    if (issue.reportedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own issues'
      });
    }

    // Delete related data (votes, comments)
    await Vote.deleteMany({ issueId: req.params.id });
    await Comment.deleteMany({ issueId: req.params.id });
    
    // Delete the issue
    await Issue.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
