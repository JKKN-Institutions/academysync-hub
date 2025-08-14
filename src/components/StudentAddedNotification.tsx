import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, Clock, Users, MapPin, Calendar, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StudentAddedNotificationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionData: {
    sessionName: string;
    sessionDate: string;
    sessionTime?: string;
    location?: string;
    addedStudents: Array<{
      id: string;
      name: string;
      rollNo: string;
      program: string;
    }>;
  };
  onConfirm: () => void;
}

export const StudentAddedNotification = ({
  open,
  onOpenChange,
  sessionData,
  onConfirm
}: StudentAddedNotificationProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      
      // Show success toast
      toast({
        title: "Students Successfully Added",
        description: `${sessionData.addedStudents.length} student${sessionData.addedStudents.length !== 1 ? 's have' : ' has'} been notified about the counseling session.`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error confirming student addition:', error);
      toast({
        title: "Error",
        description: "Failed to send notifications to students. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Students Added to Session
          </DialogTitle>
          <DialogDescription>
            Confirm to send notifications to the selected students about their new counseling session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{sessionData.sessionName}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(sessionData.sessionDate)}</span>
              </div>
              
              {sessionData.sessionTime && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{formatTime(sessionData.sessionTime)}</span>
                </div>
              )}
              
              {sessionData.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{sessionData.location}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Students List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Added Students ({sessionData.addedStudents.length})
              </CardTitle>
              <CardDescription>
                These students will receive a notification about the counseling session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {sessionData.addedStudents.map((student, index) => (
                  <div key={student.id}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {student.rollNo} • {student.program}
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Will be notified
                      </Badge>
                    </div>
                    {index < sessionData.addedStudents.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Notification Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">📚</div>
                  <div>
                    <div className="font-medium text-blue-900">
                      New Counseling Session Invitation
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      You have been invited to "{sessionData.sessionName}" scheduled for {formatDate(sessionData.sessionDate)}{sessionData.sessionTime ? ` at ${formatTime(sessionData.sessionTime)}` : ''}.
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending Notifications...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Send Notifications
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};