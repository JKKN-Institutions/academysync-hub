import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SessionFeedbackFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  menteeExternalId: string;
  onSuccess?: () => void;
}

interface FeedbackData {
  overall_rating: number;
  mentor_helpfulness: number;
  session_effectiveness: number;
  would_recommend: boolean;
  comments: string;
  improvement_suggestions: string;
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

export const SessionFeedbackForm = ({
  open,
  onOpenChange,
  sessionId,
  menteeExternalId,
  onSuccess
}: SessionFeedbackFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    overall_rating: 0,
    mentor_helpfulness: 0,
    session_effectiveness: 0,
    would_recommend: true,
    comments: "",
    improvement_suggestions: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (feedback.overall_rating === 0 || feedback.mentor_helpfulness === 0 || feedback.session_effectiveness === 0) {
      toast({
        title: "Please complete all ratings",
        description: "All star rating fields are required.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('session_feedback')
        .insert({
          session_id: sessionId,
          mentee_external_id: menteeExternalId,
          overall_rating: feedback.overall_rating,
          mentor_helpfulness: feedback.mentor_helpfulness,
          session_effectiveness: feedback.session_effectiveness,
          would_recommend: feedback.would_recommend,
          comments: feedback.comments.trim() || null,
          improvement_suggestions: feedback.improvement_suggestions.trim() || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Feedback submitted",
        description: "Thank you for your feedback! It helps us improve our mentoring program."
      });

      // Reset form
      setFeedback({
        overall_rating: 0,
        mentor_helpfulness: 0,
        session_effectiveness: 0,
        would_recommend: true,
        comments: "",
        improvement_suggestions: ""
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting feedback:', error);
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Session Feedback</DialogTitle>
          <DialogDescription>
            Please share your feedback about this counseling session. Your input helps us improve our mentoring program.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rating</CardTitle>
              <CardDescription>
                Please rate different aspects of your session
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <StarRating
                label="Overall Session Rating"
                value={feedback.overall_rating}
                onChange={(value) => setFeedback(prev => ({ ...prev, overall_rating: value }))}
              />
              
              <StarRating
                label="Mentor Helpfulness"
                value={feedback.mentor_helpfulness}
                onChange={(value) => setFeedback(prev => ({ ...prev, mentor_helpfulness: value }))}
              />
              
              <StarRating
                label="Session Effectiveness"
                value={feedback.session_effectiveness}
                onChange={(value) => setFeedback(prev => ({ ...prev, session_effectiveness: value }))}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Would you recommend this mentor to other students?</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={feedback.would_recommend}
                    onCheckedChange={(checked) => setFeedback(prev => ({ ...prev, would_recommend: checked }))}
                  />
                  <span className="text-sm text-muted-foreground">
                    {feedback.would_recommend ? "Yes, I would recommend" : "No, I would not recommend"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comments</CardTitle>
              <CardDescription>
                Share your thoughts about the session (optional)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="comments">What did you find most helpful about this session?</Label>
                <Textarea
                  id="comments"
                  placeholder="Share what you found valuable, helpful insights you gained, or positive aspects of the mentoring..."
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements">Suggestions for improvement</Label>
                <Textarea
                  id="improvements"
                  placeholder="Any suggestions for how the session or mentoring approach could be improved..."
                  value={feedback.improvement_suggestions}
                  onChange={(e) => setFeedback(prev => ({ ...prev, improvement_suggestions: e.target.value }))}
                  className="min-h-[100px]"
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