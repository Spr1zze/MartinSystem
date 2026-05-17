import React, { createContext, useState, useCallback } from 'react';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: 'success' | 'warning' | 'error', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NotificationProviderComponent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((type: 'success' | 'warning' | 'error', message: string, duration = 4000) => {
    const id = Date.now().toString();
    const notification: Notification = { id, type, message, duration };
    setNotifications(prev => [...prev, notification]);

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationProvider = NotificationProviderComponent;
