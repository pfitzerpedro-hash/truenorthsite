import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'muted';

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  pulse?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-800 text-slate-300 border-slate-700',
  success: 'bg-green-900/40 text-green-400 border-green-800',
  warning: 'bg-yellow-900/40 text-yellow-400 border-yellow-800',
  error: 'bg-red-900/40 text-red-400 border-red-800',
  info: 'bg-primary-900/40 text-primary-400 border-primary-800',
  muted: 'bg-slate-800/50 text-slate-500 border-slate-700/50',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
  pulse = false,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        pulse ? 'animate-pulse' : '',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
