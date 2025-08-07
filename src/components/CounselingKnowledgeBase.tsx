import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Search,
  Lightbulb,
  BarChart3
} from 'lucide-react';
import type { MyjkknStudent } from '@/services/myjkknApi';

interface CounselingKnowledgeBaseProps {
  student: MyjkknStudent;
  allStudents: MyjkknStudent[];
  onInsightApplied?: (insight: CounselingInsight) => void;
}

interface CounselingInsight {
  type: 'academic' | 'behavioral' | 'social' | 'career';
  title: string;
  description: string;
  recommendation: string;
  confidence: number;
  evidence: string[];
  actionItems: string[];
}

interface AcademicAnalysis {
  performanceTrend: 'improving' | 'declining' | 'stable';
  riskFactors: string[];
  strengths: string[];
  compareToProgram: {
    rank: number;
    percentile: number;
    totalStudents: number;
  };
}

export const CounselingKnowledgeBase: React.FC<CounselingKnowledgeBaseProps> = ({
  student,
  allStudents,
  onInsightApplied
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInsight, setSelectedInsight] = useState<CounselingInsight | null>(null);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  // Analyze student data and generate insights
  const generateInsights = (): CounselingInsight[] => {
    const programPeers = allStudents.filter(s => 
      s.program === student.program && s.status === 'active'
    );
    
    const insights: CounselingInsight[] = [];

    // Academic Performance Analysis
    if (student.gpa) {
      const avgGPA = programPeers.reduce((sum, s) => sum + (s.gpa || 0), 0) / programPeers.length;
      const gpaPercentile = programPeers.filter(s => (s.gpa || 0) < (student.gpa || 0)).length / programPeers.length * 100;
      
      if (student.gpa < avgGPA - 0.5) {
        insights.push({
          type: 'academic',
          title: 'Academic Performance Below Average',
          description: `Student's GPA (${student.gpa}) is significantly below program average (${avgGPA.toFixed(2)})`,
          recommendation: 'Implement structured study plan and consider academic support services',
          confidence: 85,
          evidence: [
            `GPA: ${student.gpa} vs Program Average: ${avgGPA.toFixed(2)}`,
            `Percentile: ${gpaPercentile.toFixed(0)}%`,
            `Semester: ${student.semesterYear}`
          ],
          actionItems: [
            'Create weekly study schedule',
            'Identify challenging subjects',
            'Connect with tutoring services',
            'Set monthly academic goals'
          ]
        });
      }
    }

    // Interest-Based Career Guidance
    if (student.interests && student.interests.length > 0) {
      const commonInterests = student.interests.filter(interest => 
        programPeers.some(peer => peer.interests?.includes(interest))
      );
      
      insights.push({
        type: 'career',
        title: 'Career Path Alignment',
        description: `Student shows strong interest in ${student.interests.join(', ')}`,
        recommendation: 'Develop specialized skills in areas of interest',
        confidence: 75,
        evidence: [
          `Interests: ${student.interests.join(', ')}`,
          `Common with peers: ${commonInterests.join(', ')}`,
          `Program: ${student.program}`
        ],
        actionItems: [
          'Research career opportunities',
          'Find relevant internships',
          'Join related student organizations',
          'Connect with industry professionals'
        ]
      });
    }

    // Progress Analysis based on semester
    if (student.semesterYear >= 6) {
      insights.push({
        type: 'career',
        title: 'Final Year Career Preparation',
        description: 'Student is in final stages of program - critical career preparation period',
        recommendation: 'Focus on job placement and professional development',
        confidence: 90,
        evidence: [
          `Semester: ${student.semesterYear}`,
          `Program: ${student.program}`,
          'Near graduation'
        ],
        actionItems: [
          'Update resume and portfolio',
          'Apply for jobs/graduate programs',
          'Practice interview skills',
          'Network with alumni'
        ]
      });
    }

    // Social Integration Analysis
    const hasAssignedMentor = student.mentor;
    if (!hasAssignedMentor) {
      insights.push({
        type: 'social',
        title: 'Mentorship Gap',
        description: 'Student currently has no assigned mentor',
        recommendation: 'Assign appropriate mentor based on interests and career goals',
        confidence: 95,
        evidence: [
          'No current mentor assignment',
          `Interests: ${student.interests?.join(', ') || 'Not specified'}`,
          `Program: ${student.program}`
        ],
        actionItems: [
          'Review available mentors',
          'Match based on expertise',
          'Schedule initial meeting',
          'Set mentoring goals'
        ]
      });
    }

    return insights;
  };

  const [insights] = useState<CounselingInsight[]>(generateInsights());

  const getAcademicAnalysis = (): AcademicAnalysis => {
    const programPeers = allStudents.filter(s => 
      s.program === student.program && s.status === 'active'
    );
    
    const avgGPA = programPeers.reduce((sum, s) => sum + (s.gpa || 0), 0) / programPeers.length;
    const rank = programPeers.filter(s => (s.gpa || 0) > (student.gpa || 0)).length + 1;
    const percentile = ((programPeers.length - rank + 1) / programPeers.length) * 100;

    return {
      performanceTrend: student.gpa && student.gpa > avgGPA ? 'improving' : 'stable',
      riskFactors: student.gpa && student.gpa < avgGPA - 0.5 ? ['Low GPA', 'Below average performance'] : [],
      strengths: student.interests || [],
      compareToProgram: {
        rank,
        percentile,
        totalStudents: programPeers.length
      }
    };
  };

  const academicAnalysis = getAcademicAnalysis();

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'academic': return <BookOpen className="h-4 w-4" />;
      case 'career': return <Target className="h-4 w-4" />;
      case 'social': return <Users className="h-4 w-4" />;
      case 'behavioral': return <Brain className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const filteredInsights = insights.filter(insight =>
    insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    insight.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Student Analysis Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Student Analysis Dashboard
          </CardTitle>
          <CardDescription>
            Data-driven insights for {student.name} ({student.rollNo})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{academicAnalysis.compareToProgram.rank}</div>
              <div className="text-sm text-muted-foreground">Program Rank</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{academicAnalysis.compareToProgram.percentile.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Percentile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{insights.length}</div>
              <div className="text-sm text-muted-foreground">Insights Generated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="analysis">Academic Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button 
              onClick={() => setGeneratingInsights(true)}
              disabled={generatingInsights}
            >
              {generatingInsights ? 'Analyzing...' : 'Refresh Insights'}
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredInsights.map((insight, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setSelectedInsight(insight)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getConfidenceColor(insight.confidence)}>
                      {insight.confidence}% confidence
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Recommendation:</div>
                    <div className="text-sm text-muted-foreground">{insight.recommendation}</div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {insight.evidence.slice(0, 2).map((evidence, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {evidence}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Academic Analysis Tab */}
        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Current GPA</label>
                    <div className="text-2xl font-bold">{student.gpa || 'N/A'}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Program Average</label>
                    <div className="text-2xl font-bold">
                      {(allStudents
                        .filter(s => s.program === student.program)
                        .reduce((sum, s) => sum + (s.gpa || 0), 0) / 
                        allStudents.filter(s => s.program === student.program).length
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Performance Trend</label>
                  <div className="flex items-center gap-2 mt-1">
                    {academicAnalysis.performanceTrend === 'improving' && (
                      <Badge className="bg-green-100 text-green-800">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Improving
                      </Badge>
                    )}
                    {academicAnalysis.performanceTrend === 'stable' && (
                      <Badge variant="secondary">Stable</Badge>
                    )}
                  </div>
                </div>

                {academicAnalysis.riskFactors.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Risk factors identified: {academicAnalysis.riskFactors.join(', ')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interest Areas & Strengths</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(student.interests || []).map((interest, index) => (
                    <Badge key={index} variant="secondary">
                      {interest}
                    </Badge>
                  ))}
                </div>
                {(!student.interests || student.interests.length === 0) && (
                  <div className="text-muted-foreground text-sm">
                    No interests specified - consider discussing career aspirations
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Recommended Action Plan
              </CardTitle>
              <CardDescription>
                Based on analysis of student data and program performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Button
                        size="sm"
                        onClick={() => onInsightApplied?.(insight)}
                      >
                        Apply to Counseling
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {insight.recommendation}
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">Action Items:</div>
                        {insight.actionItems.map((action, actionIndex) => (
                          <div key={actionIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <Card className="fixed inset-4 z-50 bg-background shadow-lg border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getInsightIcon(selectedInsight.type)}
                {selectedInsight.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedInsight(null)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Description</label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedInsight.description}
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium">Recommendation</label>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedInsight.recommendation}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Confidence Level</label>
              <div className="flex items-center gap-2 mt-1">
                <Progress value={selectedInsight.confidence} className="flex-1" />
                <span className="text-sm">{selectedInsight.confidence}%</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Evidence</label>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedInsight.evidence.map((evidence, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {evidence}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => {
                  onInsightApplied?.(selectedInsight);
                  setSelectedInsight(null);
                }}
                className="flex-1"
              >
                Apply to Counseling Session
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedInsight(null)}
              >
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};