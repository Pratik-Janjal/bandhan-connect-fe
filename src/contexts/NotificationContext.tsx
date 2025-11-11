import React, { createContext, useContext, useState, ReactNode } from 'react';
import api from '../services/api';
import { userAPI } from '../services/api';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  author?: string; // Added for announcements
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications and announcements from backend on mount
  // React.useEffect(() => {
  //   const user = JSON.parse(localStorage.getItem('user') || '{}');
  //   const userId = user?.id;
  //   if (!userId) return;
    
  //   // Fetch notifications
  //   api.get(`/notifications?userId=${userId}`)
  //     .then(res => {
  //       const notificationData = res.data.map((n: any) => ({
  //         ...n,
  //         id: n._id,
  //         type: n.type || 'info',
  //         title: n.title || '',
  //         message: n.message || '',
  //         timestamp: n.timestamp || '',
  //         read: !!n.read,
  //         actionUrl: n.actionUrl || undefined
  //       }));
        
  //       // Fetch announcements
  //       userAPI.getAnnouncements().then(announcementData => {
  //         const announcementNotifications = announcementData
  //           .filter((a: any) => a.isActive)
  //           .map((a: any) => ({
  //             id: a.id,
  //             type: 'announcement' as const,
  //             title: a.title,
  //             message: a.content,
  //             timestamp: a.timestamp,
  //             read: false,
  //             author: a.author
  //           }));
          
  //         // Merge notifications and announcements
  //         setNotifications([...announcementNotifications, ...notificationData]);
  //       }).catch(() => {
  //         setNotifications(notificationData);
  //       });
  //     })
  //     .catch(() => {});
  // }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    // Persist to backend if not an announcement
    const notification = notifications.find(n => n.id === id);
    if (notification && notification.type !== 'announcement') {
      api.put(`/notifications/${id}/read`).catch(() => {});
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
    // Persist to backend for all real notifications
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.id;
    if (userId) {
      api.put(`/notifications/read-all?userId=${userId}`).catch(() => {});
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};