import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, helperText, className = '', ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-text-primary mb-2">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full px-3 py-3 border-2 border-gray-300 rounded-xs focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-50 text-base placeholder:text-text-secondary min-h-24 resize-vertical ${
          error ? 'border-error focus:border-error focus:ring-error' : ''
        } ${className}`}
        {...props}
      />
      {error && <p className="text-error text-small mt-1">{error}</p>}
      {helperText && !error && <p className="text-text-secondary text-small mt-1">{helperText}</p>}
    </div>
  );
});
