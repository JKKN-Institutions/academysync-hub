
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Clock, Calendar, AlertTriangle, UserPlus, Settings } from "lucide-react";
import { AssignmentModeBanner } from "@/components/ui/assignment-mode-banner";
import { useAssignmentMode } from "@/hooks/useAssignmentMode";
import { useAssignments } from "@/hooks/useAssignments";
import MentorAssignmentWizard from "@/components/MentorAssignmentWizard";
import { useState } from "react";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

const Assignments = () => {
  const { isAppManaged, isUpstreamManaged } = useAssignmentMode();
  const { assignments, loading, error, getAssignmentStats, refetch } = useAssignments();
  const [showAssignmentWizard, setShowAssignmentWizard] = useState(false);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <CardSkeleton count={6} />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorState message={error} onRetry={refetch} />
      </div>
    );
  }

  const activeAssignments = assignments.filter(a => a.status === "active");
  const pendingAssignments = assignments.filter(a => a.status === "pending");
  const stats = getAssignmentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Assignment Mode Banner */}
        <div className="mb-6">
          <AssignmentModeBanner />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentor-Mentee Assignments</h1>
              <p className="text-gray-600">
                {isUpstreamManaged 
                  ? "View assignments synchronized from the external system"
                  : "Manage mentoring relationships and track progress"
                }
              </p>
            </div>
            {isAppManaged && (
              <div className="flex space-x-2">
                <Button onClick={() => setShowAssignmentWizard(true)}>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Fresh Assignment
                </Button>
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Bulk Operations
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Needs Attention</p>
                  <p className="text-3xl font-bold text-red-600">{stats.needsAttention}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Assignments ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Active ({stats.active})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AssignmentsList assignments={assignments} />
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <AssignmentsList assignments={activeAssignments} />
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <AssignmentsList assignments={pendingAssignments} />
          </TabsContent>
        </Tabs>

        {/* Assignment Wizard */}
        <MentorAssignmentWizard
          open={showAssignmentWizard}
          onOpenChange={setShowAssignmentWizard}
          onAssignmentCreated={() => {
            refetch();
          }}
        />
      </div>
    </div>
  );
};

interface AssignmentsListProps {
  assignments: any[];
}

const AssignmentsList = ({ assignments }: AssignmentsListProps) => {
  const { isAppManaged } = useAssignmentMode();
  
  return (
    <div className="grid gap-6">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span>Assignment #{assignment.id.substring(0, 8)}</span>
                <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                  {assignment.status}
                </Badge>
              </CardTitle>
              <div className="text-sm text-gray-500">
                {new Date(assignment.effective_from).toLocaleDateString()} - {assignment.effective_to ? new Date(assignment.effective_to).toLocaleDateString() : 'Ongoing'}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor and Mentee Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {assignment.mentor_external_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Mentor</p>
                    <p className="text-sm text-gray-600">ID: {assignment.mentor_external_id}</p>
                    <p className="text-xs text-gray-500">{assignment.role} mentor</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {assignment.student_external_id.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Student</p>
                    <p className="text-sm text-gray-600">ID: {assignment.student_external_id}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Assignment Type</p>
                    <p className="text-xl font-bold text-blue-600 capitalize">{assignment.role}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="text-xl font-bold text-green-600 capitalize">
                      {assignment.status}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Created: {new Date(assignment.created_at).toLocaleDateString()}
                  </div>
                  {assignment.notes && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {assignment.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="text-sm text-gray-500">
                Assignment ID: {assignment.id}
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">View Details</Button>
                {isAppManaged && (
                  <Button variant="outline" size="sm">Edit Assignment</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {assignments.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No assignments found.</p>
            <p className="text-gray-400 mt-2">Create a new assignment to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Assignments;
