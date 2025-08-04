
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, Clock, Calendar, AlertTriangle } from "lucide-react";
import { AssignmentModeBanner } from "@/components/ui/assignment-mode-banner";
import { useAssignmentMode } from "@/hooks/useAssignmentMode";

const Assignments = () => {
  const { isAppManaged, isUpstreamManaged } = useAssignmentMode();
  
  // Mock data - would come from app database
  const assignments = [
    {
      id: "assign_001",
      mentorId: "ext_001",
      mentorName: "Dr. Sarah Johnson",
      menteeId: "ext_101", 
      menteeName: "Alex Chen",
      startDate: "2024-01-15",
      endDate: "2024-12-15",
      status: "Active",
      sessionsCount: 12,
      lastSession: "2024-01-02",
      nextSession: "2024-01-08",
      goals: 3,
      completedGoals: 1
    },
    {
      id: "assign_002",
      mentorId: "ext_001", 
      mentorName: "Dr. Sarah Johnson",
      menteeId: "ext_102",
      menteeName: "Maria Rodriguez",
      startDate: "2024-01-10",
      endDate: "2024-12-10", 
      status: "Pending",
      sessionsCount: 0,
      lastSession: null,
      nextSession: "2024-01-05",
      goals: 0,
      completedGoals: 0
    }
  ];

  const activeAssignments = assignments.filter(a => a.status === "Active");
  const pendingAssignments = assignments.filter(a => a.status === "Pending");

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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
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
                  <p className="text-3xl font-bold text-blue-600">{assignments.length}</p>
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
                  <p className="text-3xl font-bold text-green-600">{activeAssignments.length}</p>
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
                  <p className="text-3xl font-bold text-yellow-600">{pendingAssignments.length}</p>
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
                  <p className="text-3xl font-bold text-red-600">1</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Assignments ({assignments.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeAssignments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingAssignments.length})</TabsTrigger>
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
                <span>Assignment #{assignment.id.split('_')[1]}</span>
                <Badge variant={assignment.status === 'Active' ? 'default' : 'secondary'}>
                  {assignment.status}
                </Badge>
              </CardTitle>
              <div className="text-sm text-gray-500">
                {assignment.startDate} - {assignment.endDate}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor and Mentee Info */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{assignment.mentorName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{assignment.mentorName}</p>
                    <p className="text-sm text-gray-600">Mentor • ID: {assignment.mentorId}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{assignment.menteeName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{assignment.menteeName}</p>
                    <p className="text-sm text-gray-600">Mentee • ID: {assignment.menteeId}</p>
                  </div>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Sessions Completed</p>
                    <p className="text-xl font-bold text-blue-600">{assignment.sessionsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Goals Progress</p>
                    <p className="text-xl font-bold text-green-600">
                      {assignment.completedGoals}/{assignment.goals}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {assignment.lastSession && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="w-4 h-4 mr-2" />
                      Last session: {assignment.lastSession}
                    </div>
                  )}
                  {assignment.nextSession && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Next session: {assignment.nextSession}
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
