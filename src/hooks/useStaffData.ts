import { useState, useEffect } from 'react';
import { useDemoMode } from './useDemoMode';
import { fetchStaff, MyjkknStaff } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

export const useStaffData = () => {
  const { isDemoMode } = useDemoMode();
  const [staff, setStaff] = useState<MyjkknStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [authReady, setAuthReady] = useState(false);

  // Wait for auth to be ready
  useEffect(() => {
    const timer = setTimeout(() => setAuthReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const loadStaff = async () => {
    if (!authReady) return;
    
    try {
      setLoading(true);
      setError(null);

      if (isDemoMode) {
        // Use demo data for staff
        const demoStaff: MyjkknStaff[] = [
          {
            id: 'staff-1',
            staffId: 'S001',
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@jkkn.ac.in',
            department: 'Computer Science',
            designation: 'Professor',
            status: 'active',
            mobile: '+91 9876543210'
          },
          {
            id: 'staff-2',
            staffId: 'S002', 
            name: 'Prof. Michael Chen',
            email: 'michael.chen@jkkn.ac.in',
            department: 'Engineering',
            designation: 'Associate Professor',
            status: 'active',
            mobile: '+91 9876543211'
          },
          {
            id: 'staff-3',
            staffId: 'S003',
            name: 'Dr. Priya Sharma',
            email: 'priya.sharma@jkkn.ac.in',
            department: 'Business Administration',
            designation: 'Assistant Professor',
            status: 'active',
            mobile: '+91 9876543212'
          }
        ];
        setStaff(demoStaff);
      } else {
        // Fetch from myjkkn API
        const apiStaff = await fetchStaff();
        setStaff(apiStaff);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load staff';
      setError(errorMessage);
      
      // Log error silently, don't show toast
      console.warn('Staff data fetch failed:', errorMessage);
      
      // Fallback to empty array on error
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authReady) {
      loadStaff();
    }
  }, [isDemoMode, authReady]);

  const refetch = () => {
    loadStaff();
  };

  return {
    staff,
    loading,
    error,
    refetch,
    isDemo: isDemoMode
  };
};