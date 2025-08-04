import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface AutosaveState {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

interface AutosaveIndicatorProps {
  state: AutosaveState;
  className?: string;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ state, className = "" }) => {
  const getIndicator = () => {
    switch (state.status) {
      case 'pending':
        return (
          <Badge variant="secondary" className={`${className} animate-pulse`}>
            <Clock className="w-3 h-3 mr-1" />
            Pending changes
          </Badge>
        );
      case 'saving':
        return (
          <Badge variant="outline" className={`${className} animate-pulse`}>
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Saving...
          </Badge>
        );
      case 'saved':
        return (
          <Badge variant="default" className={`${className} bg-green-100 text-green-800 border-green-200`}>
            <Check className="w-3 h-3 mr-1" />
            Saved {state.lastSaved ? new Date(state.lastSaved).toLocaleTimeString() : ''}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive" className={className}>
            <AlertCircle className="w-3 h-3 mr-1" />
            Save failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return getIndicator();
};