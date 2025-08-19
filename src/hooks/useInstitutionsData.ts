import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';
import { fetchInstitutions, MyjkknInstitution } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

// Demo institutions data
const getDemoInstitutions = (): MyjkknInstitution[] => [
  {
    id: 'inst1',
    institution_name: 'JKKN College of Engineering & Technology',
    description: 'Engineering and Technology Institute',
    status: 'active'
  },
  {
    id: 'inst2',
    institution_name: 'JKKN College of Nursing',
    description: 'Nursing Education Institute',
    status: 'active'
  },
  {
    id: 'inst3',
    institution_name: 'JKKN College of Arts & Science',
    description: 'Arts and Science Institute',
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
        console.log('Fetching institutions from API...');
        const apiInstitutions = await fetchInstitutions();
        console.log('Raw API institutions received:', apiInstitutions);
        console.log('Institution IDs from institutions API:', apiInstitutions.map(inst => ({ id: inst.id, name: inst.institution_name })));
        
        const activeInstitutions = apiInstitutions.filter(inst => inst.status === 'active');
        console.log('Active institutions filtered:', activeInstitutions);
        setInstitutions(activeInstitutions);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load institutions';
      setError(errorMessage);
      
      // Show error toast for API failures
      toast({
        title: 'Error Loading Institutions',
        description: errorMessage,
        variant: 'destructive'
      });
      
      // Set empty array on error - no demo fallback
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