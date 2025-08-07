import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { notificationApi } from '../lib/api';

export interface Notification {
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

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  addNotification: (notification: Omit<Notification, '_id' | 'createdAt' | 'read'>) => void;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user]);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await notificationApi.getNotifications();
      
      if (response.success && response.data) {
        setNotifications(response.data);
      } else {
        setError(response.message || 'Failed to fetch notifications');
      }
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setError(err.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationApi.markAsRead(id);
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationApi.markAllAsRead();
      
      if (response.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (err: any) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationApi.deleteNotification(id);
      
      if (response.success) {
        setNotifications(prev => prev.filter(notif => notif._id !== id));
      }
    } catch (err: any) {
      console.error('Error deleting notification:', err);
    }
  };

  const addNotification = (notification: Omit<Notification, '_id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      _id: `temp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      error,
      fetchNotifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      clearError
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 