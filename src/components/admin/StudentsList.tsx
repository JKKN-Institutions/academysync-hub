'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInstitutionsData } from '@/hooks/useInstitutionsData';
import { useStudentsData } from '@/hooks/useStudentsData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function StudentsList() {
  const { students, loading, error, refetch } = useStudentsData();
  const { institutions } = useInstitutionsData();
  const { toast } = useToast();
  const [syncing, setSyncing] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    institution_id: '',
    program: '',
    department: ''
  });

  // Filter students based on search criteria
  const filteredStudents = useMemo(() => {
    if (!students) return [];
    
    return students.filter(student => {
      const matchesSearch = !filters.search || 
        student.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(filters.search.toLowerCase()) ||
        student.email.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesProgram = !filters.program || 
        student.program.toLowerCase().includes(filters.program.toLowerCase());
      
      const matchesDepartment = !filters.department || 
        (student.department && student.department.toLowerCase().includes(filters.department.toLowerCase()));
      
      return matchesSearch && matchesProgram && matchesDepartment;
    });
  }, [students, filters]);

  // Sync data from MyJKKN API
  const handleSync = async () => {
    try {
      setSyncing(true);
      const { data, error } = await supabase.functions.invoke('sync-myjkkn-data', {
        body: { action: 'sync', entities: ['students'] }
      });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Sync Successful',
        description: `Synced ${data?.results?.students?.synced || 0} students`,
      });
      
      // Refresh data
      refetch();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error instanceof Error ? error.message : 'Failed to sync data',
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleProgramChange = (value: string) => {
    setFilters(prev => ({ ...prev, program: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFilters(prev => ({ ...prev, department: value }));
  };

  // Get unique programs and departments for filters
  const uniquePrograms = [...new Set(students?.map(s => s.program).filter(Boolean) || [])];
  const uniqueDepartments = [...new Set(students?.map(s => s.department).filter(Boolean) || [])];


  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-destructive">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button onClick={refetch} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
          <Button onClick={handleSync} disabled={syncing} variant="default">
            {syncing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Sync from API
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Students Directory</h2>
        <Button onClick={handleSync} disabled={syncing} variant="outline">
          {syncing ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Sync Data
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search students by name, roll number, or email..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <Select value={filters.program} onValueChange={handleProgramChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Programs</SelectItem>
            {uniquePrograms.map((program) => (
              <SelectItem key={program} value={program}>
                {program}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={filters.department} onValueChange={handleDepartmentChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {uniqueDepartments.map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {filteredStudents.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">
            {students?.length === 0 ? 'No students data available. Try syncing from the API.' : 'No students found matching your criteria'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {student.rollNo ? `Roll No: ${student.rollNo}` : 'No Roll Number'}
                  </p>
                  <p className="text-sm font-medium">
                    {student.program}
                  </p>
                  {student.department && (
                    <p className="text-sm text-muted-foreground">
                      Department: {student.department}
                    </p>
                  )}
                  {student.gpa && (
                    <p className="text-sm">
                      GPA: <span className="font-medium">{student.gpa}</span>
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-start md:items-end gap-2">
                  <Badge variant={student.status === 'active' ? "default" : "secondary"}>
                    {student.status}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {student.email}
                  </div>
                  {student.avatar && (
                    <img 
                      src={student.avatar} 
                      alt={student.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground text-center">
        Showing {filteredStudents.length} of {students?.length || 0} students
      </div>
    </div>
  );
}