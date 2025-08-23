import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Users } from "lucide-react";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudentManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  currentStudents: string[]; // Array of student external IDs
  onSuccess?: () => void;
}

export const StudentManagementModal: React.FC<StudentManagementModalProps> = ({
  open,
  onOpenChange,
  sessionId,
  currentStudents,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    students: [...currentStudents]
  });
  const [newStudents, setNewStudents] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  const { students, loading: studentsLoading } = useStudentsData();
  const { departments, loading: departmentsLoading } = useDepartmentsData();
  const { toast } = useToast();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({ students: [...currentStudents] });
      setNewStudents([]);
      setStudentSearch('');
      setSelectedDepartment('all');
      setSelectedProgram('all');
    }
  }, [open, currentStudents]);

  // Map students data
  const availableStudents = students?.map(student => ({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    program: student.program,
    email: student.email,
    department: student.department || 'Unknown Department'
  })) || [];

  // Get available programs based on selected department
  const getAvailablePrograms = () => {
    const programs = new Set<string>();
    
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = departments.find(d => d.id === selectedDepartment)?.department_name;
      
      availableStudents.forEach(student => {
        if (student.program && 
            student.program !== 'Unknown Program' && 
            student.department === selectedDeptName) {
          programs.add(student.program);
        }
      });
    } else {
      availableStudents.forEach(student => {
        if (student.program && student.program !== 'Unknown Program') {
          programs.add(student.program);
        }
      });
    }
    
    return Array.from(programs).sort();
  };

  // Get filtered students for selection
  const getFilteredStudents = () => {
    let filtered = availableStudents;
    
    // Filter by department
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = departments.find(d => d.id === selectedDepartment)?.department_name;
      filtered = filtered.filter(student => student.department === selectedDeptName);
    }
    
    // Filter by program
    if (selectedProgram && selectedProgram !== 'all') {
      filtered = filtered.filter(student => student.program === selectedProgram);
    }
    
    // Filter by search
    if (studentSearch) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
      );
    }
    
    // Exclude already selected students
    return filtered.filter(student => !formData.students.includes(student.id));
  };

  const addStudent = (studentId: string) => {
    if (!newStudents.includes(studentId)) {
      setNewStudents([...newStudents, studentId]);
    }
  };

  const removeNewStudent = (studentId: string) => {
    setNewStudents(newStudents.filter(id => id !== studentId));
  };

  const removeExistingStudent = (studentId: string) => {
    setFormData({
      ...formData,
      students: formData.students.filter(id => id !== studentId)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Combine existing and new students
      const allStudents = [...formData.students, ...newStudents];
      
      // First, delete existing participants
      await supabase
        .from('session_participants')
        .delete()
        .eq('session_id', sessionId);

      // Then, add all current participants
      if (allStudents.length > 0) {
        const participantRecords = allStudents.map(studentId => ({
          session_id: sessionId,
          student_external_id: studentId,
          participation_status: 'invited'
        }));

        const { error: participantsError } = await supabase
          .from('session_participants')
          .insert(participantRecords);

        if (participantsError) {
          throw participantsError;
        }
      }

      toast({
        title: 'Students Updated',
        description: `Successfully updated session participants. Total: ${allStudents.length} students.`
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session participants. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (studentsLoading || departmentsLoading) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Session Students
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-4">
          {/* Current Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Current Students ({formData.students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.students.length > 0 ? (
                <div className="space-y-2">
                  {formData.students.map(studentId => {
                    const student = availableStudents.find(s => s.id === studentId);
                    return student ? (
                      <div key={studentId} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                        <div>
                          <div className="font-medium">{student.name}</div>
                          <div className="text-sm text-muted-foreground">{student.rollNo} • {student.program}</div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExistingStudent(studentId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No students currently assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Add Students Section */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Department and Program Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      {getAvailablePrograms().map(program => (
                        <SelectItem key={program} value={program}>
                          {program}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Search Students</Label>
                  <Input
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search by name or roll number..."
                  />
                </div>
              </div>

              {/* Student Results */}
              <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                {getFilteredStudents().length > 0 ? (
                  getFilteredStudents().map(student => (
                    <div
                      key={student.id}
                      onClick={() => addStudent(student.id)}
                      className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded"
                    >
                      <div>
                        <span className="font-medium">{student.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">({student.rollNo})</span>
                        <div className="text-xs text-muted-foreground">{student.program}</div>
                      </div>
                      <Plus className="w-4 h-4 text-green-600" />
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground p-2">
                    {studentSearch || selectedDepartment !== 'all' || selectedProgram !== 'all'
                      ? 'No students found matching your criteria'
                      : 'Select filters to search for students'}
                  </p>
                )}
              </div>

              {/* New Students to Add */}
              {newStudents.length > 0 && (
                <div className="space-y-2">
                  <Label>Students to Add ({newStudents.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {newStudents.map(studentId => {
                      const student = availableStudents.find(s => s.id === studentId);
                      return student ? (
                        <Badge key={studentId} variant="secondary" className="pr-1">
                          {student.name} ({student.rollNo})
                          <button
                            type="button"
                            onClick={() => removeNewStudent(studentId)}
                            className="ml-2 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                'Update Students'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};