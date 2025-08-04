import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type AssignmentMode = 'app' | 'upstream';

interface AssignmentModeData {
  mode: AssignmentMode;
  description: string;
}

export const useAssignmentMode = () => {
  const [mode, setMode] = useState<AssignmentMode>('app');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'assignment_mode')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data?.setting_value) {
        const modeData = data.setting_value as unknown as AssignmentModeData;
        setMode(modeData.mode || 'app');
      }
    } catch (err) {
      console.error('Error fetching assignment mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch assignment mode');
    } finally {
      setLoading(false);
    }
  };

  const updateMode = async (newMode: AssignmentMode) => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'assignment_mode',
          setting_value: {
            mode: newMode,
            description: newMode === 'app' 
              ? 'Assignments are managed within the application'
              : 'Assignments are read-only from upstream system'
          },
          description: 'Assignment management mode configuration'
        });

      if (updateError) {
        throw updateError;
      }

      setMode(newMode);
      
      toast({
        title: 'Assignment Mode Updated',
        description: `Switched to ${newMode === 'app' ? 'App-managed' : 'Upstream-managed'} mode`,
      });

    } catch (err) {
      console.error('Error updating assignment mode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update assignment mode';
      setError(errorMessage);
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchMode();
  }, []);

  return {
    mode,
    loading,
    error,
    updateMode,
    isAppManaged: mode === 'app',
    isUpstreamManaged: mode === 'upstream'
  };
};