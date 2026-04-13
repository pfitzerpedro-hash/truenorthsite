import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
  return (
    <div
      className={[
        'bg-slate-900 border border-slate-800 rounded-xl',
        noPadding ? '' : 'p-6',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={['border-b border-slate-800 pb-4 mb-4', className].join(' ')}>
      {children}
    </div>
  );
}

export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={['text-lg font-semibold text-white', className].join(' ')}>
      {children}
    </h3>
  );
}
