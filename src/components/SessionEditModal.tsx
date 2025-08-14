import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, Clock, Users, Plus, X, UserPlus } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CounselingSession } from "@/hooks/useCounselingSessions";

interface SessionEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: CounselingSession;
  onSuccess: () => void;
}

interface EditFormData {
  name: string;
  session_date: Date | undefined;
  start_time: string;
  end_time: string;
  location: string;
  description: string;
  priority: 'low' | 'normal' | 'high';
  students: string[];
}

export const SessionEditModal = ({ open, onOpenChange, session, onSuccess }: SessionEditModalProps) => {
  const { toast } = useToast();
  const { students, loading: studentsLoading } = useStudentsData();
  const { departments } = useDepartmentsData();
  const { institutions } = useInstitutionsData();
  const { sendSessionInvitations } = useNotifications('demo-mentor', 'mentor');
  
  const [isLoading, setIsLoading] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [formData, setFormData] = useState<EditFormData>({
    name: '',
    session_date: undefined,
    start_time: '',
    end_time: '',
    location: '',
    description: '',
    priority: 'normal',
    students: []
  });

  // Student selection states
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState('');
  const [newStudents, setNewStudents] = useState<string[]>([]);

  // Initialize form data from session
  useEffect(() => {
    if (session && open) {
      setFormData({
        name: session.name,
        session_date: new Date(session.session_date),
        start_time: session.start_time || '',
        end_time: session.end_time || '',
        location: session.location || '',
        description: session.description || '',
        priority: (session.priority as 'low' | 'normal' | 'high') || 'normal',
        students: session.participants?.map(p => p.student_external_id) || []
      });
      setNewStudents([]);
      setShowAddStudents(false);
    }
  }, [session, open]);

  // Get available students for selection
  const availableStudents = students?.map(student => ({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    program: student.program,
    email: student.email,
    department: student.department || 'Unknown Department'
  })) || [];

  // Filter students based on selections and search
  const getFilteredStudents = () => {
    let filtered = availableStudents;

    // Filter by department
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = departments.find(d => d.id === selectedDepartment)?.department_name;
      filtered = filtered.filter(s => s.department === selectedDeptName);
    }

    // Filter by program
    if (selectedProgram && selectedProgram !== 'all') {
      filtered = filtered.filter(s => s.program === selectedProgram);
    }

    // Filter by search term
    if (studentSearch) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()))
      );
    }

    // Exclude already selected students
    const allSelectedStudents = [...formData.students, ...newStudents];
    filtered = filtered.filter(s => !allSelectedStudents.includes(s.id));

    return filtered;
  };

  // Get unique programs from filtered students
  const getAvailablePrograms = () => {
    let filtered = availableStudents;
    
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = departments.find(d => d.id === selectedDepartment)?.department_name;
      filtered = filtered.filter(s => s.department === selectedDeptName);
    }
    
    const programs = [...new Set(filtered.map(s => s.program))].filter(Boolean);
    return programs.sort();
  };

  const addStudent = (studentId: string) => {
    setNewStudents(prev => [...prev, studentId]);
    setStudentSearch('');
  };

  const removeNewStudent = (studentId: string) => {
    setNewStudents(prev => prev.filter(id => id !== studentId));
  };

  const removeExistingStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      students: prev.students.filter(id => id !== studentId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.session_date) {
      toast({
        title: "Date required",
        description: "Please select a session date.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Update session details
      const { error: sessionError } = await supabase
        .from('counseling_sessions')
        .update({
          name: formData.name,
          session_date: formData.session_date.toISOString().split('T')[0],
          start_time: formData.start_time || null,
          end_time: formData.end_time || null,
          location: formData.location || null,
          description: formData.description || null,
          priority: formData.priority,
          status: 'pending' // Reopen the session for editing
        })
        .eq('id', session.id);

      if (sessionError) {
        throw sessionError;
      }

      // Remove students that were removed from the session
      const removedStudents = session.participants?.filter(
        p => !formData.students.includes(p.student_external_id)
      ) || [];

      if (removedStudents.length > 0) {
        const { error: removeError } = await supabase
          .from('session_participants')
          .delete()
          .eq('session_id', session.id)
          .in('student_external_id', removedStudents.map(s => s.student_external_id));

        if (removeError) {
          console.error('Error removing participants:', removeError);
        }
      }

      // Add new students
      if (newStudents.length > 0) {
        const participantRecords = newStudents.map(studentId => ({
          session_id: session.id,
          student_external_id: studentId,
          participation_status: 'invited'
        }));

        const { error: participantsError } = await supabase
          .from('session_participants')
          .insert(participantRecords);

        if (participantsError) {
          throw participantsError;
        }

        // Send notifications to new students
        await sendSessionInvitations({
          sessionId: session.id,
          sessionName: formData.name,
          sessionDate: formData.session_date.toISOString().split('T')[0],
          sessionTime: formData.start_time,
          location: formData.location,
          mentorName: 'Your Mentor',
          studentIds: newStudents
        });
      }

      toast({
        title: "Session updated successfully",
        description: `Session "${formData.name}" has been updated${newStudents.length > 0 ? ` and ${newStudents.length} new student${newStudents.length > 1 ? 's have' : ' has'} been notified.` : '.'}`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: "Error updating session",
        description: "There was a problem updating the session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Session Details</DialogTitle>
          <DialogDescription>
            Update session information, modify timing, and add or remove students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Session Details */}
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Session Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Career Planning Discussion"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value: 'low' | 'normal' | 'high') => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Session Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.session_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.session_date ? format(formData.session_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.session_date}
                        onSelect={(date) => setFormData({ ...formData, session_date: date })}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="startTime"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="endTime"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 301, CS Building"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Session agenda and description..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Current Students */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Students ({formData.students.length})</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddStudents(!showAddStudents)}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Add Students
                </Button>
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
          {showAddStudents && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Students</CardTitle>
                <CardDescription>Select additional students to invite to this session</CardDescription>
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
          )}

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
                'Update Session'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};