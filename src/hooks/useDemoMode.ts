import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DemoModeData {
  enabled: boolean;
  description: string;
}

export const useDemoMode = () => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchDemoMode = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'demo_mode')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data?.setting_value) {
        const demoData = data.setting_value as unknown as DemoModeData;
        setEnabled(demoData.enabled || false);
      }
    } catch (err) {
      console.error('Error fetching demo mode:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch demo mode');
    } finally {
      setLoading(false);
    }
  };

  const updateDemoMode = async (newEnabled: boolean) => {
    try {
      setError(null);
      
      const { error: updateError } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'demo_mode',
          setting_value: {
            enabled: newEnabled,
            description: newEnabled 
              ? 'Demo mode active: using mock data for training sessions'
              : 'Demo mode disabled: using live API data'
          },
          description: 'Demo mode configuration for training sessions'
        });

      if (updateError) {
        throw updateError;
      }

      setEnabled(newEnabled);
      
      toast({
        title: newEnabled ? 'Demo Mode Enabled' : 'Demo Mode Disabled',
        description: newEnabled 
          ? 'Now using safe mock data for training. No live data will be affected.'
          : 'Switched back to live API data.',
        variant: newEnabled ? 'default' : 'default'
      });

    } catch (err) {
      console.error('Error updating demo mode:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update demo mode';
      setError(errorMessage);
      
      toast({
        title: 'Update Failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchDemoMode();
  }, []);

  return {
    enabled,
    loading,
    error,
    updateDemoMode,
    isDemoMode: enabled
  };
};