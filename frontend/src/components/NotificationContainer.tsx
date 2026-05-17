import React from 'react';
import { useNotification } from '../hooks';
import { Alert } from './Alert';

export const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {notifications.map(notification => (
        <div key={notification.id} className="animate-in fade-in slide-in-from-top-2">
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
};
