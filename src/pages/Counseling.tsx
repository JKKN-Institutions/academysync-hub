import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SessionForm } from "@/components/SessionForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Counseling = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "completed" | "cancelled">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleSessionSubmit = (sessionData: any) => {
    console.log('Creating new session:', sessionData);
    // TODO: Implement actual session creation
    setIsFormOpen(false);
  };

  // Mock data for counseling sessions
  const sessions = [
    {
      id: "1",
      title: "Career Guidance Session",
      date: "2024-01-15",
      time: "10:00 AM",
      type: "1:1",
      students: ["John Doe"],
      status: "pending",
      mentor: "Dr. Smith"
    },
    {
      id: "2", 
      title: "Academic Planning",
      date: "2024-01-14",
      time: "2:00 PM", 
      type: "group",
      students: ["Jane Smith", "Mike Johnson"],
      status: "completed",
      mentor: "Prof. Williams"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Counseling Sessions</h1>
          <p className="text-muted-foreground">
            Manage and track your counseling sessions
          </p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Counseling Session</DialogTitle>
            </DialogHeader>
            <SessionForm
              onSubmit={handleSessionSubmit}
              onCancel={() => setIsFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{session.title}</h3>
                      <Badge variant={getStatusColor(session.status)}>
                        {getStatusIcon(session.status)}
                        <span className="ml-1">{session.status}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {session.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {session.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {session.type} ({session.students.length} student{session.students.length > 1 ? 's' : ''})
                      </div>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Students: </span>
                      {session.students.join(', ')}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="text-center py-8 text-muted-foreground">
            No upcoming sessions
          </div>
        </TabsContent>
        
        <TabsContent value="completed">
          <div className="text-center py-8 text-muted-foreground">
            No completed sessions yet
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Counseling;