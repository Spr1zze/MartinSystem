import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helperText, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="block text-xl font-semibold text-text-primary mb-2">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 text-lg placeholder:text-text-secondary ${
          error ? 'border-error focus:border-error focus:ring-error' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-error text-xl mt-1">{error}</p>}
      {helperText && !error && <p className="text-text-secondary text-lg mt-1">{helperText}</p>}
    </div>
  );
});
