import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useStudentsData } from "@/hooks/useStudentsData";

interface GoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated?: () => void;
  sessionId?: string;
}

export function GoalForm({ open, onOpenChange, onGoalCreated, sessionId }: GoalFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { students } = useStudentsData();
  
  const [loading, setLoading] = useState(false);
  const [targetDate, setTargetDate] = useState<Date>();
  
  const [formData, setFormData] = useState({
    areaOfFocus: '',
    smartGoalText: '',
    knowledgeWhat: '',
    knowledgeHow: '',
    skillsWhat: '',
    skillsHow: '',
    actionPlan: '',
    studentId: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const goalData = {
        area_of_focus: formData.areaOfFocus,
        smart_goal_text: formData.smartGoalText,
        knowledge_what: formData.knowledgeWhat,
        knowledge_how: formData.knowledgeHow,
        skills_what: formData.skillsWhat,
        skills_how: formData.skillsHow,
        action_plan: formData.actionPlan,
        student_external_id: formData.studentId,
        target_date: targetDate ? format(targetDate, 'yyyy-MM-dd') : null,
        session_id: sessionId || null,
        created_by: user.id,
        status: 'proposed' as const
      };

      console.log('Creating goal with data:', goalData);

      const { data, error } = await supabase
        .from('goals')
        .insert(goalData)
        .select()
        .single();

      if (error) {
        console.error('Error creating goal:', error);
        throw error;
      }

      console.log('Goal created successfully:', data);

      toast({
        title: "✅ Goal Created Successfully",
        description: `Goal "${formData.areaOfFocus}" has been created`,
        duration: 4000,
      });

      // Reset form
      setFormData({
        areaOfFocus: '',
        smartGoalText: '',
        knowledgeWhat: '',
        knowledgeHow: '',
        skillsWhat: '',
        skillsHow: '',
        actionPlan: '',
        studentId: ''
      });
      setTargetDate(undefined);

      onOpenChange(false);
      onGoalCreated?.();

    } catch (error: any) {
      console.error('Error creating goal:', error);
      toast({
        title: "❌ Error Creating Goal",
        description: error.message || "Failed to create goal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            🎯 Create New Goal & Action Plan
          </DialogTitle>
          <DialogDescription>
            Define a SMART goal and detailed action plan for student development.
            Follow the handbook template for structured mentoring.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Selection */}
            <div className="space-y-2">
              <Label htmlFor="student">Student *</Label>
              <Select value={formData.studentId} onValueChange={(value) => handleInputChange('studentId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {student.name} ({student.rollNo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Date */}
            <div className="space-y-2">
              <Label>Target Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !targetDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {targetDate ? format(targetDate, "PPP") : "Select target date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={setTargetDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Area of Focus */}
          <div className="space-y-2">
            <Label htmlFor="areaOfFocus">Area of Focus *</Label>
            <Input
              id="areaOfFocus"
              value={formData.areaOfFocus}
              onChange={(e) => handleInputChange('areaOfFocus', e.target.value)}
              placeholder="e.g., Academic Performance, Communication Skills, Career Development"
              required
            />
          </div>

          {/* SMART Goal */}
          <div className="space-y-2">
            <Label htmlFor="smartGoal">SMART Goal Statement *</Label>
            <Textarea
              id="smartGoal"
              value={formData.smartGoalText}
              onChange={(e) => handleInputChange('smartGoalText', e.target.value)}
              placeholder="Write a Specific, Measurable, Achievable, Relevant, and Time-bound goal..."
              className="min-h-[100px]"
              required
            />
            <p className="text-xs text-muted-foreground">
              Ensure your goal is SMART: Specific, Measurable, Achievable, Relevant, Time-bound
            </p>
          </div>

          {/* Knowledge Development */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="knowledgeWhat">Knowledge to be Developed (What)</Label>
              <Textarea
                id="knowledgeWhat"
                value={formData.knowledgeWhat}
                onChange={(e) => handleInputChange('knowledgeWhat', e.target.value)}
                placeholder="What knowledge areas need development?"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="knowledgeHow">Knowledge Development (How)</Label>
              <Textarea
                id="knowledgeHow"
                value={formData.knowledgeHow}
                onChange={(e) => handleInputChange('knowledgeHow', e.target.value)}
                placeholder="How will this knowledge be acquired?"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Skills Development */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skillsWhat">Skills to be Gained (What)</Label>
              <Textarea
                id="skillsWhat"
                value={formData.skillsWhat}
                onChange={(e) => handleInputChange('skillsWhat', e.target.value)}
                placeholder="What skills need to be developed?"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillsHow">Skills Development (How)</Label>
              <Textarea
                id="skillsHow"
                value={formData.skillsHow}
                onChange={(e) => handleInputChange('skillsHow', e.target.value)}
                placeholder="How will these skills be developed?"
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Action Plan */}
          <div className="space-y-2">
            <Label htmlFor="actionPlan">Detailed Action Plan *</Label>
            <Textarea
              id="actionPlan"
              value={formData.actionPlan}
              onChange={(e) => handleInputChange('actionPlan', e.target.value)}
              placeholder="Outline specific steps, milestones, and timeline for achieving this goal..."
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Goal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}