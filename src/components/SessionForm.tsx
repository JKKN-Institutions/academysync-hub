import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Clock, Users, MapPin, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { FormSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EtiquetteTip, MentoringStage } from "@/components/ui/etiquette-tip";
import { useStudentsData } from "@/hooks/useStudentsData";

interface SessionFormProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  loading?: boolean;
  error?: string | null;
  initialData?: any;
}

export const SessionForm: React.FC<SessionFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  error,
  initialData
}) => {
  const { students, loading: studentsLoading, error: studentsError } = useStudentsData();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    date: initialData?.date || undefined,
    startTime: initialData?.startTime || '',
    endTime: initialData?.endTime || '',
    location: initialData?.location || '',
    type: initialData?.type || 'one_on_one',
    description: initialData?.description || '',
    students: initialData?.students || [],
    priority: initialData?.priority || 'normal'
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>(formData.students);
  const [studentSearch, setStudentSearch] = useState('');

  // Use real student data from API with proper property mapping and grouping
  const availableStudents = students?.map(student => ({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    program: student.program,
    email: student.email,
    department: student.department || 'Unknown Department'
  })) || [];

  // Group students by department for organization
  const groupedStudents = availableStudents.reduce((acc, student) => {
    const department = student.department;
    
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(student);
    return acc;
  }, {} as Record<string, typeof availableStudents>);

  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ ...formData, students: selectedStudents });
  };

  const addStudent = (studentId: string) => {
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents([...selectedStudents, studentId]);
    }
    setStudentSearch('');
  };

  const removeStudent = (studentId: string) => {
    setSelectedStudents(selectedStudents.filter(id => id !== studentId));
  };

  if (loading) {
    return <FormSkeleton fields={8} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load form"
        message={error}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Mentoring Stage Tip */}
      <MentoringStage stage={2} />
      
      {/* Etiquette Tip */}
      <EtiquetteTip type="set-expectations" />

      <Card>
        <CardHeader>
          <CardTitle>Create Counseling Session</CardTitle>
          <CardDescription>
            Schedule a new mentoring session with your students. Be sure to set clear objectives and prepare an agenda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Session Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <Label htmlFor="type">Session Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_on_one">One-on-One</SelectItem>
                    <SelectItem value="group">Group Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>Session Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => setFormData({ ...formData, date })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="p-3 pointer-events-auto"
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
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
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
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Location and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Faculty Office 204, Virtual Meeting"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* Student Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Students *</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search students by name or roll number..."
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Student Search Results - Grouped by Department */}
                {studentSearch && (
                  <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                    {filteredStudents.length > 0 ? (
                      Object.entries(
                        filteredStudents.reduce((acc, student) => {
                          const dept = student.department;
                          if (!acc[dept]) acc[dept] = [];
                          acc[dept].push(student);
                          return acc;
                        }, {} as Record<string, typeof filteredStudents>)
                      ).map(([department, students]) => (
                        <div key={department} className="mb-3">
                          <div className="text-xs font-semibold text-gray-600 mb-2 px-2 py-1 bg-gray-100 rounded">
                            {department}
                          </div>
                          {students.map(student => (
                            <div
                              key={student.id}
                              onClick={() => addStudent(student.id)}
                              className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer rounded ml-2"
                            >
                              <div>
                                <span className="font-medium">{student.name}</span>
                                <span className="text-sm text-gray-500 ml-2">({student.rollNo})</span>
                                <div className="text-xs text-gray-400">{student.program}</div>
                              </div>
                              <Plus className="w-4 h-4 text-green-600" />
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 p-2">No students found</p>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Students */}
              {selectedStudents.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Students ({selectedStudents.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudents.map(studentId => {
                      const student = availableStudents.find(s => s.id === studentId);
                      return student ? (
                        <Badge key={studentId} variant="secondary" className="pr-1">
                          {student.name} ({student.rollNo})
                          <button
                            type="button"
                            onClick={() => removeStudent(studentId)}
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
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Agenda & Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Outline the session agenda, topics to discuss, and any preparation required..."
                rows={4}
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Session'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};