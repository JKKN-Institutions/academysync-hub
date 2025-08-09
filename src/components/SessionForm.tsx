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
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const { departments, loading: departmentsLoading } = useDepartmentsData();
  const { institutions, loading: institutionsLoading } = useInstitutionsData();
  
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
  const [selectedInstitution, setSelectedInstitution] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedSemester, setSelectedSemester] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');

  // Use real student data from API with proper property mapping and grouping
  const availableStudents = students?.map(student => ({
    id: student.id,
    name: student.name,
    rollNo: student.rollNo,
    program: student.program,
    email: student.email,
    department: student.department || 'Unknown Department'
  })) || [];

  // Filter students by search term
  const filteredStudents = availableStudents.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // WORKAROUND: Create institution groups based on department data
  // Since the institutions API and departments API have mismatched IDs,
  // we'll create virtual institution groups based on the departments' institution_ids
  const departmentInstitutionGroups = React.useMemo(() => {
    const groups: Record<string, { id: string; name: string; departments: typeof departments }> = {};
    
    departments.forEach(dept => {
      if (!groups[dept.institution_id]) {
        // Create a virtual institution name based on department patterns
        let institutionName = '';
        
        // Pattern matching to determine institution names from department data
        if (dept.department_name.includes('Pharmacy') || dept.department_name.includes('Pharmaceutical')) {
          institutionName = 'JKKN College of Pharmacy';
        } else if (dept.department_name.includes('Conservative') || dept.department_name.includes('Endodontics')) {
          institutionName = 'JKKN Dental College';
        } else if (dept.department_name.includes('Engineering') || dept.department_name.includes('Technology')) {
          institutionName = 'JKKN College of Engineering & Technology';
        } else if (dept.department_name.includes('Nursing')) {
          institutionName = 'JKKN College of Nursing';
        } else if (dept.department_name.includes('Arts') || dept.department_name.includes('Science')) {
          institutionName = 'JKKN College of Arts & Science';
        }
        
        // Only create groups for departments with recognizable institution patterns
        if (institutionName) {
          groups[dept.institution_id] = {
            id: dept.institution_id,
            name: institutionName,
            departments: []
          };
        }
      }
      
      // Only add department if we have a valid institution group
      if (groups[dept.institution_id]) {
        groups[dept.institution_id].departments.push(dept);
      }
    });
    
    console.log('Created department institution groups:', groups);
    return Object.values(groups);
  }, [departments]);

  // Get departments for selected institution (using the workaround)
  const filteredDepartments = React.useMemo(() => {
    if (!selectedInstitution || selectedInstitution === "all") {
      return departments; // Show all departments
    }
    
    // Check if it's one of our virtual institution groups
    const virtualGroup = departmentInstitutionGroups.find(group => group.id === selectedInstitution);
    if (virtualGroup) {
      return virtualGroup.departments;
    }
    
    // Fallback to original filtering (which may return empty due to ID mismatch)
    return departments.filter(dept => dept.institution_id === selectedInstitution);
  }, [selectedInstitution, departments, departmentInstitutionGroups]);

  // Get programs filtered by selected department
  const availablePrograms = React.useMemo(() => {
    const programs = new Set<string>();
    
    // If a department is selected, filter programs by that department
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = filteredDepartments.find(d => d.id === selectedDepartment)?.department_name;
      
      availableStudents.forEach(student => {
        if (student.program && 
            student.program !== 'Unknown Program' && 
            student.department === selectedDeptName) {
          programs.add(student.program);
        }
      });
    } else {
      // Show all programs if no department is selected
      availableStudents.forEach(student => {
        if (student.program && student.program !== 'Unknown Program') {
          programs.add(student.program);
        }
      });
    }
    
    return Array.from(programs).sort();
  }, [availableStudents, selectedDepartment, filteredDepartments]);

  // Get semesters filtered by selected department and program
  const availableSemesters = React.useMemo(() => {
    const semesters = new Set<string>();
    
    // If department or program is selected, filter semesters accordingly
    if (selectedDepartment && selectedDepartment !== 'all') {
      const selectedDeptName = filteredDepartments.find(d => d.id === selectedDepartment)?.department_name;
      
      students?.forEach(student => {
        if (student.semesterYear && student.department === selectedDeptName) {
          // If program is also selected, filter by it
          if (selectedProgram && selectedProgram !== 'all') {
            if (student.program === selectedProgram) {
              semesters.add(`Year ${student.semesterYear}`);
            }
          } else {
            semesters.add(`Year ${student.semesterYear}`);
          }
        }
      });
    } else {
      // Show all semesters if no department is selected
      students?.forEach(student => {
        if (student.semesterYear) {
          semesters.add(`Year ${student.semesterYear}`);
        }
      });
    }
    
    return Array.from(semesters).sort();
  }, [students, selectedDepartment, selectedProgram, filteredDepartments]);

  // Get sections (combinations of program and semester with student groups)
  const availableSections = React.useMemo(() => {
    const sections = new Map<string, { name: string; students: typeof availableStudents }>();
    
    // Only show sections if all filters are selected
    if (selectedDepartment && selectedDepartment !== 'all' && 
        selectedProgram && selectedProgram !== 'all' &&
        selectedSemester && selectedSemester !== 'all') {
      
      const selectedDeptName = filteredDepartments.find(d => d.id === selectedDepartment)?.department_name;
      const semesterYear = selectedSemester.replace('Year ', '');
      
      // Group students by their section (for now, we'll create sections based on roll number ranges)
      const filteredStudents = students?.filter(s => 
        s.department === selectedDeptName && 
        s.program === selectedProgram &&
        s.semesterYear === parseInt(semesterYear)
      ) || [];
      
      // Create sections based on roll number patterns or student groups
      // For simplicity, we'll group every 30 students into a section
      const sortedStudents = filteredStudents
        .map(student => ({
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
          program: student.program,
          email: student.email,
          department: student.department || 'Unknown Department'
        }))
        .sort((a, b) => a.rollNo.localeCompare(b.rollNo));
      
      if (sortedStudents.length > 0) {
        const sectionsCount = Math.ceil(sortedStudents.length / 30);
        
        for (let i = 0; i < sectionsCount; i++) {
          const startIndex = i * 30;
          const endIndex = Math.min(startIndex + 30, sortedStudents.length);
          const sectionStudents = sortedStudents.slice(startIndex, endIndex);
          
          if (sectionStudents.length > 0) {
            const firstRoll = sectionStudents[0].rollNo;
            const lastRoll = sectionStudents[sectionStudents.length - 1].rollNo;
            const sectionName = `Section ${String.fromCharCode(65 + i)} (${firstRoll} - ${lastRoll})`;
            
            sections.set(sectionName, {
              name: sectionName,
              students: sectionStudents
            });
          }
        }
      }
    }
    
    return Array.from(sections.values());
  }, [students, selectedDepartment, selectedProgram, selectedSemester, filteredDepartments]);

  // Get students for selected section
  const getFilteredStudents = () => {
    // If a section is selected, return only students from that section
    if (selectedSection && selectedSection !== 'all') {
      const section = availableSections.find(s => s.name === selectedSection);
      return section ? section.students : [];
    }
    
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Format data for Supabase integration
    const sessionData = {
      name: formData.name,
      session_date: formData.date,
      start_time: formData.startTime,
      end_time: formData.endTime,
      location: formData.location,
      description: formData.description,
      session_type: formData.type as 'one_on_one' | 'group',
      priority: formData.priority as 'low' | 'normal' | 'high',
      students: selectedStudents
    };
    
    onSubmit?.(sessionData);
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
              <Label>Students *</Label>
              
              {/* Institution Filter */}
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select value={selectedInstitution} onValueChange={(value) => {
                  console.log('Institution selected:', value);
                  console.log('Available institutions:', institutions);
                  console.log('Available departments:', departments);
                  setSelectedInstitution(value);
                  setSelectedDepartment('all'); // Reset department when institution changes
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an institution" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="all">All Institutions</SelectItem>
                    {/* Show only institutions that have departments */}
                    {departmentInstitutionGroups
                      .filter(group => group.departments.length > 0)
                      .map(group => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select 
                  value={selectedDepartment} 
                  onValueChange={(value) => {
                    setSelectedDepartment(value);
                    setSelectedProgram('all'); // Reset program when department changes
                    setSelectedSemester('all'); // Reset semester when department changes
                    setSelectedSection('all'); // Reset section when department changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="all">All Departments</SelectItem>
                    {filteredDepartments.length > 0 ? (
                      filteredDepartments.map(department => {
                        const studentCount = availableStudents.filter(s => s.department === department.department_name).length;
                        return (
                          <SelectItem key={department.id} value={department.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{department.department_name || 'Unknown Department'}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {studentCount} students
                              </Badge>
                            </div>
                          </SelectItem>
                        );
                      })
                    ) : (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No departments available for selected institution
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Program Filter */}
              <div className="space-y-2">
                <Label htmlFor="program">Program</Label>
                <Select 
                  value={selectedProgram} 
                  onValueChange={(value) => {
                    setSelectedProgram(value);
                    setSelectedSemester('all'); // Reset semester when program changes
                    setSelectedSection('all'); // Reset section when program changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a program" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="all">All Programs</SelectItem>
                    {availablePrograms.map(program => {
                      // Count students in this program based on current department filter
                      let studentCount = 0;
                      if (selectedDepartment && selectedDepartment !== 'all') {
                        const selectedDeptName = filteredDepartments.find(d => d.id === selectedDepartment)?.department_name;
                        studentCount = availableStudents.filter(s => 
                          s.program === program && s.department === selectedDeptName
                        ).length;
                      } else {
                        studentCount = availableStudents.filter(s => s.program === program).length;
                      }
                      
                      return (
                        <SelectItem key={program} value={program}>
                          <div className="flex justify-between items-center w-full">
                            <span>{program}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {studentCount} students
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester Filter */}
              <div className="space-y-2">
                <Label htmlFor="semester">Semester/Year</Label>
                <Select 
                  value={selectedSemester} 
                  onValueChange={(value) => {
                    setSelectedSemester(value);
                    setSelectedSection('all'); // Reset section when semester changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester/year" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="all">All Semesters</SelectItem>
                    {availableSemesters.map(semester => {
                      // Count students in this semester based on current filters
                      const semesterYear = semester.replace('Year ', '');
                      let studentCount = 0;
                      
                      if (selectedDepartment && selectedDepartment !== 'all') {
                        const selectedDeptName = filteredDepartments.find(d => d.id === selectedDepartment)?.department_name;
                        const filteredStudents = students?.filter(s => 
                          s.department === selectedDeptName && 
                          s.semesterYear === parseInt(semesterYear)
                        ) || [];
                        
                        if (selectedProgram && selectedProgram !== 'all') {
                          studentCount = filteredStudents.filter(s => s.program === selectedProgram).length;
                        } else {
                          studentCount = filteredStudents.length;
                        }
                      } else {
                        const filteredStudents = students?.filter(s => s.semesterYear === parseInt(semesterYear)) || [];
                        studentCount = filteredStudents.length;
                      }
                      
                      return (
                        <SelectItem key={semester} value={semester}>
                          <div className="flex justify-between items-center w-full">
                            <span>{semester}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {studentCount} students
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Section Detail Filter */}
              <div className="space-y-2">
                <Label htmlFor="section">Section Detail</Label>
                <Select 
                  value={selectedSection} 
                  onValueChange={setSelectedSection}
                  disabled={!selectedSemester || selectedSemester === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border shadow-md z-50">
                    <SelectItem value="all">All Sections</SelectItem>
                    {availableSections.map(section => (
                      <SelectItem key={section.name} value={section.name}>
                        <div className="flex justify-between items-center w-full">
                          <span>{section.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {section.students.length} students
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {(!selectedSemester || selectedSemester === 'all') && (
                  <p className="text-xs text-muted-foreground">
                    Please select Institution, Department, Program, and Semester first
                  </p>
                )}
              </div>

              {/* Student Search */}
              <div className="space-y-2">
                <Label htmlFor="studentSearch">Search Students</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    id="studentSearch"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students by name or roll number..."
                    className="pl-10"
                    disabled={!selectedSection || selectedSection === 'all'}
                  />
                </div>
                {(!selectedSection || selectedSection === 'all') && (
                  <p className="text-xs text-muted-foreground">
                    Please select a section first to enable student search
                  </p>
                )}
              </div>

              {/* Student Results */}
              {selectedSection && selectedSection !== 'all' && (
                <div className="border rounded-md p-2 max-h-60 overflow-y-auto">
                  {(() => {
                    const studentsToShow = getFilteredStudents().filter(student =>
                      !studentSearch || 
                      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      student.rollNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
                      (student.email && student.email.toLowerCase().includes(studentSearch.toLowerCase()))
                    );

                    return studentsToShow.length > 0 ? (
                      studentsToShow.map(student => (
                        <div
                          key={student.id}
                          onClick={() => addStudent(student.id)}
                          className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer rounded"
                        >
                          <div>
                            <span className="font-medium">{student.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">({student.rollNo})</span>
                            <div className="text-xs text-muted-foreground">{student.program}</div>
                            <div className="text-xs text-muted-foreground">{student.department}</div>
                          </div>
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground p-2">
                        {studentSearch ? 'No students found matching your search' : 'No students available in this section'}
                      </p>
                    );
                  })()}
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