import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  GraduationCap,
  Mail,
  Phone,
  Building,
  Award
} from "lucide-react";
import { useStaffData } from "@/hooks/useStaffData";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";

const StaffDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  
  const { staff, loading: staffLoading, error: staffError, refetch: refetchStaff, isDemo } = useStaffData();
  const { students } = useStudentsData();
  const { institutions } = useInstitutionsData();
  const { departments } = useDepartmentsData();

  // Filter departments based on selected institution if needed
  const filteredDepartments = departments;

  // Filter staff based on search, status, institution, and department
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.designation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    
    // Match by department name
    const matchesDepartment = !selectedDepartment || selectedDepartment === "all" || 
      departments.find(dept => dept.id === selectedDepartment)?.department_name === member.department;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get students assigned to each staff member (mock data for now)
  const getAssignedStudents = (staffId: string) => {
    // This would be real data from your assignment/mentoring system
    return students.filter(student => student.mentor === staffId).slice(0, 3);
  };

  const activeStaffCount = staff.filter(member => member.status === 'active').length;
  const inactiveStaffCount = staff.filter(member => member.status === 'inactive').length;

  if (staffLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (staffError && !isDemo) {
    return (
      <div className="p-6">
        <EmptyState
          icon={Users}
          title="Failed to load staff"
          description={staffError}
          action={{
            label: "Retry",
            onClick: refetchStaff
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {isDemo && <DemoModeBanner />}
      
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
        <p className="text-gray-600">
          Manage and view all faculty and staff members in the system
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total Staff</p>
                <p className="text-2xl font-bold text-blue-600">{staff.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Active Staff</p>
                <p className="text-2xl font-bold text-green-600">{activeStaffCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Inactive Staff</p>
                <p className="text-2xl font-bold text-red-600">{inactiveStaffCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-purple-600">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters & Search
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetchStaff}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Institution Filter */}
              <div className="flex-1">
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Institutions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Institutions</SelectItem>
                    {institutions.map(institution => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.institution_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="flex-1">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {filteredDepartments.map(department => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Status Filter */}
              <div className="flex-1">
                <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Inactive Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || selectedInstitution || selectedDepartment) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:bg-gray-200 rounded">
                    ×
                  </button>
                </Badge>
              )}
              {selectedInstitution && selectedInstitution !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Institution: {institutions.find(inst => inst.id === selectedInstitution)?.institution_name}
                  <button onClick={() => setSelectedInstitution("all")} className="ml-1 hover:bg-gray-200 rounded">
                    ×
                  </button>
                </Badge>
              )}
              {selectedDepartment && selectedDepartment !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Department: {filteredDepartments.find(dept => dept.id === selectedDepartment)?.department_name}
                  <button onClick={() => setSelectedDepartment("all")} className="ml-1 hover:bg-gray-200 rounded">
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("all")} className="ml-1 hover:bg-gray-200 rounded">
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredStaff.length} of {staff.length} staff members
        </p>
      </div>

      {/* Staff List */}
      {filteredStaff.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No staff found"
          description="No staff members match your current filters. Try adjusting your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => {
            const assignedStudents = getAssignedStudents(member.id);
            
            return (
              <Card key={member.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          {member.designation}
                        </p>
                      </div>
                    </div>
                    <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                      {member.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Contact Information */}
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2" />
                      {member.department}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {member.email}
                    </div>
                    {member.mobile && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {member.mobile}
                      </div>
                    )}
                  </div>
                  
                  {/* Assigned Students */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        Mentoring ({assignedStudents.length})
                      </span>
                    </div>
                    {assignedStudents.length > 0 ? (
                      <div className="space-y-1">
                        {assignedStudents.map((student) => (
                          <div key={student.id} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                            {student.name} - {student.program}
                          </div>
                        ))}
                        {students.filter(s => s.mentor === member.id).length > 3 && (
                          <p className="text-xs text-blue-600">
                            +{students.filter(s => s.mentor === member.id).length - 3} more students
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No students assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StaffDirectory;