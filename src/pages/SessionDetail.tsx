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
  Eye
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
    // Validation for completion
    if (newStatus === 'completed' && !notes.trim() && session.qna_entries.length === 0) {
      toast({
        title: "Cannot complete session",
        description: "Please add at least one note or Q&A entry before completing the session.",
        variant: "destructive",
      });
      return;
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="qna">Q&A</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
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

          {/* Status Tab */}
          <TabsContent value="status">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Status:</span>
                    <Badge className={getStatusColor(session.status)}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                    </Badge>
                  </div>
                  {session.priority && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Priority:</span>
                      <Badge variant="outline">{session.priority}</Badge>
                    </div>
                  )}
                  {session.rejection_reason && (
                    <div>
                      <Label className="font-medium">Rejection Reason:</Label>
                      <p className="text-sm text-muted-foreground mt-1">{session.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Change Status</CardTitle>
                  <CardDescription>Update the session status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {session.status === 'pending' && (
                    <div className="space-y-2">
                      <Button className="w-full" onClick={() => {
                        setNewStatus('completed');
                        setStatusDialogOpen(true);
                      }}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Completed
                      </Button>
                      
                      <Button variant="destructive" className="w-full" onClick={() => {
                        setNewStatus('rejected');
                        setStatusDialogOpen(true);
                      }}>
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Session
                      </Button>
                    </div>
                  )}
                  
                  {session.status !== 'pending' && (
                    <p className="text-muted-foreground">
                      This session has been {session.status}. No further actions available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {newStatus === 'completed' ? 'Complete Session' : 'Reject Session'}
              </DialogTitle>
              <DialogDescription>
                {newStatus === 'completed' 
                  ? 'Are you sure you want to mark this session as completed?'
                  : 'Please provide a reason for rejecting this session.'
                }
              </DialogDescription>
            </DialogHeader>
            
            {newStatus === 'rejected' && (
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="Enter the reason for rejecting this session..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleStatusChange}
                variant={newStatus === 'rejected' ? 'destructive' : 'default'}
              >
                {newStatus === 'completed' ? 'Complete Session' : 'Reject Session'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SessionDetail;