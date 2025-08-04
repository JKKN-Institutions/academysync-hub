import { useState, useEffect, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface UseAutosaveProps {
  data: any;
  saveFunction: (data: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface AutosaveState {
  status: 'idle' | 'pending' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  error?: string;
}

export const useAutosave = ({ data, saveFunction, delay = 2000, enabled = true }: UseAutosaveProps) => {
  const [autosaveState, setAutosaveState] = useState<AutosaveState>({ status: 'idle' });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastDataRef = useRef(data);

  const save = useCallback(async () => {
    if (!enabled) return;
    
    setAutosaveState(prev => ({ ...prev, status: 'saving' }));
    
    try {
      await saveFunction(data);
      setAutosaveState({
        status: 'saved',
        lastSaved: new Date(),
        error: undefined
      });
    } catch (error) {
      setAutosaveState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Save failed'
      });
    }
  }, [data, saveFunction, enabled]);

  useEffect(() => {
    if (!enabled) return;
    
    // Check if data has actually changed
    if (JSON.stringify(data) === JSON.stringify(lastDataRef.current)) {
      return;
    }
    
    lastDataRef.current = data;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set pending state
    setAutosaveState(prev => ({ ...prev, status: 'pending' }));
    
    // Schedule save
    timeoutRef.current = setTimeout(save, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, save, delay, enabled]);

  return { autosaveState, forceSave: save };
};