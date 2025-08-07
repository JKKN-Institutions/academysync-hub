import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface StudentData {
  studentId: string;
  name: string;
  program: string;
  semester: string;
  email: string;
  mobile?: string;
  interests?: string[];
  academicStanding?: string;
  attendance?: number;
  gpa?: number;
}

interface AnalysisRequest {
  studentData: StudentData;
  analysisType?: 'comprehensive' | 'academic' | 'behavioral';
  query?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { studentData, analysisType = 'comprehensive', query }: AnalysisRequest = await req.json()
    
    // Get Perplexity API key from secrets
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY')
    if (!perplexityApiKey) {
      throw new Error('Perplexity API key not configured')
    }

    let systemPrompt = `You are an expert academic counselor and student advisor. Analyze the provided student data and provide detailed, actionable insights for counseling sessions.

Student Information:
- Name: ${studentData.name}
- Program: ${studentData.program}
- Semester: ${studentData.semester}
- Academic Standing: ${studentData.academicStanding || 'N/A'}
- Attendance: ${studentData.attendance ? `${studentData.attendance}%` : 'N/A'}
- GPA: ${studentData.gpa || 'N/A'}
- Interests: ${studentData.interests?.join(', ') || 'N/A'}

Provide analysis in the following categories:
1. Academic Performance Insights
2. Risk Factors (if any)
3. Specific Recommendations
4. Student Strengths
5. Action Items for Next Session

Be specific, constructive, and focus on actionable guidance for mentors.`;

    let userPrompt = '';
    
    if (query) {
      userPrompt = `Based on the student data provided, please answer this specific question: ${query}
      
      Provide a detailed, evidence-based response that considers the student's academic profile, interests, and current standing.`;
    } else {
      switch (analysisType) {
        case 'academic':
          userPrompt = 'Focus specifically on academic performance, study patterns, and academic growth opportunities.';
          break;
        case 'behavioral':
          userPrompt = 'Focus on behavioral patterns, engagement levels, and social-emotional development.';
          break;
        default:
          userPrompt = 'Provide a comprehensive analysis covering all aspects of the student\'s development and academic journey.';
      }
    }

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-large-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        max_tokens: 2000,
        return_images: false,
        return_related_questions: false,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`)
    }

    const aiResponse = await response.json()
    const analysisText = aiResponse.choices[0]?.message?.content

    if (query) {
      // For custom queries, return the raw response
      return new Response(
        JSON.stringify({ response: analysisText }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Parse the comprehensive analysis into structured format
    const analysis = parseAnalysisResponse(analysisText)
    
    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Counseling AI Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function parseAnalysisResponse(text: string) {
  // Parse the AI response into structured categories
  const sections = {
    academicInsights: [] as string[],
    riskFactors: [] as string[],
    recommendations: [] as string[],
    strengths: [] as string[],
    actionItems: [] as string[]
  }

  try {
    // Split by sections and extract bullet points
    const lines = text.split('\n').filter(line => line.trim())
    let currentSection = ''
    
    for (const line of lines) {
      const trimmed = line.trim()
      
      // Identify section headers
      if (trimmed.toLowerCase().includes('academic') && trimmed.toLowerCase().includes('insight')) {
        currentSection = 'academicInsights'
        continue
      }
      if (trimmed.toLowerCase().includes('risk')) {
        currentSection = 'riskFactors'
        continue
      }
      if (trimmed.toLowerCase().includes('recommendation')) {
        currentSection = 'recommendations'
        continue
      }
      if (trimmed.toLowerCase().includes('strength')) {
        currentSection = 'strengths'
        continue
      }
      if (trimmed.toLowerCase().includes('action')) {
        currentSection = 'actionItems'
        continue
      }
      
      // Extract bullet points or numbered items
      if ((trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed)) && currentSection) {
        const content = trimmed.replace(/^[•\-\d\.]\s*/, '').trim()
        if (content && sections[currentSection as keyof typeof sections]) {
          sections[currentSection as keyof typeof sections].push(content)
        }
      }
    }
    
    // Fallback: if parsing fails, put everything in academicInsights
    if (Object.values(sections).every(arr => arr.length === 0)) {
      sections.academicInsights = [text]
    }
    
  } catch (error) {
    console.error('Parse error:', error)
    sections.academicInsights = [text]
  }
  
  return sections
}