'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Search, User, Phone, Mail, GraduationCap } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { fetchStudents, MyjkknStudent } from '@/services/myjkknApi';

interface StudentsFilterProps {
  apiKey?: string;
}

export default function StudentsList({ apiKey }: StudentsFilterProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<MyjkknStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<MyjkknStudent[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    department: '',
    program: ''
  });

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('📊 Fetching students using myjkknApi service...');
        const students = await fetchStudents();
        setAllStudents(students);
        setFilteredStudents(students);
        console.log(`✅ Successfully loaded ${students.length} students`);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch students';
        console.error('❌ Error loading students:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Apply filters when filters or allStudents change
  useEffect(() => {
    let filtered = [...allStudents];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower)
      );
    }

    // Apply department filter
    if (filters.department) {
      filtered = filtered.filter(student =>
        student.department?.toLowerCase().includes(filters.department.toLowerCase())
      );
    }

    // Apply program filter
    if (filters.program) {
      filtered = filtered.filter(student =>
        student.program.toLowerCase().includes(filters.program.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [filters, allStudents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleDepartmentChange = (value: string) => {
    setFilters(prev => ({ ...prev, department: value, page: 1 }));
  };

  const handleProgramChange = (value: string) => {
    setFilters(prev => ({ ...prev, program: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const resetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      department: '',
      program: ''
    });
  };

  // Calculate pagination
  const startIndex = (filters.page - 1) * filters.limit;
  const endIndex = startIndex + filters.limit;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredStudents.length / filters.limit);

  // Get unique departments and programs for filters
  const uniqueDepartments = Array.from(new Set(allStudents.map(s => s.department).filter(Boolean)));
  const uniquePrograms = Array.from(new Set(allStudents.map(s => s.program).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Students Directory</h2>
          <p className="text-muted-foreground">
            {filteredStudents.length > 0 ? 
              `Showing ${Math.min(startIndex + 1, filteredStudents.length)}-${Math.min(endIndex, filteredStudents.length)} of ${filteredStudents.length} students` : 
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
            placeholder="Search students by name, roll number, or email..."
            className="pl-8"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>
        
        <Select
          value={filters.department}
          onValueChange={handleDepartmentChange}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {uniqueDepartments.map(dept => (
              <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={filters.program}
          onValueChange={handleProgramChange}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Programs</SelectItem>
            {uniquePrograms.map(program => (
              <SelectItem key={program} value={program}>{program}</SelectItem>
            ))}
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
            <p className="text-muted-foreground">Fetching students from MyJKKN...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Error:</strong> {error}
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              size="sm"
              className="mt-2 ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && filteredStudents.length === 0 && (
        <div className="text-center py-12 border rounded-lg bg-muted/20">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {allStudents.length === 0 ? 'No students found' : 'No students match your criteria'}
          </h3>
          <p className="text-muted-foreground">
            {allStudents.length === 0 
              ? 'Unable to load students from MyJKKN API. Please check the connection.'
              : 'Try adjusting your search filters to see more results.'
            }
          </p>
          {allStudents.length > 0 && (
            <Button variant="outline" onClick={resetFilters} className="mt-4">
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {/* Students List */}
      {!loading && paginatedStudents.length > 0 && (
        <div className="space-y-4">
          {paginatedStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {student.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Roll No: {student.rollNo}
                      </p>
                    </div>
                    <Badge 
                      variant={student.status === 'active' ? "default" : "secondary"}
                      className={student.status === 'active' ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
                    >
                      {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Academic Information</p>
                      <p className="text-sm flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {student.program}
                      </p>
                      {student.department && (
                        <p className="text-sm text-muted-foreground ml-5">
                          Dept: {student.department}
                        </p>
                      )}
                      {student.gpa && (
                        <p className="text-sm text-muted-foreground ml-5">
                          GPA: {student.gpa}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Contact Information</p>
                      {student.email && (
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {student.email}
                        </p>
                      )}
                      {student.mentor && (
                        <p className="text-sm text-muted-foreground">
                          Mentor: {student.mentor}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
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
                    Page {filters.page} of {totalPages}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={filters.page >= totalPages}
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