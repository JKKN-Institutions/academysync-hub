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
  Edit,
  UserPlus
} from "lucide-react";
import { CounselingSession } from "@/hooks/useCounselingSessions";
import { SessionEditModal } from "@/components/SessionEditModal";
import { StudentManagementModal } from "@/components/StudentManagementModal";
import { MentorFeedbackForm } from "@/components/MentorFeedbackForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useAuth } from "@/contexts/AuthContext";

interface SessionDetailsModalProps {
  session: CounselingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (sessionId: string, status: 'pending' | 'completed' | 'cancelled') => void;
  onSessionUpdated?: () => void;
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
  onStatusUpdate,
  onSessionUpdated
}) => {
  
  const [meetingLogs, setMeetingLogs] = useState<MeetingLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [studentManagementModalOpen, setStudentManagementModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const { toast } = useToast();
  const { students } = useStudentsData();
  const { user, hasPermission } = useAuth();

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
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
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

  const handleMarkAsComplete = () => {
    // For mentors, show feedback form first
    if (user?.role === 'mentor') {
      setFeedbackModalOpen(true);
    } else {
      // For admins, directly complete
      handleStatusUpdate('completed');
    }
  };

  const handleFeedbackSuccess = () => {
    // Complete the session after feedback is submitted
    handleStatusUpdate('completed');
    setFeedbackModalOpen(false);
  };

  const handleEditSuccess = () => {
    onSessionUpdated?.();
    setEditModalOpen(false);
  };

  const handleStudentManagementSuccess = () => {
    fetchSessionDetails(session.id); // Refresh session details to show updated participants
    onSessionUpdated?.();
    setStudentManagementModalOpen(false);
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
                  
                  {session.location && session.can_view_details && (
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
                
                {session.description && session.can_view_details && (
                  <div className="space-y-2">
                    <span className="font-medium">Description:</span>
                    <p className="text-muted-foreground bg-muted/50 p-3 rounded-md">
                      {session.description}
                    </p>
                  </div>
                )}

                {!session.can_view_details && (
                  <div className="bg-muted/30 p-3 rounded-md border-l-4 border-l-blue-500">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> You can only view limited session details. Full details are restricted to the session creator and administrators.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Participants - Only show if user can view details */}
            {session.can_view_details && session.participants && session.participants.length > 0 && (
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
                          <div className="flex items-center gap-2">
                            <select
                              value={participant.participation_status}
                              onChange={async (e) => {
                                const newStatus = e.target.value as 'invited' | 'confirmed' | 'attended' | 'missed';
                                try {
                                  const { error } = await supabase
                                    .from('session_participants')
                                    .update({ participation_status: newStatus })
                                    .eq('id', participant.id);

                                  if (error) throw error;

                                  toast({
                                    title: 'Status Updated',
                                    description: `Participant status updated to ${newStatus}`
                                  });

                                  // Refetch session details
                                  fetchSessionDetails(session.id);
                                  onSessionUpdated?.();
                                } catch (error) {
                                  console.error('Error updating participant status:', error);
                                  toast({
                                    title: 'Error',
                                    description: 'Failed to update participant status',
                                    variant: 'destructive'
                                  });
                                }
                              }}
                              className="px-3 py-1 text-sm border rounded-md bg-background capitalize"
                            >
                              <option value="invited">Invited</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="attended">Attended</option>
                              <option value="missed">Missed</option>
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meeting Logs - Only show if user can view details */}
            {session.can_view_details && meetingLogs.length > 0 && (
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

            {/* Goals - Only show if user can view details */}
            {session.can_view_details && goals.length > 0 && (
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
                  {/* Only show actions if user can view details (is creator or admin) */}
                  {session.can_view_details && (
                    <>
                      {/* Edit Session Button - Available for pending sessions */}
                      {session.status === 'pending' && (
                        <Button 
                          variant="outline"
                          onClick={() => setEditModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Edit Session
                        </Button>
                      )}

                      {/* Add Students Button - For pending sessions */}
                      {session.status === 'pending' && (
                        <Button 
                          variant="outline"
                          onClick={() => setStudentManagementModalOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Students
                        </Button>
                      )}

                      {session.status === 'pending' && (
                        <>
                          <Button 
                            onClick={handleMarkAsComplete}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Completed
                          </Button>
                          {/* Only super admins can cancel sessions */}
                          {hasPermission('full_system_access') && (
                            <Button 
                              variant="destructive"
                              onClick={() => handleStatusUpdate('cancelled')}
                              className="flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel Session
                            </Button>
                          )}
                        </>
                      )}
                      
                      {/* Reopen and Edit for completed sessions */}
                      {session.status === 'completed' && (
                        <>
                          <Button 
                            variant="outline"
                            onClick={() => {
                              handleStatusUpdate('pending');
                              setEditModalOpen(true);
                            }}
                            className="flex items-center gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Reopen & Edit
                          </Button>
                        </>
                      )}

                      {/* Reopen for cancelled sessions */}
                      {session.status === 'cancelled' && (
                        <Button 
                          variant="outline"
                          onClick={() => handleStatusUpdate('pending')}
                          className="flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Reopen Session
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Show message if user cannot view details */}
                  {!session.can_view_details && (
                    <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md border-l-4 border-l-orange-500">
                      <strong>Limited Access:</strong> You can only view basic session information. Session management actions are restricted to the session creator and administrators.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Session Edit Modal */}
        {editModalOpen && session && (
          <SessionEditModal
            session={session}
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            onSuccess={handleEditSuccess}
          />
        )}

        {/* Student Management Modal */}
        {studentManagementModalOpen && session && (
          <StudentManagementModal
            open={studentManagementModalOpen}
            onOpenChange={setStudentManagementModalOpen}
            sessionId={session.id}
            currentStudents={session.participants?.map(p => p.student_external_id) || []}
            onSuccess={handleStudentManagementSuccess}
          />
        )}

        {/* Mentor Feedback Form */}
        {feedbackModalOpen && user?.externalId && (
          <MentorFeedbackForm
            open={feedbackModalOpen}
            onOpenChange={setFeedbackModalOpen}
            sessionId={session.id}
            mentorExternalId={user.externalId}
            onSuccess={handleFeedbackSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};