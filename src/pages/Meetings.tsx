import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter,
  Clock,
  Users,
  FileText,
  Edit
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Meetings = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock meeting logs data
  const meetingLogs = [
    {
      id: "1",
      sessionTitle: "Career Guidance Session",
      date: "2024-01-14",
      time: "10:00 AM - 11:00 AM",
      participants: ["John Doe"],
      mentor: "Dr. Smith",
      focus: "Career planning and internship opportunities",
      updates: "Discussed previous action items regarding resume building",
      problems: "Lack of clarity on preferred career path",
      resolutions: "Explored different career options in computer science",
      nextActions: "Research specific companies and roles, update resume",
      expectedOutcome: "Clear career direction and updated application materials",
      nextSession: "2024-01-21 at 10:00 AM"
    },
    {
      id: "2",
      sessionTitle: "Academic Planning",
      date: "2024-01-12",
      time: "2:00 PM - 3:00 PM", 
      participants: ["Jane Smith", "Mike Johnson"],
      mentor: "Prof. Williams",
      focus: "Course selection for next semester",
      updates: "Both students completed prerequisite courses successfully",
      problems: "Scheduling conflicts with required courses",
      resolutions: "Identified alternative course sequences",
      nextActions: "Submit course registration forms by deadline",
      expectedOutcome: "Optimal course schedule finalized",
      nextSession: "2024-01-19 at 2:00 PM"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Meeting Logs</h1>
          <p className="text-muted-foreground">
            Document and track counseling session minutes and outcomes
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Meeting Log
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold text-blue-600">{meetingLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-green-600">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Students Involved</p>
                <p className="text-2xl font-bold text-purple-600">12</p>
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
              placeholder="Search meeting logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Meeting Logs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Logs</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="upcoming">Follow-ups</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {meetingLogs.map((log) => (
            <Card key={log.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{log.sessionTitle}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {log.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {log.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {log.participants.length} participant{log.participants.length > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-sm mt-1">
                      <span className="font-medium">Mentor: </span>{log.mentor}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Participants: </span>{log.participants.join(', ')}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Log
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Meeting Log Template Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Focus Area</h4>
                    <p className="text-sm text-muted-foreground">{log.focus}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Updates from Previous Session</h4>
                    <p className="text-sm text-muted-foreground">{log.updates}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Problems Identified</h4>
                    <p className="text-sm text-muted-foreground">{log.problems}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Resolutions Discussed</h4>
                    <p className="text-sm text-muted-foreground">{log.resolutions}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Next Actions</h4>
                  <p className="text-sm text-muted-foreground">{log.nextActions}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Expected Outcome for Next Session</h4>
                  <p className="text-sm text-muted-foreground">{log.expectedOutcome}</p>
                </div>
                
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Next Session: {log.nextSession}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="recent">
          <div className="text-center py-8 text-muted-foreground">
            Recent meeting logs from the past week
          </div>
        </TabsContent>
        
        <TabsContent value="upcoming">
          <div className="text-center py-8 text-muted-foreground">
            Scheduled follow-up sessions and pending actions
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Meetings;