import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Save, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MeetingLogData {
  id?: string;
  session_id: string;
  focus_of_meeting: string;
  updates_from_previous: string;
  problems_encountered: string;
  resolutions_discussed: string;
  next_steps: string;
  expected_outcome_next: string;
  next_session_datetime: Date | null;
}

interface MeetingLogProps {
  sessionId: string;
  onMeetingLogUpdate: (isComplete: boolean) => void;
  onScheduleNext?: (nextSessionData: any) => void;
}

export function MeetingLog({ sessionId, onMeetingLogUpdate, onScheduleNext }: MeetingLogProps) {
  const [meetingLog, setMeetingLog] = useState<MeetingLogData>({
    session_id: sessionId,
    focus_of_meeting: "",
    updates_from_previous: "",
    problems_encountered: "",
    resolutions_discussed: "",
    next_steps: "",
    expected_outcome_next: "",
    next_session_datetime: null,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Load existing meeting log
  useEffect(() => {
    loadMeetingLog();
  }, [sessionId]);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (meetingLog.focus_of_meeting || meetingLog.updates_from_previous || 
          meetingLog.problems_encountered || meetingLog.resolutions_discussed ||
          meetingLog.next_steps || meetingLog.expected_outcome_next) {
        saveMeetingLog(false);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [meetingLog]);

  // Check completion status
  useEffect(() => {
    const isComplete = Boolean(
      meetingLog.focus_of_meeting && 
      meetingLog.next_session_datetime
    );
    onMeetingLogUpdate(isComplete);
  }, [meetingLog.focus_of_meeting, meetingLog.next_session_datetime, onMeetingLogUpdate]);

  const loadMeetingLog = async () => {
    try {
      const { data, error } = await supabase
        .from("meeting_logs")
        .select("*")
        .eq("session_id", sessionId)
        .maybeSingle();

      if (error) {
        console.error("Error loading meeting log:", error);
        return;
      }

      if (data) {
        setMeetingLog({
          ...data,
          next_session_datetime: data.next_session_datetime ? new Date(data.next_session_datetime) : null,
        });
      }
    } catch (error) {
      console.error("Error loading meeting log:", error);
    }
  };

  const saveMeetingLog = async (showToast = true) => {
    if (isLoading) return;
    
    setIsLoading(true);

    try {
      const dataToSave = {
        session_id: sessionId,
        focus_of_meeting: meetingLog.focus_of_meeting,
        updates_from_previous: meetingLog.updates_from_previous,
        problems_encountered: meetingLog.problems_encountered,
        resolutions_discussed: meetingLog.resolutions_discussed,
        next_steps: meetingLog.next_steps,
        expected_outcome_next: meetingLog.expected_outcome_next,
        next_session_datetime: meetingLog.next_session_datetime?.toISOString(),
      };

      let result;
      
      if (meetingLog.id) {
        result = await supabase
          .from("meeting_logs")
          .update(dataToSave)
          .eq("id", meetingLog.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("meeting_logs")
          .insert([dataToSave])
          .select()
          .single();
      }

      if (result.error) {
        throw result.error;
      }

      if (result.data && !meetingLog.id) {
        setMeetingLog(prev => ({ ...prev, id: result.data.id }));
      }

      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Meeting log saved",
          description: "Changes have been saved successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving meeting log:", error);
      if (showToast) {
        toast({
          title: "Error saving meeting log",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof MeetingLogData, value: string | Date | null) => {
    setMeetingLog(prev => ({ ...prev, [field]: value }));
  };

  const handleScheduleNext = () => {
    if (!meetingLog.next_session_datetime) {
      toast({
        title: "Next session date required",
        description: "Please set the next session date/time first.",
        variant: "destructive",
      });
      return;
    }

    const nextSessionData = {
      session_date: format(meetingLog.next_session_datetime, "yyyy-MM-dd"),
      start_time: format(meetingLog.next_session_datetime, "HH:mm"),
      description: `Follow-up session. Expected outcome: ${meetingLog.expected_outcome_next}`,
    };

    onScheduleNext?.(nextSessionData);
  };

  const isRequired = (field: keyof MeetingLogData) => {
    return field === 'focus_of_meeting' || field === 'next_session_datetime';
  };

  const isComplete = Boolean(meetingLog.focus_of_meeting && meetingLog.next_session_datetime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Meeting Log</span>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {lastSaved && (
              <span className="flex items-center gap-1">
                <Save className="h-4 w-4" />
                Saved {format(lastSaved, "HH:mm")}
              </span>
            )}
            {isComplete && (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-4 w-4" />
                Complete
              </span>
            )}
            {isLoading && (
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Focus of Meeting */}
        <div className="space-y-2">
          <Label htmlFor="focus">
            Focus of Meeting {isRequired('focus_of_meeting') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="focus"
            value={meetingLog.focus_of_meeting}
            onChange={(e) => handleFieldChange('focus_of_meeting', e.target.value)}
            placeholder="What is the main focus of this meeting?"
            className={cn(
              isRequired('focus_of_meeting') && !meetingLog.focus_of_meeting && "border-red-300"
            )}
          />
        </div>

        {/* Updates from Previous Session */}
        <div className="space-y-2">
          <Label htmlFor="updates">Updates from Previous Session</Label>
          <Textarea
            id="updates"
            value={meetingLog.updates_from_previous}
            onChange={(e) => handleFieldChange('updates_from_previous', e.target.value)}
            placeholder="What progress has been made since the last session?"
            rows={3}
          />
        </div>

        {/* Problems Encountered */}
        <div className="space-y-2">
          <Label htmlFor="problems">Problems Encountered</Label>
          <Textarea
            id="problems"
            value={meetingLog.problems_encountered}
            onChange={(e) => handleFieldChange('problems_encountered', e.target.value)}
            placeholder="What challenges or obstacles were discussed?"
            rows={3}
          />
        </div>

        {/* Resolutions Discussed */}
        <div className="space-y-2">
          <Label htmlFor="resolutions">Resolutions Discussed</Label>
          <Textarea
            id="resolutions"
            value={meetingLog.resolutions_discussed}
            onChange={(e) => handleFieldChange('resolutions_discussed', e.target.value)}
            placeholder="What solutions or approaches were explored?"
            rows={3}
          />
        </div>

        {/* Next Steps */}
        <div className="space-y-2">
          <Label htmlFor="nextSteps">What to Do Next</Label>
          <Textarea
            id="nextSteps"
            value={meetingLog.next_steps}
            onChange={(e) => handleFieldChange('next_steps', e.target.value)}
            placeholder="What actionable steps should be taken before the next meeting?"
            rows={3}
          />
        </div>

        {/* Expected Outcome */}
        <div className="space-y-2">
          <Label htmlFor="expectedOutcome">Expected Outcome by Next Meeting</Label>
          <Textarea
            id="expectedOutcome"
            value={meetingLog.expected_outcome_next}
            onChange={(e) => handleFieldChange('expected_outcome_next', e.target.value)}
            placeholder="What should be accomplished by the next session?"
            rows={2}
          />
        </div>

        {/* Next Session Date/Time */}
        <div className="space-y-2">
          <Label>
            Next Session Date/Time {isRequired('next_session_datetime') && <span className="text-red-500">*</span>}
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !meetingLog.next_session_datetime && "text-muted-foreground",
                  isRequired('next_session_datetime') && !meetingLog.next_session_datetime && "border-red-300"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {meetingLog.next_session_datetime ? (
                  format(meetingLog.next_session_datetime, "PPP 'at' p")
                ) : (
                  <span>Pick a date and time</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={meetingLog.next_session_datetime || undefined}
                onSelect={(date) => {
                  if (date) {
                    // Set default time to 9:00 AM if no time is set
                    const newDate = new Date(date);
                    if (!meetingLog.next_session_datetime) {
                      newDate.setHours(9, 0, 0, 0);
                    } else {
                      newDate.setHours(
                        meetingLog.next_session_datetime.getHours(),
                        meetingLog.next_session_datetime.getMinutes()
                      );
                    }
                    handleFieldChange('next_session_datetime', newDate);
                  }
                }}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
              {meetingLog.next_session_datetime && (
                <div className="p-3 border-t">
                  <Label htmlFor="time" className="text-sm">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={format(meetingLog.next_session_datetime, "HH:mm")}
                    onChange={(e) => {
                      if (meetingLog.next_session_datetime) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(meetingLog.next_session_datetime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        handleFieldChange('next_session_datetime', newDate);
                      }
                    }}
                    className="mt-1"
                  />
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => saveMeetingLog(true)}
            disabled={isLoading}
            className="flex-1"
          >
            <Save className="mr-2 h-4 w-4" />
            Save Meeting Log
          </Button>
          
          {isComplete && (
            <Button
              onClick={handleScheduleNext}
              variant="outline"
              className="flex-1"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Schedule Next Session
            </Button>
          )}
        </div>

        {/* Completion Status */}
        {!isComplete && (
          <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md">
            <p className="font-medium">Required to complete session:</p>
            <ul className="mt-1 space-y-1">
              {!meetingLog.focus_of_meeting && <li>• Focus of Meeting</li>}
              {!meetingLog.next_session_datetime && <li>• Next Session Date/Time</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}