import React from 'react';
import { cn } from '@/lib/utils';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({ size = 'md', text, className }) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-2">
        <div
          className={cn(
            'animate-spin rounded-full border-2 border-primary border-t-transparent',
            sizes[size]
          )}
        />
        {text && <span className="text-black">{text}</span>}
      </div>
    </div>
  );
};

export default Loading;