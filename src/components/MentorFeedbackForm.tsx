import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MentorFeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  mentorExternalId: string;
  onSuccess?: () => void;
}

interface MentorFeedbackData {
  session_quality_rating: number;
  student_engagement_rating: number;
  goals_achieved_rating: number;
  student_progress_notes: string;
  key_outcomes: string;
  challenges_faced: string;
  next_steps_recommended: string;
  follow_up_required: boolean;
  follow_up_timeline: string;
  additional_support_needed: string;
  mentor_reflection: string;
  improvement_areas: string;
}

const StarRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (value: number) => void; 
  label: string;
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const MentorFeedbackForm = ({
  open,
  onOpenChange,
  sessionId,
  mentorExternalId,
  onSuccess
}: MentorFeedbackFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<MentorFeedbackData>({
    session_quality_rating: 0,
    student_engagement_rating: 0,
    goals_achieved_rating: 0,
    student_progress_notes: "",
    key_outcomes: "",
    challenges_faced: "",
    next_steps_recommended: "",
    follow_up_required: false,
    follow_up_timeline: "",
    additional_support_needed: "",
    mentor_reflection: "",
    improvement_areas: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (feedback.session_quality_rating === 0 || feedback.student_engagement_rating === 0 || feedback.goals_achieved_rating === 0) {
      toast({
        title: "Please complete all ratings",
        description: "All star rating fields are required.",
        variant: "destructive"
      });
      return;
    }

    if (!feedback.student_progress_notes.trim() || !feedback.next_steps_recommended.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in student progress notes and next steps recommended.",
        variant: "destructive"
      });
      return;
    }

    if (feedback.follow_up_required && !feedback.follow_up_timeline.trim()) {
      toast({
        title: "Follow-up timeline required",
        description: "Please specify the follow-up timeline when follow-up is required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('mentor_feedback')
        .insert({
          session_id: sessionId,
          mentor_external_id: mentorExternalId,
          session_quality_rating: feedback.session_quality_rating,
          student_engagement_rating: feedback.student_engagement_rating,
          goals_achieved_rating: feedback.goals_achieved_rating,
          student_progress_notes: feedback.student_progress_notes.trim(),
          key_outcomes: feedback.key_outcomes.trim() || null,
          challenges_faced: feedback.challenges_faced.trim() || null,
          next_steps_recommended: feedback.next_steps_recommended.trim(),
          follow_up_required: feedback.follow_up_required,
          follow_up_timeline: feedback.follow_up_timeline.trim() || null,
          additional_support_needed: feedback.additional_support_needed.trim() || null,
          mentor_reflection: feedback.mentor_reflection.trim() || null,
          improvement_areas: feedback.improvement_areas.trim() || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Mentor feedback submitted",
        description: "Your detailed feedback has been recorded successfully."
      });

      // Reset form
      setFeedback({
        session_quality_rating: 0,
        student_engagement_rating: 0,
        goals_achieved_rating: 0,
        student_progress_notes: "",
        key_outcomes: "",
        challenges_faced: "",
        next_steps_recommended: "",
        follow_up_required: false,
        follow_up_timeline: "",
        additional_support_needed: "",
        mentor_reflection: "",
        improvement_areas: ""
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting mentor feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "There was a problem saving your feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mentor Session Feedback</DialogTitle>
          <DialogDescription>
            Please provide detailed feedback about this counseling session. This feedback is required before the session can be marked as completed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Assessment</CardTitle>
              <CardDescription>Rate different aspects of the session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                label="Overall Session Quality"
                value={feedback.session_quality_rating}
                onChange={(value) => setFeedback(prev => ({ ...prev, session_quality_rating: value }))}
              />
              
              <StarRating
                label="Student Engagement Level"
                value={feedback.student_engagement_rating}
                onChange={(value) => setFeedback(prev => ({ ...prev, student_engagement_rating: value }))}
              />
              
              <StarRating
                label="Goals Achievement Rating"
                value={feedback.goals_achieved_rating}
                onChange={(value) => setFeedback(prev => ({ ...prev, goals_achieved_rating: value }))}
              />
            </CardContent>
          </Card>

          {/* Progress Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Assessment</CardTitle>
              <CardDescription>Document student progress and session outcomes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="progress-notes">Student Progress Notes *</Label>
                <Textarea
                  id="progress-notes"
                  placeholder="Describe the student's progress, achievements, and areas of development observed during this session..."
                  value={feedback.student_progress_notes}
                  onChange={(e) => setFeedback(prev => ({ ...prev, student_progress_notes: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="key-outcomes">Key Outcomes</Label>
                <Textarea
                  id="key-outcomes"
                  placeholder="List the main outcomes, decisions made, or breakthroughs achieved during this session..."
                  value={feedback.key_outcomes}
                  onChange={(e) => setFeedback(prev => ({ ...prev, key_outcomes: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="challenges">Challenges Faced</Label>
                <Textarea
                  id="challenges"
                  placeholder="Document any challenges, obstacles, or difficulties encountered during the session..."
                  value={feedback.challenges_faced}
                  onChange={(e) => setFeedback(prev => ({ ...prev, challenges_faced: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="next-steps">Next Steps Recommended *</Label>
                <Textarea
                  id="next-steps"
                  placeholder="Outline specific next steps, actions, or recommendations for the student..."
                  value={feedback.next_steps_recommended}
                  onChange={(e) => setFeedback(prev => ({ ...prev, next_steps_recommended: e.target.value }))}
                  className="min-h-[100px]"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Follow-up Planning */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Follow-up Planning</CardTitle>
              <CardDescription>Plan future support and follow-up activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Follow-up Required?</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={feedback.follow_up_required}
                    onCheckedChange={(checked) => setFeedback(prev => ({ ...prev, follow_up_required: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {feedback.follow_up_required ? "Yes, follow-up is needed" : "No follow-up required"}
                  </span>
                </div>
              </div>

              {feedback.follow_up_required && (
                <div className="space-y-2">
                  <Label htmlFor="follow-up-timeline">Follow-up Timeline *</Label>
                  <Textarea
                    id="follow-up-timeline"
                    placeholder="Specify when and how the follow-up should be conducted..."
                    value={feedback.follow_up_timeline}
                    onChange={(e) => setFeedback(prev => ({ ...prev, follow_up_timeline: e.target.value }))}
                    className="min-h-[60px]"
                    required={feedback.follow_up_required}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="additional-support">Additional Support Needed</Label>
                <Textarea
                  id="additional-support"
                  placeholder="Identify any additional resources, support, or interventions the student may need..."
                  value={feedback.additional_support_needed}
                  onChange={(e) => setFeedback(prev => ({ ...prev, additional_support_needed: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mentor Reflection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Mentor Reflection</CardTitle>
              <CardDescription>Reflect on the session and your mentoring approach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mentor-reflection">Personal Reflection</Label>
                <Textarea
                  id="mentor-reflection"
                  placeholder="Reflect on what went well, what could be improved, and any insights gained..."
                  value={feedback.mentor_reflection}
                  onChange={(e) => setFeedback(prev => ({ ...prev, mentor_reflection: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvement-areas">Areas for Improvement</Label>
                <Textarea
                  id="improvement-areas"
                  placeholder="Identify areas where your mentoring approach or the session structure could be improved..."
                  value={feedback.improvement_areas}
                  onChange={(e) => setFeedback(prev => ({ ...prev, improvement_areas: e.target.value }))}
                  className="min-h-[80px]"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};