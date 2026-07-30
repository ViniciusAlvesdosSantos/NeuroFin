import React, { InputHTMLAttributes, forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  icon?: React.ReactNode;
  mask?: (value: string) => string;
  variant?: 'outlined' | 'filled';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      mask,
      variant = 'outlined',
      className,
      onChange,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (mask) {
        const masked = mask(e.target.value);
        e.target.value = masked;
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            onChange={handleChange}
            className={cn(
              'w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
              'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
              'placeholder:text-muted-foreground/50',
              icon && 'pl-10',
              error && 'border-destructive focus:ring-destructive/30 focus:border-destructive',
              variant === 'outlined' && 'border border-input bg-background hover:border-primary/40',
              variant === 'filled' && 'border-0 bg-muted',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-destructive mt-1 font-medium">{error.message}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
