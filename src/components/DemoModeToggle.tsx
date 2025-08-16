import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Database } from 'lucide-react';
import { useDemoMode } from '@/hooks/useDemoMode';

export const DemoModeToggle: React.FC = () => {
  const { enabled, loading, updateDemoMode, isDemoMode } = useDemoMode();

  const handleToggle = () => {
    updateDemoMode(!enabled);
  };

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isDemoMode ? "secondary" : "default"} className="flex items-center gap-1">
        {isDemoMode ? <TestTube className="w-3 h-3" /> : <Database className="w-3 h-3" />}
        {isDemoMode ? "Demo Mode" : "Live Data"}
      </Badge>
      <Button
        size="sm"
        variant={isDemoMode ? "destructive" : "default"}
        onClick={handleToggle}
        disabled={loading}
        className="text-xs"
      >
        {loading ? 'Switching...' : isDemoMode ? 'Use Live Data' : 'Use Demo Data'}
      </Button>
    </div>
  );
};