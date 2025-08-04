import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className = ""
}) => {
  return (
    <Card className={`border-dashed text-center ${className}`}>
      <CardHeader className="pb-4">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base max-w-md mx-auto">
          {description}
        </CardDescription>
      </CardHeader>
      {action && (
        <CardContent className="pt-0">
          <Button onClick={action.onClick} className="mx-auto">
            {action.label}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};