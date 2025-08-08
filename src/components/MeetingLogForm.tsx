import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Users, FileText } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useCounselingSessions } from "@/hooks/useCounselingSessions";
import { useMeetingLog } from "@/hooks/useMeetingLog";

interface MeetingLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MeetingLogForm: React.FC<MeetingLogFormProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { toast } = useToast();
  const { sessions, loading: sessionsLoading } = useCounselingSessions();
  
  const [formData, setFormData] = useState({
    session_id: '',
    focus_of_meeting: '',
    updates_from_previous: '',
    problems_encountered: '',
    resolutions_discussed: '',
    next_steps: '',
    expected_outcome_next: '',
    next_session_datetime: null as Date | null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the hook for the selected session
  const { saveMeetingLog } = useMeetingLog(formData.session_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.session_id) {
      toast({
        title: "Session Required",
        description: "Please select a counseling session to create a meeting log for.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.focus_of_meeting.trim()) {
      toast({
        title: "Focus Required",
        description: "Please provide the focus of the meeting.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await saveMeetingLog({
        session_id: formData.session_id,
        focus_of_meeting: formData.focus_of_meeting,
        updates_from_previous: formData.updates_from_previous,
        problems_encountered: formData.problems_encountered,
        resolutions_discussed: formData.resolutions_discussed,
        next_steps: formData.next_steps,
        expected_outcome_next: formData.expected_outcome_next,
        next_session_datetime: formData.next_session_datetime,
      });

      toast({
        title: "Meeting Log Created",
        description: "The meeting log has been successfully created.",
      });

      // Reset form
      setFormData({
        session_id: '',
        focus_of_meeting: '',
        updates_from_previous: '',
        problems_encountered: '',
        resolutions_discussed: '',
        next_steps: '',
        expected_outcome_next: '',
        next_session_datetime: null,
      });

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating meeting log:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting log. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const completedSessions = sessions.filter(session => session.status === 'completed');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Create New Meeting Log
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Selection */}
          <div className="space-y-2">
            <Label htmlFor="session">Counseling Session *</Label>
            <Select 
              value={formData.session_id} 
              onValueChange={(value) => setFormData({ ...formData, session_id: value })}
              disabled={sessionsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a completed counseling session" />
              </SelectTrigger>
              <SelectContent>
                {completedSessions.length > 0 ? (
                  completedSessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name} - {format(new Date(session.session_date), "MMM dd, yyyy")}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No completed sessions available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Meeting Focus */}
          <div className="space-y-2">
            <Label htmlFor="focus">Focus of Meeting *</Label>
            <Textarea
              id="focus"
              value={formData.focus_of_meeting}
              onChange={(e) => setFormData({ ...formData, focus_of_meeting: e.target.value })}
              placeholder="What was the main focus or objective of this meeting?"
              className="min-h-[80px]"
              required
            />
          </div>

          {/* Updates from Previous Session */}
          <div className="space-y-2">
            <Label htmlFor="updates">Updates from Previous Session</Label>
            <Textarea
              id="updates"
              value={formData.updates_from_previous}
              onChange={(e) => setFormData({ ...formData, updates_from_previous: e.target.value })}
              placeholder="What progress was made on previous action items?"
              className="min-h-[80px]"
            />
          </div>

          {/* Problems Encountered */}
          <div className="space-y-2">
            <Label htmlFor="problems">Problems Encountered</Label>
            <Textarea
              id="problems"
              value={formData.problems_encountered}
              onChange={(e) => setFormData({ ...formData, problems_encountered: e.target.value })}
              placeholder="What challenges or issues were discussed?"
              className="min-h-[80px]"
            />
          </div>

          {/* Resolutions Discussed */}
          <div className="space-y-2">
            <Label htmlFor="resolutions">Resolutions Discussed</Label>
            <Textarea
              id="resolutions"
              value={formData.resolutions_discussed}
              onChange={(e) => setFormData({ ...formData, resolutions_discussed: e.target.value })}
              placeholder="What solutions or approaches were discussed?"
              className="min-h-[80px]"
            />
          </div>

          {/* Next Steps */}
          <div className="space-y-2">
            <Label htmlFor="nextSteps">Next Steps</Label>
            <Textarea
              id="nextSteps"
              value={formData.next_steps}
              onChange={(e) => setFormData({ ...formData, next_steps: e.target.value })}
              placeholder="What actions should be taken before the next meeting?"
              className="min-h-[80px]"
            />
          </div>

          {/* Expected Outcome */}
          <div className="space-y-2">
            <Label htmlFor="expectedOutcome">Expected Outcome for Next Session</Label>
            <Textarea
              id="expectedOutcome"
              value={formData.expected_outcome_next}
              onChange={(e) => setFormData({ ...formData, expected_outcome_next: e.target.value })}
              placeholder="What do you hope to achieve in the next session?"
              className="min-h-[80px]"
            />
          </div>

          {/* Next Session Date/Time */}
          <div className="space-y-2">
            <Label>Next Session Date & Time</Label>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.next_session_datetime && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.next_session_datetime ? 
                      format(formData.next_session_datetime, "PPP") : 
                      <span>Pick a date</span>
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.next_session_datetime}
                    onSelect={(date) => {
                      if (date) {
                        const currentTime = formData.next_session_datetime || new Date();
                        const newDateTime = new Date(date);
                        newDateTime.setHours(currentTime.getHours());
                        newDateTime.setMinutes(currentTime.getMinutes());
                        setFormData({ ...formData, next_session_datetime: newDateTime });
                      } else {
                        setFormData({ ...formData, next_session_datetime: null });
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              
              <div className="relative w-40">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="time"
                  value={formData.next_session_datetime ? 
                    format(formData.next_session_datetime, "HH:mm") : ""
                  }
                  onChange={(e) => {
                    if (e.target.value && formData.next_session_datetime) {
                      const [hours, minutes] = e.target.value.split(':');
                      const newDateTime = new Date(formData.next_session_datetime);
                      newDateTime.setHours(parseInt(hours, 10));
                      newDateTime.setMinutes(parseInt(minutes, 10));
                      setFormData({ ...formData, next_session_datetime: newDateTime });
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Meeting Log"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};