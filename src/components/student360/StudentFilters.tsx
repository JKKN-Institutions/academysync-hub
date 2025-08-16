import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X, RefreshCw } from "lucide-react";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { SelectLoadingItem } from "@/components/ui/select-loading";
import type { Student360Filters } from "@/hooks/useStudent360Data";

interface StudentFiltersProps {
  filters: Student360Filters;
  onFiltersChange: (filters: Partial<Student360Filters>) => void;
  onClearFilters: () => void;
  onRefetch?: () => void;
  isDemo?: boolean;
  loading?: boolean;
}

export const StudentFilters: React.FC<StudentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onRefetch,
  isDemo = false,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || "");
  const { institutions, loading: institutionsLoading } = useInstitutionsData();
  const { departments, loading: departmentsLoading } = useDepartmentsData();

  // Demo data for institutions, departments, etc.
  const demoInstitutions = [
    { id: 'jkkn_1', institution_name: 'JKKN College of Engineering & Technology' },
    { id: 'jkkn_2', institution_name: 'JKKN College of Arts & Science' },
    { id: 'jkkn_3', institution_name: 'JKKN Dental College & Hospital' }
  ];

  const demoDepartments = [
    { id: 'cse', department_name: 'Computer Science & Engineering' },
    { id: 'ece', department_name: 'Electronics & Communication Engineering' },
    { id: 'mech', department_name: 'Mechanical Engineering' },
    { id: 'civil', department_name: 'Civil Engineering' },
    { id: 'eee', department_name: 'Electrical & Electronics Engineering' }
  ];

  const demoDegrees = [
    { id: 'btech', name: 'Bachelor of Technology' },
    { id: 'mtech', name: 'Master of Technology' },
    { id: 'bsc', name: 'Bachelor of Science' },
    { id: 'msc', name: 'Master of Science' },
    { id: 'phd', name: 'Doctor of Philosophy' }
  ];

  const demoSections = ['A', 'B', 'C', 'D'];
  const demoSemesters = [1, 2, 3, 4, 5, 6, 7, 8];

  // Use real data when not in demo mode
  const activeInstitutions = isDemo ? demoInstitutions : institutions;
  
  // Filter departments based on selected institution
  const filteredDepartments = isDemo 
    ? demoDepartments 
    : filters.institution && filters.institution !== 'all'
      ? departments.filter(dept => dept.institution_id === filters.institution)
      : departments;
  
  const activeDepartments = filteredDepartments;
  
  // Get programs from actual student data, filtered by institution and department
  const getFilteredPrograms = () => {
    const allPrograms = new Set<string>();
    
    // Get programs from departments data based on selected institution
    if (!isDemo && filteredDepartments.length > 0) {
      // In real scenario, we should fetch programs from the departments
      // For now, we'll extract unique programs from available data
      filteredDepartments.forEach(dept => {
        // Add some default programs based on department type
        if (dept.department_name.toLowerCase().includes('engineering')) {
          allPrograms.add(`B.Tech ${dept.department_name}`);
          allPrograms.add(`M.Tech ${dept.department_name}`);
        } else if (dept.department_name.toLowerCase().includes('computer')) {
          allPrograms.add('B.Tech Computer Science & Engineering');
          allPrograms.add('M.Tech Computer Science & Engineering');
          allPrograms.add('B.Sc Computer Science');
          allPrograms.add('M.Sc Computer Science');
        } else {
          allPrograms.add(`Bachelor of ${dept.department_name}`);
          allPrograms.add(`Master of ${dept.department_name}`);
        }
      });
    }
    
    // Demo programs for demo mode
    const demoPrograms = [
      'B.Tech Computer Science & Engineering',
      'B.Tech Electronics & Communication Engineering', 
      'B.Tech Mechanical Engineering',
      'B.Tech Civil Engineering',
      'B.Tech Electrical & Electronics Engineering',
      'M.Tech Computer Science & Engineering',
      'B.Sc Computer Science',
      'M.Sc Computer Science',
      'Bachelor of Arts',
      'Master of Arts',
      'Bachelor of Commerce', 
      'Master of Commerce'
    ];
    
    if (isDemo) {
      demoPrograms.forEach(program => allPrograms.add(program));
    }
    
    // If no specific filtering, add some default programs
    if (allPrograms.size === 0) {
      [
        'B.Tech Computer Science & Engineering',
        'B.Tech Electronics & Communication Engineering',
        'Bachelor of Arts',
        'Bachelor of Commerce'
      ].forEach(program => allPrograms.add(program));
    }
    
    return Array.from(allPrograms).sort().map((program, index) => ({
      id: `program_${index}`,
      name: program
    }));
  };
  
  const activePrograms = getFilteredPrograms();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ searchTerm: value });
  };

  const handleFilterChange = (key: keyof Student360Filters, value: string | number) => {
    if (value === "all" || value === "") {
      const newFilters = { ...filters };
      delete newFilters[key];
      
      // If institution is being cleared, also clear department and program
      if (key === 'institution') {
        delete newFilters.department;
        delete newFilters.program;
      }
      // If department is being cleared, also clear program
      if (key === 'department') {
        delete newFilters.program;
      }
      
      onFiltersChange(newFilters);
    } else {
      // If institution changes, clear department and program filters
      if (key === 'institution') {
        const newFilters = { ...filters };
        delete newFilters.department;
        delete newFilters.program;
        newFilters[key] = value as any;
        onFiltersChange(newFilters);
      } 
      // If department changes, clear program filter
      else if (key === 'department') {
        const newFilters = { ...filters };
        delete newFilters.program;
        newFilters[key] = value as any;
        onFiltersChange(newFilters);
      } else {
        onFiltersChange({ [key]: value });
      }
    }
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  const getInstitutionName = (id: string) => {
    return activeInstitutions.find(inst => inst.id === id)?.institution_name || id;
  };

  const getDepartmentName = (id: string) => {
    return activeDepartments.find(dept => dept.id === id)?.department_name || id;
  };

  const getProgramName = (id: string) => {
    return activePrograms.find(program => program.id === id)?.name || id;
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search students by name, roll number, email..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Institution Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Institution {institutionsLoading && <span className="text-xs">(Loading...)</span>}
              </label>
              <Select
                value={filters.institution || "all"}
                onValueChange={(value) => handleFilterChange('institution', value)}
                disabled={institutionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={institutionsLoading ? "Loading institutions..." : "All Institutions"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Institutions</SelectItem>
                  {institutionsLoading ? (
                    <SelectLoadingItem message="Loading institutions..." />
                  ) : (
                    activeInstitutions.map(institution => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.institution_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Department Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Department {departmentsLoading && <span className="text-xs">(Loading...)</span>}
              </label>
              <Select
                value={filters.department || "all"}
                onValueChange={(value) => handleFilterChange('department', value)}
                disabled={departmentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "All Departments"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departmentsLoading ? (
                    <SelectLoadingItem message="Loading departments..." />
                  ) : (
                    activeDepartments.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.department_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Program Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Program</label>
              <Select
                value={filters.program || "all"}
                onValueChange={(value) => handleFilterChange('program', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Programs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Programs</SelectItem>
                  {activePrograms.map(program => (
                    <SelectItem key={program.id} value={program.id}>
                      {program.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            {/* Semester/Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Semester/Year</label>
              <Select
                value={filters.semester?.toString() || "all"}
                onValueChange={(value) => handleFilterChange('semester', value === "all" ? "all" : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Semesters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {demoSemesters.map(semester => (
                    <SelectItem key={semester} value={semester.toString()}>
                      Semester {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section Detail Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Section Detail</label>
              <Select
                value={filters.section || "all"}
                onValueChange={(value) => handleFilterChange('section', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {demoSections.map(section => (
                    <SelectItem key={section} value={section}>
                      Section {section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground invisible">Actions</label>
              <div className="flex gap-2">
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearFilters}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
                {!isDemo && onRefetch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefetch}
                    disabled={loading}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">Active Filters:</span>
              {filters.searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.searchTerm}
                  <button
                    onClick={() => handleSearchChange("")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.institution && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Institution: {getInstitutionName(filters.institution)}
                  <button
                    onClick={() => handleFilterChange('institution', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.department && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Department: {getDepartmentName(filters.department)}
                  <button
                    onClick={() => handleFilterChange('department', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.program && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Program: {getProgramName(filters.program)}
                  <button
                    onClick={() => handleFilterChange('program', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.section && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Section: {filters.section}
                  <button
                    onClick={() => handleFilterChange('section', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.semester && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Semester: {filters.semester}
                  <button
                    onClick={() => handleFilterChange('semester', '')}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};