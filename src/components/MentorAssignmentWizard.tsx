import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Building, GraduationCap, UserCheck, AlertCircle } from 'lucide-react';
import { useStudentsData } from '@/hooks/useStudentsData';
import { useStaffData } from '@/hooks/useStaffData';
import { useDepartmentsData } from '@/hooks/useDepartmentsData';
import { useInstitutionsData } from '@/hooks/useInstitutionsData';
import { useToast } from '@/hooks/use-toast';

interface MentorAssignmentWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId?: string;
  onAssignmentCreated?: () => void;
}

interface AssignmentFilters {
  institution: string;
  department: string;
  section: string;
  program: string;
  semesterYear: string;
  searchTerm: string;
}

const MentorAssignmentWizard: React.FC<MentorAssignmentWizardProps> = ({
  open,
  onOpenChange,
  mentorId,
  onAssignmentCreated
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [selectedMentees, setSelectedMentees] = useState<string[]>([]);
  const [supervisorId, setSupervisorId] = useState<string>('');
  const [assignmentType, setAssignmentType] = useState<'primary' | 'co_mentor'>('primary');
  const [notes, setNotes] = useState('');
  const [filters, setFilters] = useState<AssignmentFilters>({
    institution: '',
    department: '',
    section: '',
    program: '',
    semesterYear: '',
    searchTerm: ''
  });

  const { students } = useStudentsData();
  const { staff: mentors } = useStaffData();
  const { departments } = useDepartmentsData();
  const { institutions } = useInstitutionsData();
  const { toast } = useToast();

  // Get unique values for filters
  const uniquePrograms = [...new Set(students.map(s => s.program).filter(Boolean))];
  const uniqueSections = ['A', 'B', 'C', 'D']; // Static sections for demo
  const uniqueSemesterYears = [...new Set(students.map(s => s.semesterYear).filter(Boolean))];

  // Filter students based on current filters
  const filteredStudents = students.filter(student => {
    if (filters.institution && student.department !== filters.institution) return false; // Using department as institution proxy
    if (filters.department && student.department !== filters.department) return false;
    if (filters.section) return false; // Skip section filter for now
    if (filters.program && student.program !== filters.program) return false;
    if (filters.semesterYear && student.semesterYear?.toString() !== filters.semesterYear) return false;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.rollNo.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  // Filter available students (not already assigned)
  const availableStudents = filteredStudents.filter(student => 
    !student.mentor // Only students without current mentors
  );

  const handleMentorSelect = (mentor: any) => {
    setSelectedMentor(mentor);
    setCurrentStep(2);
  };

  const handleMenteeSelect = (studentId: string, checked: boolean) => {
    setSelectedMentees(prev => 
      checked 
        ? [...prev, studentId]
        : prev.filter(id => id !== studentId)
    );
  };

  const handleCreateAssignment = async () => {
    if (!selectedMentor || selectedMentees.length === 0) {
      toast({
        title: 'Incomplete Assignment',
        description: 'Please select a mentor and at least one mentee.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // Create fresh assignments for each selected mentee
      for (const menteeId of selectedMentees) {
        const student = students.find(s => s.id === menteeId);
        if (!student) continue;

        const assignmentData = {
          mentor_external_id: selectedMentor.staffId,
          student_external_id: student.studentId,
          role: assignmentType,
          notes,
          status: 'active',
          effective_from: new Date().toISOString(),
          supervisor_id: supervisorId || null,
          assignment_metadata: {
            institution: student.department, // Using department as institution proxy
            department: student.department,
            section: 'A', // Default section
            program: student.program,
            semesterYear: student.semesterYear,
            created_via: 'mentor_choice',
            is_fresh_assignment: true
          }
        };

        // This would be the actual API call to create assignment
        console.log('Creating assignment:', assignmentData);
      }

      toast({
        title: 'Assignments Created',
        description: `Successfully created ${selectedMentees.length} fresh assignment(s).`,
      });

      // Reset form and close
      setSelectedMentor(null);
      setSelectedMentees([]);
      setSupervisorId('');
      setNotes('');
      setCurrentStep(1);
      onOpenChange(false);
      onAssignmentCreated?.();

    } catch (error) {
      toast({
        title: 'Assignment Failed',
        description: 'Failed to create assignments. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          1
        </div>
        <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          2
        </div>
        <div className={`w-12 h-1 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
          currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        }`}>
          3
        </div>
      </div>
    </div>
  );

  const renderMentorSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <Users className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Mentor</h3>
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search mentors by name, department, or expertise..."
          className="pl-10"
          onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
        />
      </div>

      <div className="grid gap-4 max-h-96 overflow-y-auto">
        {mentors.filter(mentor => 
          mentor.status === 'active' && 
          (!filters.searchTerm || 
           mentor.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
           mentor.department.toLowerCase().includes(filters.searchTerm.toLowerCase()))
        ).map(mentor => (
          <Card 
            key={mentor.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedMentor?.id === mentor.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => handleMentorSelect(mentor)}
          >
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={mentor.avatar} />
                  <AvatarFallback>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{mentor.name}</h4>
                  <p className="text-sm text-muted-foreground">{mentor.designation}</p>
                  <p className="text-sm text-muted-foreground">{mentor.department}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {mentor.department}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">Status</div>
                  <div className="text-sm text-muted-foreground">
                    {mentor.status}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMenteeSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <GraduationCap className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Mentees</h3>
        <Badge variant="secondary">{availableStudents.length} available</Badge>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div>
          <Label htmlFor="institution">Institution</Label>
          <Select value={filters.institution} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, institution: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="All institutions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All institutions</SelectItem>
              {institutions.map(inst => (
                <SelectItem key={inst.id} value={inst.institution_name}>{inst.institution_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={filters.department} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, department: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="All departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.department_name}>{dept.department_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="program">Program</Label>
          <Select value={filters.program} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, program: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="All programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All programs</SelectItem>
              {uniquePrograms.map(program => (
                <SelectItem key={program} value={program}>{program}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="section">Section</Label>
          <Select value={filters.section} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, section: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="All sections" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All sections</SelectItem>
              {uniqueSections.map(section => (
                <SelectItem key={section} value={section}>{section}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="semesterYear">Semester/Year</Label>
          <Select value={filters.semesterYear} onValueChange={(value) => 
            setFilters(prev => ({ ...prev, semesterYear: value }))
          }>
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All years</SelectItem>
              {uniqueSemesterYears.map(year => (
                <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            placeholder="Name, email, roll no..."
            value={filters.searchTerm}
            onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
          />
        </div>
      </div>

      {/* Available Students */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {availableStudents.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No available students found with current filters.</p>
          </Card>
        ) : (
          availableStudents.map(student => (
            <Card key={student.id} className="p-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedMentees.includes(student.id)}
                  onCheckedChange={(checked) => handleMenteeSelect(student.id, checked as boolean)}
                />
                <Avatar>
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback>
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-semibold">{student.name}</h4>
                  <p className="text-sm text-muted-foreground">{student.email}</p>
                  <p className="text-sm text-muted-foreground">Roll: {student.rollNo}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-medium">{student.program}</div>
                  <div className="text-muted-foreground">{student.department}</div>
                  <div className="text-muted-foreground">Year {student.semesterYear}</div>
                  <Badge variant="outline" className="mt-1">Available</Badge>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setCurrentStep(1)}>
          Back to Mentor Selection
        </Button>
        <Button 
          onClick={() => setCurrentStep(3)}
          disabled={selectedMentees.length === 0}
        >
          Continue to Confirmation ({selectedMentees.length} selected)
        </Button>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-2 mb-4">
        <UserCheck className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Confirm Assignment</h3>
      </div>

      {/* Assignment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Selected Mentor</Label>
            <div className="flex items-center space-x-3 mt-2 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={selectedMentor?.avatar} />
                <AvatarFallback>
                  {selectedMentor?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedMentor?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMentor?.department}</p>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Selected Mentees ({selectedMentees.length})</Label>
            <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
              {selectedMentees.map(menteeId => {
                const student = students.find(s => s.id === menteeId);
                return student ? (
                  <div key={menteeId} className="flex items-center space-x-3 p-2 bg-muted/30 rounded">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-xs">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.rollNo} • {student.program}</p>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignmentType">Assignment Type</Label>
              <Select value={assignmentType} onValueChange={(value: 'primary' | 'co_mentor') => setAssignmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary Mentor</SelectItem>
                  <SelectItem value="co_mentor">Co-Mentor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="supervisor">Supervisor (Optional)</Label>
              <Select value={supervisorId} onValueChange={setSupervisorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No supervisor</SelectItem>
                  {mentors.filter(m => m.designation?.toLowerCase().includes('dean') || 
                                     m.designation?.toLowerCase().includes('head') ||
                                     m.designation?.toLowerCase().includes('supervisor')).map(supervisor => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.name} - {supervisor.designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this assignment..."
              className="w-full mt-2 p-3 border rounded-md resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={() => setCurrentStep(2)}>
          Back to Mentee Selection
        </Button>
        <Button onClick={handleCreateAssignment}>
          Create Fresh Assignment{selectedMentees.length > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Fresh Mentor-Mentee Assignment</DialogTitle>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="mt-6">
          {currentStep === 1 && renderMentorSelection()}
          {currentStep === 2 && renderMenteeSelection()}
          {currentStep === 3 && renderConfirmation()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MentorAssignmentWizard;