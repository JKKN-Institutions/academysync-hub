import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  Target,
  MessageSquare,
  FileText,
  Edit
} from "lucide-react";
import { CounselingSession } from "@/hooks/useCounselingSessions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStudentsData } from "@/hooks/useStudentsData";

interface SessionDetailsModalProps {
  session: CounselingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (sessionId: string, status: 'pending' | 'completed' | 'cancelled') => void;
}

interface MeetingLog {
  id: string;
  focus_of_meeting: string;
  updates_from_previous?: string;
  problems_encountered?: string;
  resolutions_discussed?: string;
  next_steps?: string;
  expected_outcome_next?: string;
  next_session_datetime?: string;
  created_at: string;
}

interface Goal {
  id: string;
  area_of_focus: string;
  smart_goal_text: string;
  knowledge_what?: string;
  knowledge_how?: string;
  skills_what?: string;
  skills_how?: string;
  action_plan?: string;
  target_date?: string;
  status: string;
  created_at: string;
}

export const SessionDetailsModal: React.FC<SessionDetailsModalProps> = ({
  session,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  console.log('SessionDetailsModal render:', { session: !!session, isOpen });
  
  const [meetingLogs, setMeetingLogs] = useState<MeetingLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { students } = useStudentsData();

  // Helper function to get student name from external ID
  const getStudentDisplayInfo = (studentExternalId: string) => {
    const student = students.find(s => s.studentId === studentExternalId);
    if (student) {
      return {
        name: student.name,
        email: student.email,
        rollNo: student.rollNo,
        department: student.department,
        program: student.program
      };
    }
    return {
      name: `Student ID: ${studentExternalId}`,
      email: '',
      rollNo: '',
      department: '',
      program: ''
    };
  };

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

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString([], {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const fetchSessionDetails = async (sessionId: string) => {
    setLoading(true);
    try {
      // Fetch meeting logs
      const { data: logsData } = await supabase
        .from('meeting_logs')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      // Fetch goals associated with this session
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      setMeetingLogs(logsData || []);
      setGoals(goalsData || []);
    } catch (error) {
      console.error('Error fetching session details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load session details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && isOpen) {
      fetchSessionDetails(session.id);
    }
  }, [session, isOpen]);

  const handleStatusUpdate = (status: 'pending' | 'completed' | 'cancelled') => {
    if (session && onStatusUpdate) {
      onStatusUpdate(session.id, status);
    }
  };

  if (!session || !isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>{session.name}</span>
            <Badge variant={getStatusColor(session.status)}>
              {getStatusIcon(session.status)}
              <span className="ml-1 capitalize">{session.status}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 pr-4">
            {/* Session Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Date:</span>
                    <span>{formatDate(session.session_date)}</span>
                  </div>
                  
                  {session.start_time && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Time:</span>
                      <span>
                        {formatTime(session.start_time)}
                        {session.end_time && ` - ${formatTime(session.end_time)}`}
                      </span>
                    </div>
                  )}
                  
                  {session.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span>{session.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">Type:</span>
                    <span className="capitalize">{session.session_type.replace('_', ' ')}</span>
                  </div>
                  
                  {session.priority && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Priority:</span>
                      <Badge variant={session.priority === 'high' ? 'destructive' : session.priority === 'low' ? 'secondary' : 'default'}>
                        {session.priority}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {session.description && (
                  <div className="space-y-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {session.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants */}
            {session.participants && session.participants.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Participants ({session.participants.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {session.participants.map((participant, index) => {
                      const studentInfo = getStudentDisplayInfo(participant.student_external_id);
                      return (
                        <div key={participant.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex flex-col space-y-1">
                            <span className="font-medium">{studentInfo.name}</span>
                            {studentInfo.email && (
                              <span className="text-sm text-muted-foreground">{studentInfo.email}</span>
                            )}
                            <div className="flex flex-col text-xs text-muted-foreground space-y-0.5">
                              {studentInfo.rollNo && (
                                <span>Roll No: {studentInfo.rollNo}</span>
                              )}
                              {studentInfo.program && (
                                <span>Program: {studentInfo.program}</span>
                              )}
                              {studentInfo.department && (
                                <span>Department: {studentInfo.department}</span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {participant.participation_status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meeting Logs */}
            {meetingLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Meeting Logs ({meetingLogs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {meetingLogs.map((log) => (
                      <div key={log.id} className="border rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{log.focus_of_meeting}</h4>
                          <span className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {log.updates_from_previous && (
                          <div>
                            <span className="font-medium text-sm">Updates from Previous:</span>
                            <p className="text-sm text-muted-foreground mt-1">{log.updates_from_previous}</p>
                          </div>
                        )}
                        
                        {log.problems_encountered && (
                          <div>
                            <span className="font-medium text-sm">Problems Encountered:</span>
                            <p className="text-sm text-muted-foreground mt-1">{log.problems_encountered}</p>
                          </div>
                        )}
                        
                        {log.next_steps && (
                          <div>
                            <span className="font-medium text-sm">Next Steps:</span>
                            <p className="text-sm text-muted-foreground mt-1">{log.next_steps}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals */}
            {goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Session Goals ({goals.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {goals.map((goal) => (
                      <div key={goal.id} className="border rounded-md p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{goal.area_of_focus}</h4>
                          <Badge variant="outline" className="capitalize">
                            {goal.status}
                          </Badge>
                        </div>
                        
                        <div>
                          <span className="font-medium text-sm">SMART Goal:</span>
                          <p className="text-sm text-muted-foreground mt-1">{goal.smart_goal_text}</p>
                        </div>
                        
                        {goal.action_plan && (
                          <div>
                            <span className="font-medium text-sm">Action Plan:</span>
                            <p className="text-sm text-muted-foreground mt-1">{goal.action_plan}</p>
                          </div>
                        )}
                        
                        {goal.target_date && (
                          <div className="text-sm">
                            <span className="font-medium">Target Date:</span>
                            <span className="text-muted-foreground ml-2">
                              {new Date(goal.target_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {session.status === 'pending' && (
                    <>
                      <Button 
                        onClick={() => handleStatusUpdate('completed')}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Mark as Completed
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleStatusUpdate('cancelled')}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Session
                      </Button>
                    </>
                  )}
                  
                  {session.status === 'completed' && (
                    <Button 
                      variant="outline"
                      onClick={() => handleStatusUpdate('pending')}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Reopen Session
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};