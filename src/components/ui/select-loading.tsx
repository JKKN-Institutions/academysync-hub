import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface SelectLoadingSkeletonProps {
  count?: number;
}

export const SelectLoadingSkeleton: React.FC<SelectLoadingSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="p-2 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full" />
      ))}
    </div>
  );
};

interface SelectLoadingItemProps {
  message?: string;
}

export const SelectLoadingItem: React.FC<SelectLoadingItemProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
      <Loader2 className="h-3 w-3 animate-spin" />
      <span>{message}</span>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4', 
    lg: 'h-6 w-6'
  };

  return (
    <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
  );
};