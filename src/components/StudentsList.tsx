'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, User, Phone, Mail, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

interface Student {
  id: string;
  student_name: string;
  roll_number: string;
  student_email: string;
  student_mobile: string;
  institution: { id: string; name: string };
  department: { id: string; department_name: string };
  program: { id: string; program_name: string };
  is_profile_complete: boolean;
}

interface ApiResponse {
  data: Student[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function StudentsList() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<ApiResponse | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    institution_id: '',
    is_profile_complete: ''
  });

  // Get API key from Supabase secrets
  useEffect(() => {
    const getApiKey = async () => {
      try {
        console.log('🔑 Fetching API key from Supabase secrets...');
        const { data, error } = await supabase.functions.invoke('get-secret', {
          body: { name: 'MYJKKN_API_KEY' }
        });

        if (error) {
          throw new Error(`Failed to get API key: ${error.message}`);
        }

        if (!data?.value) {
          throw new Error('MYJKKN_API_KEY not found in secrets');
        }

        console.log(`✅ API key retrieved successfully`);
        setApiKey(data.value);
      } catch (err) {
        console.error('❌ Failed to get API key:', err);
        setError(err instanceof Error ? err.message : 'Failed to get API key');
      }
    };

    getApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📊 Fetching students with filters:', filters);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', filters.page.toString());
        queryParams.append('limit', filters.limit.toString());
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.institution_id) queryParams.append('institution_id', filters.institution_id);
        if (filters.is_profile_complete) 
          queryParams.append('is_profile_complete', filters.is_profile_complete);
        
        const url = `https://my.jkkn.ac.in/api/api-management/students?${queryParams.toString()}`;
        console.log('🌐 API URL:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          }
        });
        
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch students: HTTP ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Students data received:', {
          totalStudents: data.data?.length || 0,
          metadata: data.metadata
        });
        
        setStudents(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        console.error('❌ Error fetching students:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [apiKey, filters]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleInstitutionChange = (value: string) => {
    setFilters(prev => ({ ...prev, institution_id: value, page: 1 }));
  };

  const handleProfileStatusChange = (value: string) => {
    setFilters(prev => ({ ...prev, is_profile_complete: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      institution_id: '',
      is_profile_complete: ''
    });
  };

  if (!apiKey && !error) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading API configuration...</p>
        </div>
      </div>
    );
  }

  if (error && !apiKey) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <strong>API Configuration Error:</strong> {error}
          <br />
          <span className="text-sm">Please ensure the MYJKKN_API_KEY is properly configured in your project settings.</span>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students Directory</h2>
          <p className="text-muted-foreground">
            {students?.metadata ? 
              `Showing ${students.data.length} of ${students.metadata.total} students` : 
              'MyJKKN Student Management System'
            }
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name or roll number..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <Select
          value={filters.institution_id}
          onValueChange={handleInstitutionChange}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Institution" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Institutions</SelectItem>
            {/* Dynamic institutions would be loaded here */}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.is_profile_complete}
          onValueChange={handleProfileStatusChange}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Profile Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Profiles</SelectItem>
            <SelectItem value="true">Complete</SelectItem>
            <SelectItem value="false">Incomplete</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Fetching students...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && apiKey && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Error:</strong> {error}
            <Button 
              onClick={resetFilters}
              variant="outline" 
              size="sm"
              className="mt-2 ml-2"
            >
              Reset and try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && students?.data.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No students found</h3>
          <p className="text-muted-foreground">
            No students match your search criteria. Try adjusting your filters.
          </p>
          <Button variant="outline" onClick={resetFilters} className="mt-4">
            Clear Filters
          </Button>
        </div>
      )}

      {/* Students List */}
      {!loading && students && students.data.length > 0 && (
        <div className="space-y-4">
          {students.data.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {student.student_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.roll_number ? `Roll No: ${student.roll_number}` : 'No Roll Number Assigned'}
                      </p>
                    </div>
                    <Badge 
                      variant={student.is_profile_complete ? "default" : "secondary"}
                      className={student.is_profile_complete ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                    >
                      {student.is_profile_complete ? "Profile Complete" : "Profile Incomplete"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Institution & Program</p>
                      <p className="text-sm flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {student.institution?.name || 'Unknown Institution'}
                      </p>
                      <p className="text-sm text-muted-foreground ml-5">
                        {student.program?.program_name || 'Unknown Program'}
                      </p>
                      {student.department?.department_name && (
                        <p className="text-sm text-muted-foreground ml-5">
                          Dept: {student.department.department_name}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Contact Information</p>
                      {student.student_email && (
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.student_email}
                        </p>
                      )}
                      {student.student_mobile && (
                        <p className="text-sm flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {student.student_mobile}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {students.metadata.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, students.metadata.total)} of {students.metadata.total} students
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium">
                    Page {filters.page} of {students.metadata.totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= students.metadata.totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}