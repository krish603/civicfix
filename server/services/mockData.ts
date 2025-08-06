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
      _id: 'cat2',
      name: 'Road Maintenance',
      iconName: 'construction',
      colorHex: '#FF6B35'
    },
    hasUserVoted: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: '3',
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
      _id: 'cat3',
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

let nextIssueId = 4;
let nextUserId = 2;

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
    return { hasUserVoted: issue.hasUserVoted };
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
  }
};
