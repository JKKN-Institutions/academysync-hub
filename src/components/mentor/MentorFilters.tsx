import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { SelectLoadingItem } from "@/components/ui/select-loading";

export interface MentorFilters {
  search: string;
  institution: string;
  department: string;
  designation: string;
  status: string;
}

interface MentorFiltersProps {
  filters: MentorFilters;
  onFiltersChange: (filters: Partial<MentorFilters>) => void;
  onClearFilters: () => void;
  onRefetch?: () => void;
  isDemo?: boolean;
  loading?: boolean;
  staffData?: any[];
}

export const MentorFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  onRefetch,
  isDemo = false,
  loading = false,
  staffData = []
}: MentorFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState(filters.search);
  
  const { institutions, loading: institutionsLoading } = useInstitutionsData();
  const { departments, loading: departmentsLoading } = useDepartmentsData();

  // Get unique values from actual staff data
  const getUniqueValues = (field: string) => {
    if (!staffData || staffData.length === 0) return [];
    return [...new Set(staffData.map(staff => staff[field]).filter(Boolean))].sort();
  };

  // Demo data when not using real API
  const demoInstitutions = [
    { id: '1', institution_name: 'JKKN College of Engineering & Technology', code: 'JKKN-ENG' },
    { id: '2', institution_name: 'JKKN College of Pharmacy', code: 'JKKN-PHARM' },
    { id: '3', institution_name: 'JKKN Dental College', code: 'JKKN-DENTAL' }
  ];

  const demoDepartments = [
    { id: '1', department_name: 'Computer Science', code: 'CS' },
    { id: '2', department_name: 'Mechanical Engineering', code: 'MECH' },
    { id: '3', department_name: 'Electrical Engineering', code: 'EEE' },
    { id: '4', department_name: 'Pharmacy', code: 'PHARM' },
    { id: '5', department_name: 'Dentistry', code: 'DENT' }
  ];

  // Use actual data from database or demo data
  const activeInstitutions = isDemo ? demoInstitutions : (institutions.filter(i => i.status === 'active'));
  const availableDepartments = isDemo ? demoDepartments : (departments.filter(d => d.status === 'active'));

  // Get unique departments from staff data (primary source)
  const staffDepartments = staffData && staffData.length > 0 
    ? getUniqueValues('department')
    : [];
  
  // Combine staff departments with database departments
  const allDepartments = [...new Set([
    ...staffDepartments,
    ...availableDepartments.map(d => d.department_name)
  ])].filter(Boolean).sort();

  // Get unique designations and status from staff data
  const staffDesignations = getUniqueValues('designation');
  const designations = isDemo 
    ? ['Professor', 'Associate Professor', 'Assistant Professor', 'Senior Lecturer', 'Lecturer'] 
    : (staffDesignations.length > 0 ? staffDesignations : ['Professor', 'Associate Professor', 'Assistant Professor']);

  const staffStatuses = getUniqueValues('status');
  const statusOptions = isDemo 
    ? ['active', 'inactive'] 
    : (staffStatuses.length > 0 ? staffStatuses : ['active', 'inactive']);

  // Filter departments based on selected institution
  const getDepartmentsByInstitution = () => {
    if (isDemo) {
      return demoDepartments.map(d => d.department_name);
    }
    
    if (filters.institution === 'all' || !filters.institution) {
      // Show all available departments
      return allDepartments;
    }
    
    // Find the selected institution
    const selectedInstitution = activeInstitutions.find(
      inst => inst.institution_name === filters.institution
    );
    
    if (!selectedInstitution || !('institution_id' in selectedInstitution)) {
      return allDepartments;
    }
    
    // Get departments linked to this institution from database
    const institutionDepartments = availableDepartments
      .filter(dept => {
        // Type guard: ensure dept has institution_id
        if ('institution_id' in dept && dept.institution_id) {
          return dept.institution_id === selectedInstitution.institution_id;
        }
        return false;
      })
      .map(d => d.department_name);
    
    // If no departments found in database for this institution, show all staff departments
    if (institutionDepartments.length === 0) {
      return allDepartments;
    }
    
    return institutionDepartments.sort();
  };

  const departmentOptions = getDepartmentsByInstitution();

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onFiltersChange({ search: value });
  };

  const handleFilterChange = (key: keyof MentorFilters, value: string) => {
    // If institution changes, clear department filter
    if (key === 'institution') {
      onFiltersChange({ [key]: value, department: 'all' });
    } else {
      onFiltersChange({ [key]: value });
    }
  };

  const getActiveFilterCount = () => {
    return Object.entries(filters).filter(([key, value]) => 
      key !== 'search' && value && value !== 'all'
    ).length;
  };

  const hasActiveFilters = () => {
    return Object.entries(filters).some(([key, value]) => 
      (key === 'search' && value) || (key !== 'search' && value && value !== 'all')
    );
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search mentors by name, email, or staff ID..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Institution */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Institution {institutionsLoading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
              </label>
              <Select
                value={filters.institution}
                onValueChange={(value) => handleFilterChange('institution', value)}
                disabled={institutionsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={institutionsLoading ? "Loading institutions..." : "All Institutions"} />
                </SelectTrigger>
                 <SelectContent className="bg-background border border-border">
                   <SelectItem value="all">All Institutions</SelectItem>
                   {institutionsLoading ? (
                     <SelectLoadingItem message="Loading institutions..." />
                   ) : (
                     activeInstitutions.map((institution) => (
                       <SelectItem key={institution.id} value={institution.institution_name}>
                         {institution.institution_name}
                       </SelectItem>
                     ))
                   )}
                 </SelectContent>
              </Select>
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Department {departmentsLoading && <span className="text-xs text-muted-foreground">(Loading...)</span>}
              </label>
              <Select
                value={filters.department}
                onValueChange={(value) => handleFilterChange('department', value)}
                disabled={departmentsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={departmentsLoading ? "Loading departments..." : "All Departments"} />
                </SelectTrigger>
                 <SelectContent className="bg-background border border-border">
                   <SelectItem value="all">All Departments</SelectItem>
                   {departmentsLoading && !isDemo && staffData.length === 0 ? (
                     <SelectLoadingItem message="Loading departments..." />
                   ) : (
                     departmentOptions.map((department, index) => (
                       <SelectItem key={index} value={department}>
                         {department}
                       </SelectItem>
                     ))
                   )}
                 </SelectContent>
              </Select>
            </div>

            {/* Designation */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Designation
              </label>
              <Select
                value={filters.designation}
                onValueChange={(value) => handleFilterChange('designation', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Designations" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  <SelectItem value="all">All Designations</SelectItem>
                  {designations.map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Status
              </label>
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters() && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{filters.search}"
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleSearchChange('')}
                  />
                </Badge>
              )}
              {filters.institution && filters.institution !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Institution: {filters.institution}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleFilterChange('institution', 'all')}
                  />
                </Badge>
              )}
              {filters.department && filters.department !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Department: {filters.department}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleFilterChange('department', 'all')}
                  />
                </Badge>
              )}
              {filters.designation && filters.designation !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Designation: {filters.designation}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleFilterChange('designation', 'all')}
                  />
                </Badge>
              )}
              {filters.status && filters.status !== 'all' && (
                <Badge variant="secondary" className="text-xs">
                  Status: {filters.status}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer" 
                    onClick={() => handleFilterChange('status', 'all')}
                  />
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
            <div className="flex-1 text-sm text-muted-foreground">
              {getActiveFilterCount() > 0 && (
                <span>{getActiveFilterCount()} filter{getActiveFilterCount() > 1 ? 's' : ''} applied</span>
              )}
            </div>
            <div className="flex gap-2">
              {hasActiveFilters() && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClearFilters}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              {onRefetch && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRefetch}
                  disabled={loading}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>

          {/* Helper Text */}
          <div className="text-xs text-muted-foreground pt-2 border-t">
            {staffData.length === 0 && !loading ? (
              <span className="text-warning">⚠️ No staff data available. Please sync staff data from Admin panel.</span>
            ) : (
              <span>
                Showing {staffData.length} mentor{staffData.length !== 1 ? 's' : ''} • 
                {departmentOptions.length} department{departmentOptions.length !== 1 ? 's' : ''} • 
                {designations.length} designation{designations.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};