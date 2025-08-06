import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, setAuthToken, removeAuthToken, getStoredToken } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'citizen' | 'moderator' | 'admin' | 'super_admin';
  location: string;
  createdAt: string;
  emailVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  showAuthDialog: boolean;
  authMode: 'signin' | 'signup';
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, location: string) => Promise<void>;
  logout: () => void;
  openAuthDialog: (mode?: 'signin' | 'signup') => void;
  closeAuthDialog: () => void;
  setAuthMode: (mode: 'signin' | 'signup') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading to check existing session
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      const token = getStoredToken();
      if (token) {
        try {
          const response = await authApi.getProfile();
          if (response.success && response.data) {
            setUser(response.data.user);
          }
        } catch (error) {
          // Token is invalid, remove it
          removeAuthToken();
        }
      }
      setIsLoading(false);
    };

    checkExistingSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(email, password);

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        setShowAuthDialog(false);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, location: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(email, password, name, location);

      if (response.success && response.data) {
        setAuthToken(response.data.token);
        setUser(response.data.user);
        setShowAuthDialog(false);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      setShowAuthDialog(false);
    }
  };

  const openAuthDialog = (mode: 'signin' | 'signup' = 'signin') => {
    setAuthMode(mode);
    setShowAuthDialog(true);
  };

  const closeAuthDialog = () => {
    setShowAuthDialog(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      showAuthDialog,
      authMode,
      login,
      signup,
      logout,
      openAuthDialog,
      closeAuthDialog,
      setAuthMode
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
