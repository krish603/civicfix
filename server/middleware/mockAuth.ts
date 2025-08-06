// Mock authentication for development without MongoDB

export interface MockUser {
  _id: string;
  name: string;
  email: string;
  location: string;
  role: 'citizen' | 'moderator' | 'admin' | 'super_admin';
  avatar?: string;
  isVerified: boolean;
}

// Simple in-memory session store
const mockSessions: Map<string, MockUser> = new Map();

export const mockAuthService = {
  generateToken(): string {
    return 'mock_token_' + Math.random().toString(36).substr(2, 9);
  },

  createSession(user: MockUser): string {
    const token = this.generateToken();
    mockSessions.set(token, user);
    return token;
  },

  getUser(token: string): MockUser | null {
    return mockSessions.get(token) || null;
  },

  deleteSession(token: string): void {
    mockSessions.delete(token);
  },

  validateToken(token: string): boolean {
    return mockSessions.has(token);
  }
};

// Default mock user for testing
export const defaultMockUser: MockUser = {
  _id: 'mock_user_1',
  name: 'Test User',
  email: 'test@example.com',
  location: 'Test City',
  role: 'citizen',
  avatar: '/placeholder.svg',
  isVerified: true
};
