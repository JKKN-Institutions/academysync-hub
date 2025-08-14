import React, { useState, useMemo } from 'react';
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
  AlertCircle,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SessionForm } from "@/components/SessionForm";
import { SessionDetailsModal } from "@/components/SessionDetailsModal";
import { StudentAddedNotification } from "@/components/StudentAddedNotification";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCounselingSessions, CreateSessionData, CounselingSession } from "@/hooks/useCounselingSessions";
import { useNotifications } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const Counseling = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSession, setSelectedSession] = useState<CounselingSession | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Notification states
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [addedStudents, setAddedStudents] = useState<Array<{id: string; name: string; rollNo: string; program: string; department: string}>>([]);
  const [pendingSessionData, setPendingSessionData] = useState<CreateSessionData | null>(null);
  
  const { 
    sessions, 
    loading, 
    error, 
    createSession,
    updateSessionStatus,
    upcomingSessions,
    completedSessions,
    allSessions
  } = useCounselingSessions();
  
  const { sendSessionInvitations, sendMentorConfirmation } = useNotifications(
    user?.email || 'demo-mentor',
    'mentor'
  );

  const handleSessionSubmit = async (sessionData: CreateSessionData) => {
    // Store session data and added students for notification
    setPendingSessionData(sessionData);
    
    // If students were added, show confirmation dialog
    if (addedStudents.length > 0) {
      setNotificationOpen(true);
    } else {
      // No students, create session directly
      await createSessionDirectly(sessionData);
    }
  };

  const createSessionDirectly = async (sessionData: CreateSessionData) => {
    setIsCreating(true);
    try {
      const newSession = await createSession(sessionData);
      if (newSession) {
        setIsFormOpen(false);
        
        // Send mentor confirmation
        await sendMentorConfirmation({
          sessionId: newSession.id,
          sessionName: sessionData.name,
          studentCount: sessionData.students.length,
          mentorExternalId: user?.email || 'demo-mentor',
          sessionDate: sessionData.session_date
        });
      }
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStudentAdded = (students: Array<{id: string; name: string; rollNo: string; program: string; department: string}>) => {
    setAddedStudents(prev => [...prev, ...students]);
  };

  const handleConfirmNotifications = async () => {
    if (!pendingSessionData) return;

    setIsCreating(true);
    try {
      // Create the session first
      const newSession = await createSession(pendingSessionData);
      
      if (newSession) {
        // Send notifications to students
        await sendSessionInvitations({
          sessionId: newSession.id,
          sessionName: pendingSessionData.name,
          sessionDate: pendingSessionData.session_date,
          sessionTime: pendingSessionData.start_time,
          location: pendingSessionData.location,
          mentorName: user?.email || 'Your Mentor',
          studentIds: pendingSessionData.students
        });

        // Send confirmation to mentor
        await sendMentorConfirmation({
          sessionId: newSession.id,
          sessionName: pendingSessionData.name,
          studentCount: pendingSessionData.students.length,
          mentorExternalId: user?.email || 'demo-mentor',
          sessionDate: pendingSessionData.session_date
        });

        setIsFormOpen(false);
        setAddedStudents([]);
        setPendingSessionData(null);
      }
    } catch (error) {
      console.error('Failed to create session with notifications:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const handleViewDetails = (session: CounselingSession) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
    setSelectedSession(null);
  };

  // Filter sessions based on search term
  const filteredAllSessions = useMemo(() => {
    if (!searchTerm) return allSessions;
    return allSessions.filter(session => 
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSessions, searchTerm]);

  const filteredUpcomingSessions = useMemo(() => {
    if (!searchTerm) return upcomingSessions;
    return upcomingSessions.filter(session => 
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [upcomingSessions, searchTerm]);

  const filteredCompletedSessions = useMemo(() => {
    if (!searchTerm) return completedSessions;
    return completedSessions.filter(session => 
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [completedSessions, searchTerm]);

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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Counseling Sessions</h1>
            <p className="text-muted-foreground">Manage and track your counseling sessions</p>
          </div>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-destructive">Failed to Load Sessions</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

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
              loading={isCreating}
              onStudentAdded={handleStudentAdded}
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
          {filteredAllSessions.length > 0 ? (
            filteredAllSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <Badge variant={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.session_date)}
                        </div>
                        {session.start_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(session.start_time)}
                            {session.end_time && ` - ${formatTime(session.end_time)}`}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.session_type === 'one_on_one' ? '1:1' : 'Group'} 
                          ({session.participants?.length || 0} student{(session.participants?.length || 0) !== 1 ? 's' : ''})
                        </div>
                      </div>
                      {session.location && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Location: </span>
                          {session.location}
                        </div>
                      )}
                      {session.description && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Description: </span>
                          {session.description}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {session.status === 'pending' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateSessionStatus(session.id, 'completed')}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(session)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No sessions match your search criteria' : 'No sessions found'}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          {filteredUpcomingSessions.length > 0 ? (
            filteredUpcomingSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <Badge variant={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.session_date)}
                        </div>
                        {session.start_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(session.start_time)}
                            {session.end_time && ` - ${formatTime(session.end_time)}`}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.session_type === 'one_on_one' ? '1:1' : 'Group'} 
                          ({session.participants?.length || 0} student{(session.participants?.length || 0) !== 1 ? 's' : ''})
                        </div>
                      </div>
                      {session.location && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Location: </span>
                          {session.location}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => updateSessionStatus(session.id, 'completed')}
                      >
                        Mark Complete
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(session)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No upcoming sessions match your search criteria' : 'No upcoming sessions'}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {filteredCompletedSessions.length > 0 ? (
            filteredCompletedSessions.map((session) => (
              <Card key={session.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{session.name}</h3>
                        <Badge variant={getStatusColor(session.status)}>
                          {getStatusIcon(session.status)}
                          <span className="ml-1 capitalize">{session.status}</span>
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.session_date)}
                        </div>
                        {session.start_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(session.start_time)}
                            {session.end_time && ` - ${formatTime(session.end_time)}`}
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {session.session_type === 'one_on_one' ? '1:1' : 'Group'} 
                          ({session.participants?.length || 0} student{(session.participants?.length || 0) !== 1 ? 's' : ''})
                        </div>
                      </div>
                      {session.location && (
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Location: </span>
                          {session.location}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(session)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No completed sessions match your search criteria' : 'No completed sessions yet'}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Session Details Modal */}
      <SessionDetailsModal
        session={selectedSession}
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        onStatusUpdate={updateSessionStatus}
        onSessionUpdated={() => {
          // Refresh the sessions list when a session is updated
          window.location.reload();
        }}
      />

      {/* Student Added Notification Dialog */}
      {pendingSessionData && (
        <StudentAddedNotification
          open={notificationOpen}
          onOpenChange={setNotificationOpen}
          sessionData={{
            sessionName: pendingSessionData.name,
            sessionDate: pendingSessionData.session_date,
            sessionTime: pendingSessionData.start_time,
            location: pendingSessionData.location,
            addedStudents: addedStudents
          }}
          onConfirm={handleConfirmNotifications}
        />
      )}
    </div>
  );
};

export default Counseling;