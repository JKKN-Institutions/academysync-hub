import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Filter, UserCheck, Calendar, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { useStaffData } from "@/hooks/useStaffData";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { EtiquetteTip } from "@/components/ui/etiquette-tip";
import { Skeleton } from "@/components/ui/skeleton";

const MentorsDirectory = () => {
  const { isDemoMode } = useDemoMode();
  const { staff: mentors, loading, error, refetch } = useStaffData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMentors = mentors.filter(mentor =>
    `${mentor.name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.staffId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRetrySync = () => {
    refetch();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search mentors by name, department, designation, email, or staff ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

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
              searchTerm 
                ? `No mentors match "${searchTerm}". Try adjusting your search.`
                : "No mentors are available in the directory."
            }
            action={searchTerm ? {
              label: "Clear search",
              onClick: () => setSearchTerm("")
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
                       <Button size="sm" className="flex-1">
                         <UserCheck className="w-4 h-4 mr-1" />
                         Assign Students
                       </Button>
                       <Button variant="outline" size="sm">
                         View Profile
                       </Button>
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