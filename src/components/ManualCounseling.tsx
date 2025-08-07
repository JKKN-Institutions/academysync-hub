import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Target, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Save,
  FileText
} from 'lucide-react';
import type { MyjkknStudent } from '@/services/myjkknApi';

interface ManualCounselingProps {
  student: MyjkknStudent;
  sessionId?: string;
  onCounselingUpdate?: (data: any) => void;
}

interface CounselingAssessment {
  academicPerformance: {
    currentGPA: string;
    attendanceRate: string;
    subjectConcerns: string[];
    strengths: string[];
  };
  personalDevelopment: {
    communicationSkills: string;
    timeManagement: string;
    stressLevel: string;
    motivation: string;
  };
  goals: {
    shortTerm: string[];
    longTerm: string[];
    careerObjectives: string;
  };
  actionPlan: {
    immediateActions: string[];
    followUpDate: string;
    mentorNotes: string;
  };
}

export const ManualCounseling: React.FC<ManualCounselingProps> = ({
  student,
  sessionId,
  onCounselingUpdate
}) => {
  const [assessment, setAssessment] = useState<CounselingAssessment>({
    academicPerformance: {
      currentGPA: '',
      attendanceRate: '',
      subjectConcerns: [],
      strengths: []
    },
    personalDevelopment: {
      communicationSkills: '',
      timeManagement: '',
      stressLevel: '',
      motivation: ''
    },
    goals: {
      shortTerm: [''],
      longTerm: [''],
      careerObjectives: ''
    },
    actionPlan: {
      immediateActions: [''],
      followUpDate: '',
      mentorNotes: ''
    }
  });

  const [newConcern, setNewConcern] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const addConcern = () => {
    if (newConcern.trim()) {
      setAssessment(prev => ({
        ...prev,
        academicPerformance: {
          ...prev.academicPerformance,
          subjectConcerns: [...prev.academicPerformance.subjectConcerns, newConcern.trim()]
        }
      }));
      setNewConcern('');
    }
  };

  const addStrength = () => {
    if (newStrength.trim()) {
      setAssessment(prev => ({
        ...prev,
        academicPerformance: {
          ...prev.academicPerformance,
          strengths: [...prev.academicPerformance.strengths, newStrength.trim()]
        }
      }));
      setNewStrength('');
    }
  };

  const addShortTermGoal = () => {
    setAssessment(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        shortTerm: [...prev.goals.shortTerm, '']
      }
    }));
  };

  const addLongTermGoal = () => {
    setAssessment(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        longTerm: [...prev.goals.longTerm, '']
      }
    }));
  };

  const addAction = () => {
    setAssessment(prev => ({
      ...prev,
      actionPlan: {
        ...prev.actionPlan,
        immediateActions: [...prev.actionPlan.immediateActions, '']
      }
    }));
  };

  const updateShortTermGoal = (index: number, value: string) => {
    setAssessment(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        shortTerm: prev.goals.shortTerm.map((goal, i) => i === index ? value : goal)
      }
    }));
  };

  const updateLongTermGoal = (index: number, value: string) => {
    setAssessment(prev => ({
      ...prev,
      goals: {
        ...prev.goals,
        longTerm: prev.goals.longTerm.map((goal, i) => i === index ? value : goal)
      }
    }));
  };

  const updateAction = (index: number, value: string) => {
    setAssessment(prev => ({
      ...prev,
      actionPlan: {
        ...prev.actionPlan,
        immediateActions: prev.actionPlan.immediateActions.map((action, i) => i === index ? value : action)
      }
    }));
  };

  const removeConcern = (index: number) => {
    setAssessment(prev => ({
      ...prev,
      academicPerformance: {
        ...prev.academicPerformance,
        subjectConcerns: prev.academicPerformance.subjectConcerns.filter((_, i) => i !== index)
      }
    }));
  };

  const removeStrength = (index: number) => {
    setAssessment(prev => ({
      ...prev,
      academicPerformance: {
        ...prev.academicPerformance,
        strengths: prev.academicPerformance.strengths.filter((_, i) => i !== index)
      }
    }));
  };

  const saveCounselingData = async () => {
    setIsSaving(true);
    try {
      // In real implementation, save to Supabase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onCounselingUpdate?.(assessment);
      
      toast({
        title: 'Counseling Data Saved',
        description: 'Student counseling assessment has been recorded successfully.'
      });
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Could not save counseling data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Overview
          </CardTitle>
          <CardDescription>
            Counseling session for {student.name} ({student.rollNo})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Program</Label>
              <p className="text-sm text-muted-foreground">{student.program}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Year</Label>
              <p className="text-sm text-muted-foreground">{student.semesterYear}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                {student.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="academic" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="academic">Academic Assessment</TabsTrigger>
          <TabsTrigger value="personal">Personal Development</TabsTrigger>
          <TabsTrigger value="goals">Goals & Objectives</TabsTrigger>
          <TabsTrigger value="action">Action Plan</TabsTrigger>
        </TabsList>

        {/* Academic Assessment */}
        <TabsContent value="academic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Academic Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gpa">Current GPA/CGPA</Label>
                  <Input
                    id="gpa"
                    placeholder="e.g., 8.5/10"
                    value={assessment.academicPerformance.currentGPA}
                    onChange={(e) => setAssessment(prev => ({
                      ...prev,
                      academicPerformance: {
                        ...prev.academicPerformance,
                        currentGPA: e.target.value
                      }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="attendance">Attendance Rate</Label>
                  <Input
                    id="attendance"
                    placeholder="e.g., 85%"
                    value={assessment.academicPerformance.attendanceRate}
                    onChange={(e) => setAssessment(prev => ({
                      ...prev,
                      academicPerformance: {
                        ...prev.academicPerformance,
                        attendanceRate: e.target.value
                      }
                    }))}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Subject Areas of Concern</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add subject concern..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addConcern()}
                  />
                  <Button onClick={addConcern} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assessment.academicPerformance.subjectConcerns.map((concern, index) => (
                    <Badge key={index} variant="destructive" className="cursor-pointer"
                           onClick={() => removeConcern(index)}>
                      {concern} ×
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Academic Strengths</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Add strength..."
                    value={newStrength}
                    onChange={(e) => setNewStrength(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addStrength()}
                  />
                  <Button onClick={addStrength} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {assessment.academicPerformance.strengths.map((strength, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer"
                           onClick={() => removeStrength(index)}>
                      {strength} ×
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personal Development */}
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Personal Development Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="communication">Communication Skills</Label>
                  <Select onValueChange={(value) => setAssessment(prev => ({
                    ...prev,
                    personalDevelopment: { ...prev.personalDevelopment, communicationSkills: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="time-management">Time Management</Label>
                  <Select onValueChange={(value) => setAssessment(prev => ({
                    ...prev,
                    personalDevelopment: { ...prev.personalDevelopment, timeManagement: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="average">Average</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stress">Stress Level</Label>
                  <Select onValueChange={(value) => setAssessment(prev => ({
                    ...prev,
                    personalDevelopment: { ...prev.personalDevelopment, stressLevel: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="very-high">Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="motivation">Motivation Level</Label>
                  <Select onValueChange={(value) => setAssessment(prev => ({
                    ...prev,
                    personalDevelopment: { ...prev.personalDevelopment, motivation: value }
                  }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very-high">Very High</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals & Objectives */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Goals & Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Short-term Goals (Next 6 months)</Label>
                  <Button onClick={addShortTermGoal} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Goal
                  </Button>
                </div>
                <div className="space-y-2">
                  {assessment.goals.shortTerm.map((goal, index) => (
                    <Input
                      key={index}
                      placeholder={`Short-term goal ${index + 1}...`}
                      value={goal}
                      onChange={(e) => updateShortTermGoal(index, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Long-term Goals (1-2 years)</Label>
                  <Button onClick={addLongTermGoal} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Goal
                  </Button>
                </div>
                <div className="space-y-2">
                  {assessment.goals.longTerm.map((goal, index) => (
                    <Input
                      key={index}
                      placeholder={`Long-term goal ${index + 1}...`}
                      value={goal}
                      onChange={(e) => updateLongTermGoal(index, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="career">Career Objectives</Label>
                <Textarea
                  id="career"
                  placeholder="Describe career aspirations and objectives..."
                  value={assessment.goals.careerObjectives}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    goals: { ...prev.goals, careerObjectives: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Plan */}
        <TabsContent value="action" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Action Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Immediate Actions Required</Label>
                  <Button onClick={addAction} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" /> Add Action
                  </Button>
                </div>
                <div className="space-y-2">
                  {assessment.actionPlan.immediateActions.map((action, index) => (
                    <Input
                      key={index}
                      placeholder={`Action item ${index + 1}...`}
                      value={action}
                      onChange={(e) => updateAction(index, e.target.value)}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="follow-up">Next Follow-up Date</Label>
                <Input
                  id="follow-up"
                  type="date"
                  value={assessment.actionPlan.followUpDate}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    actionPlan: { ...prev.actionPlan, followUpDate: e.target.value }
                  }))}
                />
              </div>

              <div>
                <Label htmlFor="mentor-notes">Mentor Notes & Recommendations</Label>
                <Textarea
                  id="mentor-notes"
                  placeholder="Add your observations, recommendations, and next steps..."
                  value={assessment.actionPlan.mentorNotes}
                  onChange={(e) => setAssessment(prev => ({
                    ...prev,
                    actionPlan: { ...prev.actionPlan, mentorNotes: e.target.value }
                  }))}
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveCounselingData} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Counseling Assessment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};