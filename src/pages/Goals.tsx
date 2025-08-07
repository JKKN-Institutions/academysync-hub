import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Plus, 
  Search, 
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Edit,
  Trash2,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GoalForm } from "@/components/GoalForm";
import { useGoals } from "@/hooks/useGoals";
import { useStudentsData } from "@/hooks/useStudentsData";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Goals = () => {
  const { user } = useAuth();
  const { goals, loading, updateGoalStatus, deleteGoal } = useGoals();
  const { students } = useStudentsData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    return student ? `${student.name} (${student.rollNo})` : 'Unknown Student';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'accepted':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'in_progress':
      case 'accepted':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'accepted':
        return 'Accepted';
      case 'proposed':
        return 'Proposed';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleStatusUpdate = async (goalId: string, newStatus: any) => {
    try {
      await updateGoalStatus(goalId, newStatus);
      toast({
        title: "✅ Status Updated",
        description: `Goal status updated to ${getStatusText(newStatus)}`,
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to update goal status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteGoal(goalId);
      toast({
        title: "✅ Goal Deleted",
        description: "Goal has been successfully deleted",
      });
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to delete goal",
        variant: "destructive",
      });
    }
  };

  const filteredGoals = goals.filter(goal =>
    goal.area_of_focus.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.smart_goal_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getStudentName(goal.student_external_id).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getProgress = (status: string) => {
    switch (status) {
      case 'completed':
        return 100;
      case 'in_progress':
      case 'accepted':
        return 50;
      case 'proposed':
        return 25;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Goals & Action Plans</h1>
            <p className="text-muted-foreground">Track and manage student goals and action plans</p>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Goals & Action Plans</h1>
          <p className="text-muted-foreground">
            Track and manage student goals and action plans
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Goals</p>
                <p className="text-2xl font-bold text-blue-600">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {goals.filter(g => g.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {goals.filter(g => g.status === 'in_progress' || g.status === 'accepted').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Proposed</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {goals.filter(g => g.status === 'proposed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search goals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No Goals Found"
          description="No goals match your search criteria. Create a new goal to get started."
        />
      ) : (
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Goals ({filteredGoals.length})</TabsTrigger>
            <TabsTrigger value="active">
              Active ({filteredGoals.filter(g => g.status !== 'completed' && g.status !== 'cancelled').length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({filteredGoals.filter(g => g.status === 'completed').length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {filteredGoals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold">{goal.area_of_focus}</h3>
                          <Badge variant={getStatusColor(goal.status)}>
                            {getStatusIcon(goal.status)}
                            <span className="ml-1">{getStatusText(goal.status)}</span>
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-2">{goal.smart_goal_text}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {goal.target_date ? format(new Date(goal.target_date), 'PPP') : 'No target date'}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {getStudentName(goal.student_external_id)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleStatusUpdate(goal.id, goal.status === 'completed' ? 'in_progress' : 'completed')}
                        >
                          {goal.status === 'completed' ? 'Mark In Progress' : 'Mark Complete'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">{getProgress(goal.status)}%</span>
                      </div>
                      <Progress value={getProgress(goal.status)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
          
          <TabsContent value="active">
            <div className="space-y-4">
              {filteredGoals.filter(g => g.status !== 'completed' && g.status !== 'cancelled').map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{goal.area_of_focus}</h3>
                        <p className="text-muted-foreground">{getStudentName(goal.student_external_id)}</p>
                      </div>
                      <Badge variant={getStatusColor(goal.status)}>
                        {getStatusText(goal.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="space-y-4">
              {filteredGoals.filter(g => g.status === 'completed').map((goal) => (
                <Card key={goal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold">{goal.area_of_focus}</h3>
                        <p className="text-muted-foreground">{getStudentName(goal.student_external_id)}</p>
                      </div>
                      <Badge variant="default">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Goal Creation Form */}
      <GoalForm
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onGoalCreated={() => {
          // Goals will be automatically updated via real-time subscription
        }}
      />
    </div>
  );
};

export default Goals;