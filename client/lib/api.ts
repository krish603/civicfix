const API_BASE_URL = '/api';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
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

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    
    return this.handleResponse<T>(response);
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });
    
    return this.handleResponse<T>(response);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
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
    apiClient.get(`/issues/${id}`),
  
  createIssue: (data: any) =>
    apiClient.post('/issues', data),
  
  getComments: (issueId: string, page = 1, limit = 20) =>
    apiClient.get(`/issues/${issueId}/comments?page=${page}&limit=${limit}`),
  
  addComment: (issueId: string, content: string, parentId?: string) =>
    apiClient.post(`/issues/${issueId}/comments`, { content, parentId }),

  async getUserIssues() {
    try {
      const response = await fetch('/api/issues/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth implementation
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user issues');
      }

      return data;
    } catch (error) {
      console.error('Error fetching user issues:', error);
      throw error;
    }
  },

  // Vote on an issue
  async voteOnIssue(issueId: string, voteType: 'upvote' | 'downvote') {
    try {
      const response = await fetch(`/api/issues/${issueId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ voteType })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to vote on issue');
      }

      return data;
    } catch (error) {
      console.error('Error voting on issue:', error);
      throw error;
    }
  },

  // Delete an issue (only for issue owner)
  async deleteIssue(issueId: string) {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete issue');
      }

      return data;
    } catch (error) {
      console.error('Error deleting issue:', error);
      throw error;
    }
  },

  // Update an existing issue
  async updateIssue(issueId: string, issueData: any) {
    try {
      const response = await fetch(`/api/issues/${issueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(issueData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update issue');
      }

      return data;
    } catch (error) {
      console.error('Error updating issue:', error);
      throw error;
    }
  }
};

export const categoriesApi = {
  getCategories: () =>
    apiClient.get('/categories'),
  
  getCategory: (id: string) =>
    apiClient.get(`/categories/${id}`),
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
