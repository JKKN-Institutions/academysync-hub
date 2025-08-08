import React, { useState, useEffect } from 'react';
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
import { MeetingLogForm } from "@/components/MeetingLogForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const Meetings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [meetingLogs, setMeetingLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch meeting logs from Supabase
  const fetchMeetingLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meeting_logs')
        .select(`
          *,
          counseling_sessions (
            id,
            name,
            session_date,
            start_time,
            end_time,
            session_participants (
              student_external_id
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMeetingLogs(data || []);
    } catch (error) {
      console.error('Error fetching meeting logs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch meeting logs.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingLogs();
  }, []);

  const handleNewMeetingSuccess = () => {
    fetchMeetingLogs();
  };

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
        <Button onClick={() => setShowNewMeetingForm(true)}>
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading meeting logs...
            </div>
          ) : meetingLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meeting logs found. Create your first meeting log by clicking "New Meeting Log" above.
            </div>
          ) : (
            meetingLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {log.counseling_sessions?.name || 'Meeting Log'}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {log.counseling_sessions?.session_date ? 
                            format(new Date(log.counseling_sessions.session_date), "MMM dd, yyyy") : 
                            'No date'
                          }
                        </div>
                        {log.counseling_sessions?.start_time && log.counseling_sessions?.end_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {log.counseling_sessions.start_time} - {log.counseling_sessions.end_time}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {log.counseling_sessions?.session_participants?.length || 0} participant(s)
                        </div>
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
                      <p className="text-sm text-muted-foreground">
                        {log.focus_of_meeting || 'No focus specified'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Updates from Previous Session</h4>
                      <p className="text-sm text-muted-foreground">
                        {log.updates_from_previous || 'No updates provided'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Problems Identified</h4>
                      <p className="text-sm text-muted-foreground">
                        {log.problems_encountered || 'No problems reported'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Resolutions Discussed</h4>
                      <p className="text-sm text-muted-foreground">
                        {log.resolutions_discussed || 'No resolutions provided'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Next Actions</h4>
                    <p className="text-sm text-muted-foreground">
                      {log.next_steps || 'No next steps defined'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Expected Outcome for Next Session</h4>
                    <p className="text-sm text-muted-foreground">
                      {log.expected_outcome_next || 'No expected outcome specified'}
                    </p>
                  </div>
                  
                  {log.next_session_datetime && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Badge variant="outline">
                        <Calendar className="w-3 h-3 mr-1" />
                        Next Session: {format(new Date(log.next_session_datetime), "MMM dd, yyyy 'at' h:mm a")}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
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

      {/* New Meeting Log Form Dialog */}
      <MeetingLogForm
        open={showNewMeetingForm}
        onOpenChange={setShowNewMeetingForm}
        onSuccess={handleNewMeetingSuccess}
      />
    </div>
  );
};

export default Meetings;