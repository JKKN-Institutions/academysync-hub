import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface MeetingLogData {
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

export function useMeetingLog(sessionId: string) {
  const [meetingLog, setMeetingLog] = useState<MeetingLogData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      loadMeetingLog();
    }
  }, [sessionId]);

  const loadMeetingLog = async () => {
    try {
      setIsLoading(true);
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
      } else {
        // Initialize empty meeting log
        setMeetingLog({
          session_id: sessionId,
          focus_of_meeting: "",
          updates_from_previous: "",
          problems_encountered: "",
          resolutions_discussed: "",
          next_steps: "",
          expected_outcome_next: "",
          next_session_datetime: null,
        });
      }
    } catch (error) {
      console.error("Error loading meeting log:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMeetingLog = async (data: Partial<MeetingLogData>, showToast = true) => {
    if (!meetingLog) return;

    try {
      setIsLoading(true);
      
      const updatedLog = { ...meetingLog, ...data };
      setMeetingLog(updatedLog);

      const dataToSave = {
        session_id: sessionId,
        focus_of_meeting: updatedLog.focus_of_meeting,
        updates_from_previous: updatedLog.updates_from_previous,
        problems_encountered: updatedLog.problems_encountered,
        resolutions_discussed: updatedLog.resolutions_discussed,
        next_steps: updatedLog.next_steps,
        expected_outcome_next: updatedLog.expected_outcome_next,
        next_session_datetime: updatedLog.next_session_datetime?.toISOString(),
      };

      let result;
      
      if (updatedLog.id) {
        result = await supabase
          .from("meeting_logs")
          .update(dataToSave)
          .eq("id", updatedLog.id)
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

      if (result.data && !updatedLog.id) {
        setMeetingLog(prev => prev ? { ...prev, id: result.data.id } : null);
      }

      setLastSaved(new Date());
      
      if (showToast) {
        toast({
          title: "Meeting log saved",
          description: "Changes have been saved successfully.",
        });
      }

      return result.data;
    } catch (error) {
      console.error("Error saving meeting log:", error);
      if (showToast) {
        toast({
          title: "Error saving meeting log",
          description: "Failed to save changes. Please try again.",
          variant: "destructive",
        });
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isComplete = Boolean(
    meetingLog?.focus_of_meeting && 
    meetingLog?.next_session_datetime
  );

  return {
    meetingLog,
    isLoading,
    lastSaved,
    saveMeetingLog,
    isComplete,
    reload: loadMeetingLog,
  };
}