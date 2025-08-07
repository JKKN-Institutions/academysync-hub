import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';
import { fetchInstitutions, MyjkknInstitution } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

// Demo institutions data
const getDemoInstitutions = (): MyjkknInstitution[] => [
  {
    id: 'inst1',
    name: 'JKKN College of Engineering and Technology',
    description: 'Engineering and Technology Institution',
    status: 'active'
  },
  {
    id: 'inst2',
    name: 'JKKN College of Nursing and Research',
    description: 'Nursing and Research Institution',
    status: 'active'
  },
  {
    id: 'inst3',
    name: 'JKKN College of Arts and Science',
    description: 'Arts and Science Institution',
    status: 'active'
  }
];

export const useInstitutionsData = () => {
  const { isDemoMode } = useDemoMode();
  const [institutions, setInstitutions] = useState<MyjkknInstitution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data
        setInstitutions(getDemoInstitutions());
      } else {
        // Fetch from myjkkn API
        const apiInstitutions = await fetchInstitutions();
        setInstitutions(apiInstitutions.filter(inst => inst.status === 'active'));
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load institutions';
      setError(errorMessage);
      
      // Show error toast only for API errors (not demo mode)
      if (!isDemoMode) {
        toast({
          title: 'Error Loading Institutions',
          description: errorMessage,
          variant: 'destructive'
        });
      }
      
      // Fallback to empty array on error
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