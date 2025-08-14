import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { MeetingLog } from "@/components/MeetingLog";
import { ManualCounseling } from "@/components/ManualCounseling";
import { SessionFeedbackForm } from "@/components/SessionFeedbackForm";
import { MentorFeedbackForm } from "@/components/MentorFeedbackForm";
import { SessionCancellationDialog } from "@/components/SessionCancellationDialog";
import { useSessionFeedback } from "@/hooks/useSessionFeedback";
import { useMentorFeedback } from "@/hooks/useMentorFeedback";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Download, 
  Upload, 
  Trash2, 
  Save, 
  CheckCircle, 
  XCircle,
  ExternalLink,
  Plus,
  Eye,
  Star,
  MessageSquare
} from "lucide-react";

// Mock data structure for demonstration
interface Session {
  id: string;
  name: string;
  date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  description?: string;
  session_type: 'one_on_one' | 'group';
  status: 'pending' | 'completed' | 'rejected';
  priority?: string;
  notes?: string;
  rejection_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  participants: Array<{
    id: string;
    student_name: string;
    student_roll_no: string;
  }>;
  qna_entries: Array<{
    id: string;
    question_text?: string;
    answer_text?: string;
    student_name?: string;
    mentor_name?: string;
    question_timestamp?: string;
    answer_timestamp?: string;
  }>;
  attachments: Array<{
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
  }>;
  calendar_event?: {
    provider: string;
    event_url?: string;
    status: 'pending' | 'created' | 'failed';
  };
}

const SessionDetail = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Mock session data - in real implementation, this would come from Supabase
  const [session] = useState<Session>({
    id: sessionId || '1',
    name: 'Academic Progress Review',
    date: '2024-01-15',
    start_time: '14:00',
    end_time: '15:00',
    location: 'Room 301, CS Building',
    description: 'Quarterly review of academic progress and goal setting for next semester.',
    session_type: 'one_on_one',
    status: 'pending',
    priority: 'High',
    notes: 'Initial notes about student progress...',
    created_by: 'mentor-123',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
    participants: [
      {
        id: '1',
        student_name: 'Alex Chen',
        student_roll_no: 'CS2021001'
      },
      {
        id: '2', 
        student_name: 'Maria Rodriguez',
        student_roll_no: 'CS2021002'
      }
    ],
    qna_entries: [
      {
        id: '1',
        question_text: 'What are the best practices for preparing for internship interviews?',
        answer_text: 'Focus on technical fundamentals, practice coding problems, and prepare behavioral questions.',
        student_name: 'Alex Chen',
        mentor_name: 'Dr. Sarah Johnson',
        question_timestamp: '2024-01-10T10:00:00Z',
        answer_timestamp: '2024-01-10T10:30:00Z'
      },
      {
        id: '2',
        question_text: 'How can I improve my research methodology?',
        student_name: 'Maria Rodriguez',
        question_timestamp: '2024-01-10T11:00:00Z'
      }
    ],
    attachments: [
      {
        id: '1',
        file_name: 'Academic_Plan_Q1.pdf',
        file_size: 2048576,
        file_type: 'application/pdf',
        uploaded_at: '2024-01-10T10:00:00Z'
      },
      {
        id: '2',
        file_name: 'Research_Guidelines.docx',
        file_size: 1024768,
        file_type: 'application/msword',
        uploaded_at: '2024-01-11T14:30:00Z'
      }
    ],
    calendar_event: {
      provider: 'Google Calendar',
      event_url: 'https://calendar.google.com/event/abc123',
      status: 'created'
    }
  });

  const [notes, setNotes] = useState(session.notes || "");
  const [notesSaved, setNotesSaved] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  // Q&A form states
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  // Status change dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<'completed' | 'rejected'>('completed');
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Meeting log state
  const [isMeetingLogComplete, setIsMeetingLogComplete] = useState(false);
  
  // Feedback form state
  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);
  const [mentorFeedbackFormOpen, setMentorFeedbackFormOpen] = useState(false);
  const [cancellationDialogOpen, setCancellationDialogOpen] = useState(false);
  
  // Feedback hooks
  const { feedback, loading: feedbackLoading, getAverageRatings } = useSessionFeedback(session.id);
  const { hasFeedback: hasMentorFeedback, getSessionFeedback, refetch: refetchMentorFeedback } = useMentorFeedback(session.id);

  const handleAddQuestion = async () => {
    if (!newQuestion.trim()) return;
    
    // In real implementation, this would call Supabase
    toast({
      title: "Question added",
      description: "Question has been recorded successfully.",
    });
    setNewQuestion("");
  };

  const handleAddAnswer = async (questionId: string) => {
    if (!newAnswer.trim()) return;
    
    // In real implementation, this would call Supabase
    toast({
      title: "Answer added", 
      description: "Answer has been recorded successfully.",
    });
    setNewAnswer("");
    setSelectedQuestionId(null);
  };

  const handleStatusChange = async () => {
    // Validation for completion - require Meeting Log and Mentor Feedback to be complete
    if (newStatus === 'completed') {
      if (!isMeetingLogComplete) {
        toast({
          title: "Cannot complete session",
          description: "Please complete the Meeting Log with focus and next session date/time before completing the session.",
          variant: "destructive",
        });
        return;
      }
      
      if (!hasMentorFeedback(session.id)) {
        toast({
          title: "Mentor feedback required",
          description: "Please provide detailed mentor feedback before completing the session.",
          variant: "destructive",
        });
        setMentorFeedbackFormOpen(true);
        return;
      }
    }
    
    // Validation for rejection
    if (newStatus === 'rejected' && !rejectionReason.trim()) {
      toast({
        title: "Rejection reason required",
        description: "Please provide a reason for rejecting the session.",
        variant: "destructive",
      });
      return;
    }
    
    // In real implementation, this would call Supabase
    toast({
      title: "Status updated",
      description: `Session has been ${newStatus}.`,
    });
    setStatusDialogOpen(false);
    setRejectionReason("");
  };

  const handleMarkAsCompleted = async () => {
    // Check if mentor feedback is required first
    if (!hasMentorFeedback(session.id)) {
      toast({
        title: "Mentor feedback required",
        description: "Please provide detailed mentor feedback before completing the session.",
        variant: "destructive",
      });
      setMentorFeedbackFormOpen(true);
      return;
    }

    try {
      // Call Superface integration
      const { data, error } = await supabase.functions.invoke('superface-integration', {
        body: {
          action: 'mark_completed',
          sessionId: session.id,
          data: {
            session_name: session.name,
            completed_at: new Date().toISOString(),
            participants: session.participants.map(p => ({
              student_id: p.student_roll_no,
              student_name: p.student_name
            }))
          }
        }
      });

      if (error) {
        throw error;
      }

      // Update session status locally (in real implementation, this would update Supabase)
      toast({
        title: "Session marked as completed",
        description: "Session has been successfully completed and synced with Superface.",
      });

      // Show student feedback form
      setFeedbackFormOpen(true);
    } catch (error) {
      console.error('Error marking session as completed:', error);
      toast({
        title: "Error completing session",
        description: "There was a problem marking the session as completed. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelSession = async (cancellationReason: string) => {
    try {
      // In real implementation, this would update Supabase
      toast({
        title: "Session cancelled",
        description: "Session has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error cancelling session",
        description: "There was a problem cancelling the session. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // In real implementation, this would upload to Supabase Storage
    toast({
      title: "File uploaded",
      description: "Attachment has been uploaded successfully.",
    });
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    // In real implementation, this would call Supabase
    toast({
      title: "Attachment deleted",
      description: "File has been removed successfully.",
    });
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Simulate PDF export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "PDF exported",
        description: "Session details have been exported successfully.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export session as PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDateTime = (date: string, time?: string) => {
    const dateObj = new Date(date);
    let formatted = dateObj.toLocaleDateString();
    if (time) {
      formatted += ` at ${time}`;
    }
    return formatted;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/counseling')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{session.name}</h1>
              <p className="text-muted-foreground">
                Session Details • {formatDateTime(session.date, session.start_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(session.status)}>
              {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
            </Badge>
            <Button onClick={handleExportPDF} disabled={isExporting}>
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export PDF'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="counseling">Manual Counseling</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="qna">Q&A</TabsTrigger>
            <TabsTrigger value="meeting-log">Meeting Log</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="mentor-feedback">
              Mentor Feedback
              {hasMentorFeedback(session.id) && (
                <span className="ml-1 inline-block w-2 h-2 bg-green-500 rounded-full" />
              )}
            </TabsTrigger>
            <TabsTrigger value="feedback">Student Feedback</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Session Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDateTime(session.date, session.start_time)}</span>
                  </div>
                  {session.end_time && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Ends at {session.end_time}</span>
                    </div>
                  )}
                  {session.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{session.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{session.session_type === 'one_on_one' ? '1:1 Session' : 'Group Session'}</span>
                  </div>
                  {session.description && (
                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm text-muted-foreground mt-1">{session.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader>
                  <CardTitle>Participants ({session.participants.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {session.participants.length > 0 ? (
                    <div className="space-y-2">
                      {session.participants.map((participant) => (
                        <div key={participant.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{participant.student_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Roll No: {participant.student_roll_no}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No participants added yet.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Calendar Integration */}
            {session.calendar_event && (
              <Card>
                <CardHeader>
                  <CardTitle>Calendar Integration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{session.calendar_event.provider} Event</span>
                      <Badge variant={session.calendar_event.status === 'created' ? 'default' : 'secondary'}>
                        {session.calendar_event.status}
                      </Badge>
                    </div>
                    {session.calendar_event.event_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={session.calendar_event.event_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Event
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Manual Counseling Tab */}
          <TabsContent value="counseling">
            <ManualCounseling 
              student={{
                id: 'cs2021001',
                studentId: 'cs2021001',
                rollNo: session.participants[0]?.student_roll_no || 'CS2021001',
                name: session.participants[0]?.student_name || 'Alex Chen',
                program: 'Computer Science',
                semesterYear: 3,
                email: 'alex.chen@student.edu',
                interests: ['Machine Learning', 'Web Development'],
                status: 'active'
              }}
              sessionId={session.id}
              onCounselingUpdate={(counselingData) => {
                setNotes(prev => prev + '\n\nCounseling Assessment:\n' + JSON.stringify(counselingData, null, 2));
                setNotesSaved(false);
              }}
            />
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Session Notes</CardTitle>
                  <CardDescription>Add your notes and observations from the session</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {notesSaved ? (
                    <div className="flex items-center text-green-600 text-sm">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Saved
                    </div>
                  ) : (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <Save className="w-4 h-4 mr-1" />
                      Saving...
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add your session notes here..."
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setNotesSaved(false);
                    // In real implementation, this would trigger autosave
                    setTimeout(() => setNotesSaved(true), 2000);
                  }}
                  className="min-h-[400px]"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Q&A Tab */}
          <TabsContent value="qna" className="space-y-6">
            {/* Add Question */}
            <Card>
              <CardHeader>
                <CardTitle>Add Question</CardTitle>
                <CardDescription>Students can add questions for discussion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter your question..."
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                />
                <Button onClick={handleAddQuestion} disabled={!newQuestion.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Question
                </Button>
              </CardContent>
            </Card>

            {/* Q&A Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Questions & Answers ({session.qna_entries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {session.qna_entries.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Answer</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.qna_entries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="font-medium">{entry.question_text}</p>
                              <p className="text-xs text-muted-foreground">
                                By {entry.student_name} • {entry.question_timestamp ? new Date(entry.question_timestamp).toLocaleString() : 'Recently'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {entry.answer_text ? (
                              <div className="space-y-1">
                                <p>{entry.answer_text}</p>
                                <p className="text-xs text-muted-foreground">
                                  By {entry.mentor_name} • {entry.answer_timestamp ? new Date(entry.answer_timestamp).toLocaleString() : 'Recently'}
                                </p>
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic">No answer yet</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {!entry.answer_text && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" onClick={() => setSelectedQuestionId(entry.id)}>
                                    Add Answer
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Add Answer</DialogTitle>
                                    <DialogDescription>
                                      Question: {entry.question_text}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Enter your answer..."
                                    value={newAnswer}
                                    onChange={(e) => setNewAnswer(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setNewAnswer("")}>
                                      Cancel
                                    </Button>
                                    <Button onClick={() => handleAddAnswer(entry.id)} disabled={!newAnswer.trim()}>
                                      Add Answer
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No questions added yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Meeting Log Tab */}
          <TabsContent value="meeting-log">
            <MeetingLog
              sessionId={session.id}
              onMeetingLogUpdate={setIsMeetingLogComplete}
              onScheduleNext={(nextSessionData) => {
                // Handle schedule next session
                toast({
                  title: "Next session scheduled",
                  description: `Session scheduled for ${nextSessionData.session_date} at ${nextSessionData.start_time}`,
                });
                // In real implementation, this would create a new session record
              }}
            />
          </TabsContent>

          {/* Mentor Feedback Tab */}
          <TabsContent value="mentor-feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mentor Feedback Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Mentor Feedback Status</CardTitle>
                  <CardDescription>
                    Required before session can be completed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasMentorFeedback(session.id) ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Mentor feedback completed</span>
                      </div>
                      {(() => {
                        const mentorFeedback = getSessionFeedback(session.id);
                        return mentorFeedback ? (
                          <div className="space-y-3 pt-3 border-t">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Session Quality</div>
                                <div className="flex items-center justify-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{mentorFeedback.session_quality_rating}/5</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Student Engagement</div>
                                <div className="flex items-center justify-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{mentorFeedback.student_engagement_rating}/5</span>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-xs text-muted-foreground">Goals Achieved</div>
                                <div className="flex items-center justify-center space-x-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-medium">{mentorFeedback.goals_achieved_rating}/5</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Submitted on {new Date(mentorFeedback.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 text-amber-600">
                        <XCircle className="w-5 h-5" />
                        <span className="font-medium">Mentor feedback required</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Please complete the mentor feedback form before marking this session as completed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Feedback Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Actions</CardTitle>
                  <CardDescription>
                    Complete mentor assessment and feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setMentorFeedbackFormOpen(true)}
                    className="w-full"
                    disabled={hasMentorFeedback(session.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {hasMentorFeedback(session.id) ? 'Feedback Completed' : 'Complete Mentor Feedback'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Mentor Feedback */}
            {hasMentorFeedback(session.id) && (() => {
              const mentorFeedback = getSessionFeedback(session.id);
              return mentorFeedback ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Detailed Mentor Feedback</CardTitle>
                    <CardDescription>
                      Comprehensive session assessment and recommendations
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Assessment */}
                    <div>
                      <h4 className="font-medium mb-2">Student Progress Notes</h4>
                      <p className="text-sm text-muted-foreground">{mentorFeedback.student_progress_notes}</p>
                    </div>

                    {mentorFeedback.key_outcomes && (
                      <div>
                        <h4 className="font-medium mb-2">Key Outcomes</h4>
                        <p className="text-sm text-muted-foreground">{mentorFeedback.key_outcomes}</p>
                      </div>
                    )}

                    {mentorFeedback.challenges_faced && (
                      <div>
                        <h4 className="font-medium mb-2">Challenges Faced</h4>
                        <p className="text-sm text-muted-foreground">{mentorFeedback.challenges_faced}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium mb-2">Next Steps Recommended</h4>
                      <p className="text-sm text-muted-foreground">{mentorFeedback.next_steps_recommended}</p>
                    </div>

                    {/* Follow-up Planning */}
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Follow-up Planning</h4>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm">Follow-up Required:</span>
                        <Badge variant={mentorFeedback.follow_up_required ? "default" : "secondary"}>
                          {mentorFeedback.follow_up_required ? "Yes" : "No"}
                        </Badge>
                      </div>
                      {mentorFeedback.follow_up_required && mentorFeedback.follow_up_timeline && (
                        <div>
                          <span className="text-sm font-medium">Timeline: </span>
                          <span className="text-sm text-muted-foreground">{mentorFeedback.follow_up_timeline}</span>
                        </div>
                      )}
                    </div>

                    {mentorFeedback.additional_support_needed && (
                      <div>
                        <h4 className="font-medium mb-2">Additional Support Needed</h4>
                        <p className="text-sm text-muted-foreground">{mentorFeedback.additional_support_needed}</p>
                      </div>
                    )}

                    {/* Mentor Reflection */}
                    {(mentorFeedback.mentor_reflection || mentorFeedback.improvement_areas) && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Mentor Reflection</h4>
                          {mentorFeedback.mentor_reflection && (
                            <div className="mb-3">
                              <span className="text-sm font-medium">Personal Reflection: </span>
                              <p className="text-sm text-muted-foreground">{mentorFeedback.mentor_reflection}</p>
                            </div>
                          )}
                          {mentorFeedback.improvement_areas && (
                            <div>
                              <span className="text-sm font-medium">Areas for Improvement: </span>
                              <p className="text-sm text-muted-foreground">{mentorFeedback.improvement_areas}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : null;
            })()}
          </TabsContent>

          {/* Attachments Tab */}
          <TabsContent value="attachments" className="space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Attachment</CardTitle>
                <CardDescription>Add files related to this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    className="flex-1"
                  />
                  <Button variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Attachments List */}
            <Card>
              <CardHeader>
                <CardTitle>Session Attachments ({session.attachments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {session.attachments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.attachments.map((attachment) => (
                        <TableRow key={attachment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{attachment.file_name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                          </TableCell>
                          <TableCell>
                            {new Date(attachment.uploaded_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAttachment(attachment.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No attachments uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Feedback Tab */}
          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feedback Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Summary</CardTitle>
                  <CardDescription>
                    Average ratings from session participants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {feedback.length > 0 ? (
                    <div className="space-y-4">
                      {(() => {
                        const avgRatings = getAverageRatings();
                        return (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall Rating</span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{avgRatings.overall}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Mentor Helpfulness</span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{avgRatings.mentorHelpfulness}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Session Effectiveness</span>
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{avgRatings.sessionEffectiveness}/5</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Would Recommend</span>
                              <span className="font-medium">{avgRatings.recommendationRate}%</span>
                            </div>
                            <div className="pt-2 border-t">
                              <span className="text-xs text-muted-foreground">
                                Based on {avgRatings.totalResponses} response{avgRatings.totalResponses !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No feedback received yet.</p>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Actions</CardTitle>
                  <CardDescription>
                    Collect feedback from session participants
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setFeedbackFormOpen(true)}
                    className="w-full"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit Feedback
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Individual Feedback Entries */}
            {feedback.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Individual Feedback</CardTitle>
                  <CardDescription>
                    Detailed feedback from each participant
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {feedback.map((f) => (
                      <div key={f.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Participant: {f.mentee_external_id}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(f.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Overall</div>
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{f.overall_rating}/5</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Helpfulness</div>
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{f.mentor_helpfulness}/5</span>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-muted-foreground">Effectiveness</div>
                            <div className="flex items-center justify-center space-x-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{f.session_effectiveness}/5</span>
                            </div>
                          </div>
                        </div>

                        {f.comments && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Comments:</div>
                            <p className="text-sm">{f.comments}</p>
                          </div>
                        )}

                        {f.improvement_suggestions && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Suggestions:</div>
                            <p className="text-sm">{f.improvement_suggestions}</p>
                          </div>
                        )}

                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Would recommend:</span>
                          <Badge variant={f.would_recommend ? "default" : "secondary"}>
                            {f.would_recommend ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Status Tab */}
          <TabsContent value="status">
            <Card>
              <CardHeader>
                <CardTitle>Session Status Management</CardTitle>
                <CardDescription>Update the status of this counseling session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Label>Current Status:</Label>
                  <Badge className={getStatusColor(session.status)}>
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </Badge>
                </div>

                {/* Actions Section */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Actions
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={handleMarkAsCompleted}
                      disabled={session.status === 'completed'}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark as Completed
                    </Button>
                    
                    <Button 
                      variant="destructive"
                      onClick={() => setCancellationDialogOpen(true)}
                      disabled={session.status === 'rejected'}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Session
                    </Button>
                  </div>
                </div>

                {session.rejection_reason && (
                  <div>
                    <Label className="text-sm font-medium">Rejection Reason:</Label>
                    <p className="text-sm text-muted-foreground mt-1">{session.rejection_reason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mentor Feedback Form Modal */}
        <MentorFeedbackForm
          open={mentorFeedbackFormOpen}
          onOpenChange={setMentorFeedbackFormOpen}
          sessionId={session.id}
          mentorExternalId="mentor-123" // In real implementation, get from auth context
          onSuccess={() => {
            refetchMentorFeedback();
            toast({
              title: "Mentor feedback submitted successfully",
              description: "You can now mark the session as completed."
            });
          }}
        />

        {/* Student Feedback Form Modal */}
        <SessionFeedbackForm
          open={feedbackFormOpen}
          onOpenChange={setFeedbackFormOpen}
          sessionId={session.id}
          menteeExternalId={session.participants[0]?.student_roll_no || 'demo-student'}
          onSuccess={() => {
            toast({
              title: "Feedback submitted successfully",
              description: "Thank you for your feedback!"
            });
          }}
        />

        {/* Session Cancellation Dialog */}
        <SessionCancellationDialog
          open={cancellationDialogOpen}
          onOpenChange={setCancellationDialogOpen}
          sessionName={session.name}
          onConfirm={handleCancelSession}
        />
      </div>
    </div>
  );
};

export default SessionDetail;