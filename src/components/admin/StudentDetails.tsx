'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useStudentsData } from '@/hooks/useStudentsData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StudentDetailsProps {
  studentId: string;
  onBack: () => void;
}

export default function StudentDetails({ studentId, onBack }: StudentDetailsProps) {
  const { students, loading: studentsLoading } = useStudentsData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);
  const { toast } = useToast();

  // First try to find student in local data
  const localStudent = students?.find(s => s.id === studentId || s.studentId === studentId);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      if (localStudent) {
        // Use local data if available
        setStudentDetails(localStudent);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from Supabase first
        const { data: dbStudent, error: dbError } = await supabase
          .from('students')
          .select('*')
          .eq('student_id', studentId)
          .single();

        if (dbStudent && !dbError) {
          setStudentDetails({
            id: dbStudent.id,
            studentId: dbStudent.student_id,
            student_name: dbStudent.name,
            roll_number: dbStudent.roll_no,
            student_email: dbStudent.email,
            student_mobile: dbStudent.mobile,
            program: { program_name: dbStudent.program },
            department: { department_name: dbStudent.department },
            gpa: dbStudent.gpa,
            status: dbStudent.status,
            avatar_url: dbStudent.avatar_url
          });
          return;
        }

        // If not found locally or in DB, try API
        const { data, error: apiError } = await supabase.functions.invoke('sync-myjkkn-data', {
          body: { 
            action: 'fetch', 
            entities: ['students'],
            studentId: studentId 
          }
        });

        if (apiError) {
          throw apiError;
        }

        // Find the student in the synced data
        const foundStudent = data?.results?.students?.data?.find((s: any) => 
          s.id === studentId || s.student_id === studentId
        );

        if (foundStudent) {
          setStudentDetails({
            id: foundStudent.id,
            studentId: foundStudent.student_id || foundStudent.id,
            student_name: foundStudent.name,
            roll_number: foundStudent.roll_no,
            student_email: foundStudent.email,
            student_mobile: foundStudent.mobile,
            program: { program_name: foundStudent.program },
            department: { department_name: foundStudent.department },
            gpa: foundStudent.gpa,
            status: foundStudent.status,
            avatar_url: foundStudent.avatar_url
          });
        } else {
          throw new Error('Student not found');
        }
      } catch (err) {
        console.error('Error fetching student details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load student details');
        toast({
          title: 'Error',
          description: 'Failed to load student details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchStudentDetails();
    }
  }, [studentId, localStudent, toast]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke('sync-myjkkn-data', {
        body: { action: 'sync', entities: ['students'] }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sync Successful',
        description: 'Student data has been refreshed',
      });
      
      // Retry fetching the student
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to refresh student data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (studentsLoading || loading) {
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
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Button>
          <Button onClick={handleRefresh} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="py-8 text-center space-y-4">
        <p className="text-muted-foreground">Student not found</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Students
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div className="flex gap-2">
          <Badge variant={studentDetails.status === 'active' ? "default" : "secondary"}>
            {studentDetails.status || 'Unknown Status'}
          </Badge>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {studentDetails.avatar_url && (
          <img 
            src={studentDetails.avatar_url} 
            alt={studentDetails.student_name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{studentDetails.student_name}</h1>
          <p className="text-muted-foreground">
            {studentDetails.roll_number ? `Roll No: ${studentDetails.roll_number}` : 'No Roll Number'}
          </p>
          <p className="text-sm text-muted-foreground">
            Student ID: {studentDetails.studentId}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <p className="text-sm font-medium text-muted-foreground">Email:</p>
              <p className="text-sm col-span-2">{studentDetails.student_email || 'Not Available'}</p>
              
              <p className="text-sm font-medium text-muted-foreground">Mobile:</p>
              <p className="text-sm col-span-2">{studentDetails.student_mobile || 'Not Available'}</p>
              
              <p className="text-sm font-medium text-muted-foreground">Status:</p>
              <div className="col-span-2">
                <Badge variant={studentDetails.status === 'active' ? "default" : "secondary"}>
                  {studentDetails.status || 'Unknown'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Academic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 items-center">
              <p className="text-sm font-medium text-muted-foreground">Program:</p>
              <p className="text-sm col-span-2">{studentDetails.program?.program_name || 'Not Available'}</p>
              
              <p className="text-sm font-medium text-muted-foreground">Department:</p>
              <p className="text-sm col-span-2">{studentDetails.department?.department_name || 'Not Available'}</p>
              
              {studentDetails.gpa && (
                <>
                  <p className="text-sm font-medium text-muted-foreground">GPA:</p>
                  <p className="text-sm col-span-2 font-medium">{studentDetails.gpa}</p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Information Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">
              Additional student details may be available through the institutional system.
            </p>
            <p className="text-sm mt-1">
              Last synced: {new Date().toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}