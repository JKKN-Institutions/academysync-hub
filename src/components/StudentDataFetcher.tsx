import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Users, 
  AlertCircle, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight,
  UserCheck,
  UserX,
  School,
  Building
} from 'lucide-react';
import { fetchStudents } from '@/services/myjkknApi';
import type { MyjkknStudent } from '@/services/myjkknApi';
import { useToast } from '@/hooks/use-toast';

interface StudentDataFetcherProps {
  className?: string;
}

export const StudentDataFetcher: React.FC<StudentDataFetcherProps> = ({ className = '' }) => {
  const [students, setStudents] = useState<MyjkknStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const { toast } = useToast();

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching students from MyJKKN API...');
      const studentsData = await fetchStudents();
      
      setStudents(studentsData);
      setCurrentPage(1); // Reset to first page
      
      toast({
        title: "Success",
        description: `Fetched ${studentsData.length} students successfully`,
      });
      
      console.log(`✅ Successfully loaded ${studentsData.length} students`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch student data';
      setError(errorMessage);
      console.error('Error fetching students:', err);
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const StudentCard = ({ student }: { student: MyjkknStudent }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{student.name}</h3>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {student.status}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                Roll No: {student.rollNo}
              </span>
              {student.department && (
                <span className="flex items-center gap-1">
                  <Building className="h-4 w-4" />
                  {student.department}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{student.email}</span>
              <span className="flex items-center gap-1">
                <School className="h-4 w-4" />
                {student.program}
              </span>
            </div>
          </div>
          
          <div className="text-right">
            <Badge variant="outline">
              Semester {student.semesterYear}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const PaginationControls = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        Showing {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            MyJKKN Student Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name, roll number, email, department, or program..."
                value={searchTerm}
                onChange={handleSearch}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={fetchStudentData} 
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : students.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No student data available. Click "Refresh Data" to fetch from MyJKKN API.
              </AlertDescription>
            </Alert>
          ) : filteredStudents.length === 0 ? (
            <Alert>
              <Search className="h-4 w-4" />
              <AlertDescription>
                No students found matching "{searchTerm}". Try adjusting your search terms.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="space-y-3">
                {currentStudents.map((student) => (
                  <StudentCard key={student.id} student={student} />
                ))}
              </div>
              
              {totalPages > 1 && <PaginationControls />}
            </div>
          )}

          {!loading && students.length > 0 && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">{students.length}</div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.status === 'active').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {new Set(students.map(s => s.department)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Departments</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {new Set(students.map(s => s.program)).size}
                  </div>
                  <div className="text-sm text-muted-foreground">Programs</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDataFetcher;