import React from 'react';

type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
};

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={[
        'animate-spin rounded-full border-slate-700 border-t-primary-500',
        sizeClasses[size],
        className,
      ].join(' ')}
      role="status"
      aria-label="Carregando"
    />
  );
}
