import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDemoMode } from './useDemoMode';
import { useToast } from '@/hooks/use-toast';

export interface Institution {
  id: string;
  institution_id: string;
  institution_name: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  synced_at?: string;
}

export const useInstitutionsData = () => {
  const { isDemoMode } = useDemoMode();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data
        const demoInstitutions: Institution[] = [
          {
            id: '1',
            institution_id: 'jkkn-pharmacy',
            institution_name: 'JKKN College of Pharmacy',
            description: 'Premier pharmacy institution',
            status: 'active'
          },
          {
            id: '2',
            institution_id: 'jkkn-engineering',
            institution_name: 'JKKN College of Engineering & Technology',
            description: 'Engineering and technology education',
            status: 'active'
          }
        ];
        setInstitutions(demoInstitutions);
      } else {
        // Try Supabase first, fallback to direct API if needed
        try {
          const { data, error: dbError } = await supabase
            .from('institutions')
            .select('*')
            .eq('status', 'active')
            .order('institution_name');

          if (dbError) {
            console.warn('Supabase institutions fetch failed:', dbError);
            throw dbError;
          }

          if (data && data.length > 0) {
            setInstitutions((data || []) as Institution[]);
          } else {
            // No data in Supabase, try direct API fetch
            console.log('No institutions in Supabase, trying direct API fetch...');
            
            // Import fetchInstitutions dynamically to avoid circular dependency
            const { fetchInstitutions } = await import('@/services/myjkknApi');
            const apiInstitutions = await fetchInstitutions();
            
            // Transform API data to match our interface
            const transformedInstitutions: Institution[] = apiInstitutions.map(inst => ({
              id: inst.id,
              institution_id: inst.id,
              institution_name: inst.institution_name,
              description: inst.description || 'Institution',
              status: inst.status,
              created_at: inst.created_at,
              updated_at: inst.updated_at
            }));
            
            setInstitutions(transformedInstitutions);
          }
        } catch (dbError) {
          console.warn('Supabase fetch failed, trying direct API:', dbError);
          
          // Import fetchInstitutions dynamically to avoid circular dependency
          const { fetchInstitutions } = await import('@/services/myjkknApi');
          const apiInstitutions = await fetchInstitutions();
          
          // Transform API data to match our interface
          const transformedInstitutions: Institution[] = apiInstitutions.map(inst => ({
            id: inst.id,
            institution_id: inst.id,
            institution_name: inst.institution_name,
            description: inst.description || 'Institution',
            status: inst.status,
            created_at: inst.created_at,
            updated_at: inst.updated_at
          }));
          
          setInstitutions(transformedInstitutions);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load institutions';
      setError(errorMessage);
      
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Institutions',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInstitutions();
  }, [isDemoMode]);

  const refetch = () => {
    loadInstitutions();
  };

  return {
    institutions,
    loading,
    error,
    refetch,
    isDemo: isDemoMode
  };
};