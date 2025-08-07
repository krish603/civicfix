const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

interface Notification {
  _id: string;
  type: 'status_update' | 'comment' | 'upvote' | 'downvote' | 'system' | 'mention';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  actionUrl?: string;
  issueId?: string;
  commentId?: string;
  userId?: string;
  relatedUserId?: string;
  metadata?: {
    issueTitle?: string;
    commentContent?: string;
    upvoteCount?: number;
    downvoteCount?: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// API endpoint functions
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, location: string) =>
    apiClient.post('/auth/register', { email, password, name, location }),
  
  getProfile: () =>
    apiClient.get('/auth/me'),
  
  updateProfile: (data: any) =>
    apiClient.patch('/auth/profile', data),
  
  logout: () =>
    apiClient.post('/auth/logout'),
};

export const issuesApi = {
  getIssues: (params?: any) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get(`/issues${queryString ? `?${queryString}` : ''}`);
  },
  
  getIssue: (id: string) =>
    apiClient.get<{ issue: any }>(`/issues/${id}`),
  
  createIssue: (data: any) =>
    apiClient.post('/issues', data),
  
  getComments: (issueId: string, page = 1, limit = 20) =>
    apiClient.get<{ comments: any[]; pagination: any }>(`/issues/${issueId}/comments?page=${page}&limit=${limit}`),
  
  addComment: (issueId: string, content: string, parentId?: string) =>
    apiClient.post<{ comment: any }>(`/issues/${issueId}/comments`, { content, parentId }),

  getUserIssues: () =>
    apiClient.get<any[]>('/issues/user'),

  // Vote on an issue
  voteOnIssue: (issueId: string, voteType: 'upvote' | 'downvote') =>
    apiClient.post<{ upvotesCount: number; downvotesCount: number; hasUserVoted: 'upvote' | 'downvote' | null }>(`/issues/${issueId}/vote`, { voteType }),

  // Delete an issue (only for issue owner)
  deleteIssue: (issueId: string) =>
    apiClient.delete(`/issues/${issueId}`),

  // Update an existing issue
  updateIssue: (issueId: string, issueData: any) =>
    apiClient.patch(`/issues/${issueId}`, issueData)
};

export const categoriesApi = {
  getCategories: () =>
    apiClient.get('/categories'),
  
  getCategory: (id: string) =>
    apiClient.get(`/categories/${id}`),
};

export const notificationApi = {
  getNotifications: () =>
    apiClient.get<Notification[]>('/notifications'),
  
  markAsRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    apiClient.patch('/notifications/read-all'),
  
  deleteNotification: (id: string) =>
    apiClient.delete(`/notifications/${id}`),
  
  createNotification: (data: any) =>
    apiClient.post('/notifications', data),
};

// Helper functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('auth_token');
};
