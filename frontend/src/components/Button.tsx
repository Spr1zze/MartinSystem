import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseClasses = 'font-button transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-accent text-dark-text hover:bg-accent-hover',
    secondary: 'bg-gray-200 text-text-primary hover:bg-gray-300',
    danger: 'bg-error text-white hover:bg-opacity-90',
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm rounded-xs',
    md: 'px-4 py-2 text-base rounded-sm',
    lg: 'px-6 py-3 text-lg rounded-sm',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
