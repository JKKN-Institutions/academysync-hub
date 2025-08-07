import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, FileText, Mic, MicOff, Volume2, Loader2 } from 'lucide-react';
import type { MyjkknStudent } from '@/services/myjkknApi';
import { counselingApi } from '@/lib/api';

interface CounselingAssistantProps {
  student: MyjkknStudent;
  sessionId?: string;
  onInsightGenerated?: (insight: string) => void;
}

interface AnalysisResult {
  academicInsights: string[];
  riskFactors: string[];
  recommendations: string[];
  strengths: string[];
  actionItems: string[];
}

export const CounselingAssistant: React.FC<CounselingAssistantProps> = ({
  student,
  sessionId,
  onInsightGenerated
}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customQuery, setCustomQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const analyzeStudentData = async () => {
    setIsAnalyzing(true);
    try {
      const result = await counselingApi.analyze(student, 'comprehensive');

      setAnalysis(result);
      
      toast({
        title: 'Analysis Complete',
        description: 'Student data analysis has been generated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Analysis Failed',
        description: 'Unable to analyze student data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const askCustomQuestion = async () => {
    if (!customQuery.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const result = await counselingApi.query(student, customQuery);
      onInsightGenerated?.(result.response);
      
      toast({
        title: 'Query Complete',
        description: 'Custom analysis has been generated.'
      });
    } catch (error) {
      toast({
        title: 'Query Failed',
        description: 'Unable to process your question. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      // Stop listening logic would go here
      setIsListening(false);
    } else {
      // Start listening logic would go here
      setIsListening(true);
    }
  };

  const speakText = async (text: string) => {
    setIsSpeaking(true);
    try {
      // Text-to-speech implementation would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate TTS
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Counseling Assistant
          </CardTitle>
          <CardDescription>
            Analyze student data and get AI-powered counseling insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={analyzeStudentData}
              disabled={isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              Analyze Student Data
            </Button>
          </div>

          {analysis && (
            <Tabs defaultValue="insights" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="risks">Risk Factors</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-2">
                <h4 className="font-semibold">Academic Insights</h4>
                {analysis.academicInsights.map((insight, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg flex items-start justify-between">
                    <p className="text-sm">{insight}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(insight)}
                      disabled={isSpeaking}
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="risks" className="space-y-2">
                <h4 className="font-semibold">Identified Risk Factors</h4>
                {analysis.riskFactors.map((risk, index) => (
                  <div key={index} className="p-3 bg-destructive/10 rounded-lg">
                    <Badge variant="destructive" className="mb-2">Risk</Badge>
                    <p className="text-sm">{risk}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-2">
                <h4 className="font-semibold">Counseling Recommendations</h4>
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="p-3 bg-primary/10 rounded-lg">
                    <Badge variant="default" className="mb-2">Action</Badge>
                    <p className="text-sm">{rec}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="strengths" className="space-y-2">
                <h4 className="font-semibold">Student Strengths</h4>
                {analysis.strengths.map((strength, index) => (
                  <div key={index} className="p-3 bg-success/10 rounded-lg">
                    <Badge variant="secondary" className="mb-2">Strength</Badge>
                    <p className="text-sm">{strength}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Analysis</CardTitle>
          <CardDescription>
            Ask specific questions about this student's data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Ask a specific question about this student's academic performance, behavior, or development..."
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={toggleVoiceInput}
              className={isListening ? 'bg-red-50 text-red-600' : ''}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          
          <Button 
            onClick={askCustomQuestion}
            disabled={!customQuery.trim() || isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <FileText className="h-4 w-4 mr-2" />
            )}
            Get AI Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};