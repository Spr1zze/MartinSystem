import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';
import type { Notification } from '../types';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (type: 'success' | 'warning' | 'error', message: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};
