// Mock data service for development without MongoDB connection

export interface MockIssue {
  _id: string;
  title: string;
  description: string;
  locationAddress: string;
  status: 'pending' | 'under_review' | 'approved' | 'in_progress' | 'resolved' | 'rejected' | 'duplicate';
  priority: 'low' | 'medium' | 'high' | 'critical';
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  viewsCount: number;
  tags: string[];
  images: Array<{
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    isPrimary: boolean;
  }>;
  reportedBy: {
    _id: string;
    name: string;
    avatar?: string;
  };
  categoryId?: {
    _id: string;
    name: string;
    iconName?: string;
    colorHex?: string;
  };
  hasUserVoted?: 'upvote' | 'downvote' | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  location: string;
  role: 'citizen' | 'moderator' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage for mock data
let mockIssues: MockIssue[] = [
  {
    _id: '1',
    title: 'Broken streetlight on Main Street',
    description: 'The streetlight at the corner of Main Street and Oak Avenue has been out for over a week, creating a safety hazard for pedestrians at night.',
    locationAddress: 'Main Street & Oak Avenue, Downtown',
    status: 'pending',
    priority: 'high',
    upvotesCount: 15,
    downvotesCount: 2,
    commentsCount: 8,
    viewsCount: 145,
    tags: ['lighting', 'safety', 'infrastructure'],
    images: [
      {
        url: '/placeholder.svg',
        thumbnailUrl: '/placeholder.svg',
        altText: 'Broken streetlight',
        isPrimary: true
      }
    ],
    reportedBy: {
      _id: 'user1',
      name: 'John Doe',
      avatar: '/placeholder.svg'
    },
    categoryId: {
      _id: 'cat1',
      name: 'Street Lighting',
      iconName: 'lightbulb',
      colorHex: '#FFB800'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '2',
    title: 'Damaged Sidewalk Near School',
    description: 'Large cracks in the sidewalk creating tripping hazards for students walking to school.',
    locationAddress: 'Elementary School, Oak Street',
    status: 'in_progress',
    priority: 'medium',
    upvotesCount: 8,
    downvotesCount: 1,
    commentsCount: 3,
    viewsCount: 67,
    tags: ['infrastructure', 'safety', 'school'],
    images: [
      {
        url: '/placeholder.svg',
        thumbnailUrl: '/placeholder.svg',
        altText: 'Damaged sidewalk',
        isPrimary: true
      }
    ],
    reportedBy: {
      _id: 'mock_user_1',
      name: 'Test User',
      avatar: '/placeholder.svg'
    },
    categoryId: {
      _id: 'cat2',
      name: 'Infrastructure',
      iconName: 'construction',
      colorHex: '#3B82F6'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '3',
    title: 'Broken Park Bench',
    description: 'Several broken slats on bench in Central Park making it unusable.',
    locationAddress: 'Central Park, Main Path',
    status: 'resolved',
    priority: 'low',
    upvotesCount: 5,
    downvotesCount: 0,
    commentsCount: 2,
    viewsCount: 34,
    tags: ['parks', 'recreation', 'maintenance'],
    images: [
      {
        url: '/placeholder.svg',
        thumbnailUrl: '/placeholder.svg',
        altText: 'Broken park bench',
        isPrimary: true
      }
    ],
    reportedBy: {
      _id: 'mock_user_1',
      name: 'Test User',
      avatar: '/placeholder.svg'
    },
    categoryId: {
      _id: 'cat3',
      name: 'Parks & Recreation',
      iconName: 'tree',
      colorHex: '#10B981'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '4',
    title: 'Large pothole on Elm Street',
    description: 'There\'s a massive pothole near the intersection of Elm Street and Pine Road that\'s damaging vehicles.',
    locationAddress: 'Elm Street & Pine Road, Westside',
    status: 'under_review',
    priority: 'critical',
    upvotesCount: 23,
    downvotesCount: 1,
    commentsCount: 12,
    viewsCount: 203,
    tags: ['roads', 'safety', 'repair'],
    images: [
      {
        url: '/placeholder.svg',
        thumbnailUrl: '/placeholder.svg',
        altText: 'Large pothole',
        isPrimary: true
      }
    ],
    reportedBy: {
      _id: 'user2',
      name: 'Jane Smith',
      avatar: '/placeholder.svg'
    },
    categoryId: {
      _id: 'cat4',
      name: 'Road Maintenance',
      iconName: 'construction',
      colorHex: '#FF6B35'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '5',
    title: 'Overflowing trash bin in Central Park',
    description: 'The trash bin near the playground in Central Park has been overflowing for days, attracting pests.',
    locationAddress: 'Central Park, Playground Area',
    status: 'in_progress',
    priority: 'medium',
    upvotesCount: 7,
    downvotesCount: 0,
    commentsCount: 3,
    viewsCount: 89,
    tags: ['sanitation', 'parks', 'health'],
    images: [
      {
        url: '/placeholder.svg',
        thumbnailUrl: '/placeholder.svg',
        altText: 'Overflowing trash bin',
        isPrimary: true
      }
    ],
    reportedBy: {
      _id: 'user3',
      name: 'Mike Johnson',
      avatar: '/placeholder.svg'
    },
    categoryId: {
      _id: 'cat5',
      name: 'Waste Management',
      iconName: 'trash',
      colorHex: '#28A745'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

let mockUsers: MockUser[] = [
  {
    _id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    location: 'Downtown District',
    role: 'citizen',
    avatar: '/placeholder.svg',
    isVerified: true,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

let nextIssueId = 6;
let nextUserId = 2;

// Mock comments data
let mockComments: any[] = [
  {
    _id: 'comment1',
    content: 'I completely agree! I nearly had an accident there last Tuesday evening. This definitely needs immediate attention.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userId: {
      _id: 'user2',
      name: 'Mike Chen',
      avatar: '/placeholder.svg',
      role: 'citizen'
    },
    isOfficial: false,
    issueId: '1'
  },
  {
    _id: 'comment2',
    content: 'Has anyone contacted the city about this? I can call the municipal office tomorrow if no one has reached out yet.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: {
      _id: 'user3',
      name: 'Lisa Rodriguez',
      avatar: '/placeholder.svg',
      role: 'citizen'
    },
    isOfficial: false,
    issueId: '1'
  },
  {
    _id: 'comment3',
    content: 'I\'ve reported this to the city three times already. They keep saying it\'s "under review" but nothing happens. Maybe if more people report it they\'ll take action.',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userId: {
      _id: 'user4',
      name: 'David Park',
      avatar: '/placeholder.svg',
      role: 'citizen'
    },
    isOfficial: false,
    issueId: '1'
  }
];

let nextCommentId = 4;

// Mock notifications data
let mockNotifications: any[] = [
  {
    _id: 'notif1',
    type: 'status_update',
    title: 'Issue Status Updated',
    message: 'Your report "Broken Street Light" is now in progress',
    createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/issue/1',
    issueId: '1',
    userId: 'mock_user_1',
    metadata: {
      issueTitle: 'Broken Street Light on Main Street'
    }
  },
  {
    _id: 'notif2',
    type: 'comment',
    title: 'New Comment',
    message: 'Someone commented on your pothole report',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    read: false,
    actionUrl: '/issue/2',
    issueId: '2',
    userId: 'mock_user_1',
    metadata: {
      issueTitle: 'Damaged Sidewalk Near School',
      commentContent: 'I completely agree! This needs immediate attention.'
    }
  },
  {
    _id: 'notif3',
    type: 'upvote',
    title: 'Your Report Got Upvoted',
    message: '5 people upvoted your graffiti removal request',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    read: true,
    actionUrl: '/issue/3',
    issueId: '3',
    userId: 'mock_user_1',
    metadata: {
      issueTitle: 'Broken Park Bench',
      upvoteCount: 5
    }
  },
  {
    _id: 'notif4',
    type: 'system',
    title: 'Weekly Digest Available',
    message: 'Your community activity summary is ready',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    userId: 'mock_user_1'
  }
];

let nextNotificationId = 5;

export const mockDataService = {
  // Issues
  async getIssues(params: any = {}) {
    let filteredIssues = [...mockIssues];
    
    // Apply search filter
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredIssues = filteredIssues.filter(issue => 
        issue.title.toLowerCase().includes(searchTerm) ||
        issue.description.toLowerCase().includes(searchTerm) ||
        issue.locationAddress.toLowerCase().includes(searchTerm) ||
        issue.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply status filter
    if (params.status) {
      filteredIssues = filteredIssues.filter(issue => issue.status === params.status);
    }
    
    // Apply priority filter
    if (params.priority) {
      filteredIssues = filteredIssues.filter(issue => issue.priority === params.priority);
    }
    
    // Apply tags filter
    if (params.tags && params.tags.length > 0) {
      filteredIssues = filteredIssues.filter(issue => 
        params.tags.some((tag: string) => issue.tags.includes(tag))
      );
    }
    
    // Apply sorting
    if (params.sortBy) {
      const sortOrder = params.sortOrder === 'desc' ? -1 : 1;
      filteredIssues.sort((a: any, b: any) => {
        const aVal = a[params.sortBy];
        const bVal = b[params.sortBy];
        if (aVal < bVal) return -1 * sortOrder;
        if (aVal > bVal) return 1 * sortOrder;
        return 0;
      });
    } else {
      // Default sort by creation date (newest first)
      filteredIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    
    // Pagination
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedIssues = filteredIssues.slice(startIndex, endIndex);
    
    return {
      issues: paginatedIssues,
      pagination: {
        page,
        limit,
        total: filteredIssues.length,
        pages: Math.ceil(filteredIssues.length / limit)
      }
    };
  },
  
  async getIssueById(id: string) {
    return mockIssues.find(issue => issue._id === id);
  },
  
  async createIssue(issueData: any) {
    // Map category names to mock category data
    const getCategoryData = (categoryName: string) => {
      const categoryMap: { [key: string]: any } = {
        'infrastructure': {
          _id: 'cat1',
          name: 'Infrastructure',
          iconName: 'construction',
          colorHex: '#3B82F6'
        },
        'safety': {
          _id: 'cat2',
          name: 'Public Safety',
          iconName: 'shield',
          colorHex: '#EF4444'
        },
        'environment': {
          _id: 'cat3',
          name: 'Environment',
          iconName: 'leaf',
          colorHex: '#10B981'
        },
        'transportation': {
          _id: 'cat4',
          name: 'Transportation',
          iconName: 'car',
          colorHex: '#F59E0B'
        },
        'community': {
          _id: 'cat5',
          name: 'Health & Sanitation',
          iconName: 'heart',
          colorHex: '#EC4899'
        },
        'other': {
          _id: 'cat6',
          name: 'Other',
          iconName: 'alert-circle',
          colorHex: '#6B7280'
        }
      };
      
      return categoryMap[categoryName.toLowerCase()] || categoryMap['other'];
    };

    const newIssue: MockIssue = {
      _id: nextIssueId.toString(),
      title: issueData.title,
      description: issueData.description,
      locationAddress: issueData.locationAddress || 'Unknown Location',
      status: 'pending',
      priority: issueData.priority || 'medium',
      upvotesCount: 0,
      downvotesCount: 0,
      commentsCount: 0,
      viewsCount: 0,
      tags: issueData.tags || [],
      images: issueData.images || [],
      reportedBy: {
        _id: 'user1',
        name: 'Anonymous User',
        avatar: '/placeholder.svg'
      },
      categoryId: issueData.categoryId ? getCategoryData(issueData.categoryId) : undefined,
      hasUserVoted: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    nextIssueId++;
    mockIssues.unshift(newIssue);
    return newIssue;
  },
  
  async voteOnIssue(issueId: string, voteType: 'upvote' | 'downvote', userId?: string) {
    const issue = mockIssues.find(i => i._id === issueId);
    if (!issue) return null;
    
    const currentVote = issue.hasUserVoted;
    
    // Remove previous vote
    if (currentVote === 'upvote') {
      issue.upvotesCount -= 1;
    } else if (currentVote === 'downvote') {
      issue.downvotesCount -= 1;
    }
    
    // Add new vote if different from current
    if (currentVote !== voteType) {
      if (voteType === 'upvote') {
        issue.upvotesCount += 1;
        issue.hasUserVoted = 'upvote';
      } else {
        issue.downvotesCount += 1;
        issue.hasUserVoted = 'downvote';
      }
    } else {
      // If same vote, remove it (toggle off)
      issue.hasUserVoted = null;
    }
    
    issue.updatedAt = new Date().toISOString();
    return { 
      upvotesCount: issue.upvotesCount,
      downvotesCount: issue.downvotesCount,
      hasUserVoted: issue.hasUserVoted 
    };
  },
  
  // Users
  async createUser(userData: any) {
    const newUser: MockUser = {
      _id: `user${nextUserId}`,
      name: userData.name,
      email: userData.email,
      location: userData.location || 'Unknown',
      role: 'citizen',
      avatar: '/placeholder.svg',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    nextUserId++;
    mockUsers.push(newUser);
    return newUser;
  },
  
  async getUserByEmail(email: string) {
    return mockUsers.find(user => user.email === email);
  },
  
  async getUserById(id: string) {
    return mockUsers.find(user => user._id === id);
  },
  
  async getUserIssues(userId: string) {
    // Filter issues by the user who reported them
    const userIssues = mockIssues.filter(issue => issue.reportedBy._id === userId);
    
    // Sort by creation date (newest first)
    userIssues.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userIssues;
  },

  async getComments(issueId: string, page = 1, limit = 20) {
    const issueComments = mockComments.filter(comment => comment.issueId === issueId);
    
    // Sort by creation date (newest first)
    issueComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedComments = issueComments.slice(startIndex, endIndex);
    
    return {
      comments: paginatedComments,
      pagination: {
        page,
        limit,
        total: issueComments.length,
        pages: Math.ceil(issueComments.length / limit)
      }
    };
  },

  async addComment(issueId: string, content: string, userId: string, userName: string) {
    const newComment = {
      _id: `comment${nextCommentId}`,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      userId: {
        _id: userId,
        name: userName,
        avatar: '/placeholder.svg',
        role: 'citizen'
      },
      isOfficial: false,
      issueId: issueId
    };
    
    nextCommentId++;
    mockComments.unshift(newComment);
    
    // Update comment count on the issue
    const issue = mockIssues.find(i => i._id === issueId);
    if (issue) {
      issue.commentsCount += 1;
    }
    
    return newComment;
  },

  // Notification methods
  async getNotifications(userId: string) {
    const userNotifications = mockNotifications.filter(notif => notif.userId === userId);
    
    // Sort by creation date (newest first)
    userNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return userNotifications;
  },

  async markNotificationAsRead(notificationId: string, userId: string) {
    const notification = mockNotifications.find(n => n._id === notificationId && n.userId === userId);
    if (notification) {
      notification.read = true;
      return true;
    }
    return false;
  },

  async markAllNotificationsAsRead(userId: string) {
    mockNotifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
      }
    });
  },

  async deleteNotification(notificationId: string, userId: string) {
    const index = mockNotifications.findIndex(n => n._id === notificationId && n.userId === userId);
    if (index !== -1) {
      mockNotifications.splice(index, 1);
      return true;
    }
    return false;
  },

  async createNotification(notificationData: any) {
    const newNotification = {
      _id: `notif${nextNotificationId}`,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      createdAt: new Date().toISOString(),
      read: false,
      actionUrl: notificationData.actionUrl,
      issueId: notificationData.issueId,
      commentId: notificationData.commentId,
      userId: notificationData.userId,
      relatedUserId: notificationData.relatedUserId,
      metadata: notificationData.metadata
    };
    
    nextNotificationId++;
    mockNotifications.unshift(newNotification);
    
    return newNotification;
  }
};
