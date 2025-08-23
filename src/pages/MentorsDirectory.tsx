import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserCheck, Calendar, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStaffData } from "@/hooks/useStaffData";
import { useDemoMode } from "@/hooks/useDemoMode";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { EtiquetteTip } from "@/components/ui/etiquette-tip";
import { Skeleton } from "@/components/ui/skeleton";
import { MentorFilters, type MentorFilters as MentorFiltersType } from "@/components/mentor/MentorFilters";

const MentorsDirectory = () => {
  const { isDemoMode } = useDemoMode();
  const { staff: mentors, loading, error, refetch } = useStaffData();
  const { departments } = useDepartmentsData();
  const { institutions } = useInstitutionsData();
  const navigate = useNavigate();
  
  const [filters, setFilters] = useState<MentorFiltersType>({
    search: "",
    institution: "all",
    department: "all",
    designation: "all",
    status: "all"
  });

  const filteredMentors = mentors.filter(mentor => {
    // Search filter
    const searchMatch = !filters.search || 
      `${mentor.name}`.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.department?.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.designation?.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      mentor.staffId?.toLowerCase().includes(filters.search.toLowerCase());

    // Institution filter - match through department-institution relationship
    const institutionMatch = (() => {
      if (!filters.institution || filters.institution === "all") return true;
      
      // In demo mode, we don't have real institution-department relationships
      if (isDemoMode) return true;
      
      // Get departments for the selected institution
      const selectedInstitution = institutions.find(inst => inst.institution_name === filters.institution);
      if (!selectedInstitution) return false;
      
      const institutionDepartments = departments
        .filter(dept => dept.institution_id === selectedInstitution.id)
        .map(dept => dept.department_name);
      
      return institutionDepartments.includes(mentor.department);
    })();

    // Department filter - exact match with staff department
    const departmentMatch = !filters.department || filters.department === "all" || 
      mentor.department === filters.department;

    // Designation filter - exact match with staff designation
    const designationMatch = !filters.designation || filters.designation === "all" || 
      mentor.designation === filters.designation;

    // Status filter - exact match with staff status
    const statusMatch = !filters.status || filters.status === "all" || 
      mentor.status === filters.status;

    return searchMatch && institutionMatch && departmentMatch && designationMatch && statusMatch;
  });

  const handleRetrySync = () => {
    refetch();
  };

  const handleFiltersChange = (newFilters: Partial<MentorFiltersType>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      institution: "all",
      department: "all",
      designation: "all",
      status: "all"
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAssignStudents = (mentor: any) => {
    navigate('/assignments', { state: { selectedMentor: mentor } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <DemoModeBanner />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentors Directory</h1>
          <p className="text-gray-600">
            Browse all faculty and staff members who serve as mentors ({mentors.length} total)
          </p>
        </div>

        {/* Etiquette Tip */}
        <div className="mb-6">
          <EtiquetteTip type="respect-time" />
        </div>

        {/* Sync Error Banner */}
        {error && (
          <div className="mb-6">
            <ErrorState 
              message={`Failed to load mentors: ${error}`}
              onRetry={handleRetrySync}
            />
          </div>
        )}

        {/* Search and Filters */}
        <MentorFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          onRefetch={handleRetrySync}
          isDemo={isDemoMode}
          loading={loading}
          staffData={mentors}
        />

        {/* Mentors Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={handleRetrySync}
          />
        ) : filteredMentors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No mentors found"
            description={
              filters.search || Object.values(filters).some(v => v !== "all" && v !== "")
                ? "No mentors match your current filters. Try adjusting your search criteria."
                : "No mentors are available in the directory."
            }
            action={filters.search || Object.values(filters).some(v => v !== "all" && v !== "") ? {
              label: "Clear filters",
              onClick: handleClearFilters
            } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredMentors.map((mentor) => (
               <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                 <CardHeader>
                   <div className="flex items-center space-x-4">
                     <Avatar className="h-12 w-12">
                       <AvatarImage src={undefined} alt={mentor.name} />
                       <AvatarFallback className="bg-blue-100 text-blue-600">
                         {getInitials(mentor.name)}
                       </AvatarFallback>
                     </Avatar>
                     <div className="flex-1">
                       <CardTitle className="text-lg">{mentor.name}</CardTitle>
                       <CardDescription>{mentor.designation}</CardDescription>
                     </div>
                   </div>
                 </CardHeader>
                 <CardContent>
                   <div className="space-y-4">
                     <div>
                       <p className="text-sm font-medium text-gray-600 mb-2">Department</p>
                       <Badge variant="secondary" className="text-xs">
                         {mentor.department || 'Not specified'}
                       </Badge>
                     </div>
                     
                     <div className="space-y-2">
                       <div className="flex items-center text-sm text-gray-600">
                         <Mail className="w-4 h-4 mr-2" />
                         <span className="truncate">{mentor.email}</span>
                       </div>
                       {mentor.mobile && (
                         <div className="flex items-center text-sm text-gray-600">
                           <Phone className="w-4 h-4 mr-2" />
                           <span>{mentor.mobile}</span>
                         </div>
                       )}
                     </div>

                     <div className="flex items-center justify-between">
                       <Badge variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                         {mentor.status}
                       </Badge>
                       <Badge variant="outline" className="text-xs">
                         ID: {mentor.staffId}
                       </Badge>
                     </div>

                     <div className="text-xs text-gray-500">
                       <div className="flex items-center">
                         <Calendar className="w-3 h-3 mr-1" />
                         Synced: Recently
                       </div>
                     </div>

                      <div className="flex space-x-2 pt-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleAssignStudents(mentor)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Assign Students
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Profile
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Mentor Profile</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6">
                              <div className="flex items-center space-x-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarImage src={undefined} alt={mentor.name} />
                                  <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                                    {getInitials(mentor.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-xl font-semibold">{mentor.name}</h3>
                                  <p className="text-gray-600">{mentor.designation}</p>
                                  <Badge variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                                    {mentor.status}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Contact Information</h4>
                                  <div className="space-y-2 text-sm">
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                      <span>{mentor.email}</span>
                                    </div>
                                    {mentor.mobile && (
                                      <div className="flex items-center">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        <span>{mentor.mobile}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div>
                                  <h4 className="font-medium mb-2">Department & Role</h4>
                                  <div className="space-y-2 text-sm">
                                    <p><strong>Department:</strong> {mentor.department || 'Not specified'}</p>
                                    <p><strong>Staff ID:</strong> {mentor.staffId}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Additional Information</h4>
                                <div className="text-sm text-gray-600">
                                  <p>This mentor profile is synchronized from the institutional directory.</p>
                                  <p className="mt-1">Last synced: Recently</p>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                   </div>
                 </CardContent>
               </Card>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsDirectory;