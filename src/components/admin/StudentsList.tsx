'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitutionsData } from '@/hooks/useInstitutionsData';

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

interface StudentsFilterProps {
  apiKey: string;
}

export default function StudentsList({ apiKey }: StudentsFilterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<ApiResponse | null>(null);
  const { institutions } = useInstitutionsData();
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    institution_id: '',
    is_profile_complete: ''
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const queryParams = new URLSearchParams();
        
        queryParams.append('page', filters.page.toString());
        queryParams.append('limit', filters.limit.toString());
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.institution_id) queryParams.append('institution_id', filters.institution_id);
        if (filters.is_profile_complete) 
          queryParams.append('is_profile_complete', filters.is_profile_complete);
        
        const url = `https://myadmin.jkkn.ac.in/api/api-management/students?${queryParams.toString()}`;
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch students: ${response.status}`);
        }
        
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    if (apiKey) {
      fetchStudents();
    }
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

  if (!apiKey) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">API key required to fetch students</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-destructive">{error}</p>
        <Button 
          onClick={() => setFilters({
            page: 1,
            limit: 10,
            search: '',
            institution_id: '',
            is_profile_complete: ''
          })}
          variant="outline" 
          className="mt-4"
        >
          Reset and try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
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
            {institutions.map((institution) => (
              <SelectItem key={institution.id} value={institution.id}>
                {institution.institution_name}
              </SelectItem>
            ))}
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
      </div>
      
      {students?.data.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No students found matching your criteria</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students?.data.map((student) => (
            <Card key={student.id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg">{student.student_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {student.roll_number ? `Roll No: ${student.roll_number}` : 'No Roll Number'}
                  </p>
                  <p className="text-sm">
                    {student.institution?.name} • {student.program?.program_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Department: {student.department?.department_name}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <Badge variant={student.is_profile_complete ? "default" : "outline"}>
                    {student.is_profile_complete ? "Complete" : "Incomplete"}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {student.student_email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {student.student_mobile}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {students && students.metadata.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
              >
                Previous
              </Button>
              
              <div className="flex items-center px-4">
                <span className="text-sm">
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
          )}
        </div>
      )}
      
      {students && (
        <div className="text-sm text-muted-foreground text-center">
          Showing {students.data.length} of {students.metadata.total} students
        </div>
      )}
    </div>
  );
}