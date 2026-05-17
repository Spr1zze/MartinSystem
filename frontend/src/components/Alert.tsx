import React from 'react';

interface AlertProps {
  type: 'success' | 'warning' | 'error';
  message: string;
  onClose?: () => void;
}

const typeClasses = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-orange-100 text-orange-800',
  error: 'bg-error text-white',
};

const icons = {
  success: '✓',
  warning: '⚠',
  error: '✕',
};

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  return (
    <div className={`p-4 rounded-sm mb-4 flex items-center gap-2 ${typeClasses[type]}`}>
      <span className="font-bold">{icons[type]}</span>
      <span className="flex-1">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg opacity-70 hover:opacity-100 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
};
