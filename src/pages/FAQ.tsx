import { useState } from "react";
import { Search, ChevronDown, Heart, Brain, Users, Target, Book, Shield, HelpCircle, MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      id: "psychological",
      title: "Psychological Support",
      icon: Heart,
      color: "bg-red-500/10 text-red-600 border-red-200",
      description: "Understanding and addressing psychological concerns",
      faqs: [
        {
          question: "How can I identify if my mentee is facing psychological problems?",
          answer: "Look for behavioral changes such as withdrawal from activities, significant mood swings, declining academic performance, changes in sleep patterns, excessive worry or anxiety, and loss of interest in previously enjoyed activities. Pay attention to verbal cues like expressions of hopelessness, mentions of feeling overwhelmed, or statements about self-worth. Physical signs may include fatigue, changes in appetite, or frequent headaches. Create a safe environment where your mentee feels comfortable sharing their concerns."
        },
        {
          question: "How should I approach a mentee who seems emotionally disturbed?",
          answer: "Approach with empathy and patience. Choose a private, comfortable setting and use a calm, non-judgmental tone. Start with open-ended questions like 'How have you been feeling lately?' Avoid making assumptions or rushing to solutions. Show genuine concern and listen actively. Respect their pace in opening up and validate their feelings without minimizing their concerns."
        },
        {
          question: "What is the best way to listen to a mentee with psychological concerns?",
          answer: "Practice active listening by giving your full attention, maintaining appropriate eye contact, and avoiding distractions. Use reflective listening techniques by paraphrasing what they've shared. Avoid interrupting or offering immediate solutions. Ask clarifying questions to understand better. Show empathy through your body language and verbal responses. Create space for silence when they need time to process their thoughts."
        },
        {
          question: "Should I try to solve my mentee's psychological problems?",
          answer: "No, as a mentor, your role is to provide support, not therapy. Focus on listening, validating feelings, and helping them identify their strengths and resources. Encourage them to seek professional help when needed. You can help them develop coping strategies and problem-solving skills, but avoid diagnosing or providing therapeutic interventions. Your support should complement, not replace, professional mental health services."
        },
        {
          question: "What if my mentee refuses to open up?",
          answer: "Respect their boundaries while maintaining a supportive presence. Continue to build trust through consistent, reliable interactions. Share appropriate personal experiences to model vulnerability. Use indirect approaches like discussing hypothetical situations or using activities to facilitate conversation. Be patient and let them know you're available when they're ready. Sometimes just knowing support is available is helpful."
        },
        {
          question: "When should I refer a mentee to professional help?",
          answer: "Refer when you notice persistent symptoms affecting daily functioning, mentions of self-harm or suicide, substance abuse signs, severe anxiety or depression symptoms, trauma responses, eating disorder behaviors, or when the mentee requests professional help. Also refer if you feel overwhelmed or if issues are beyond your expertise. Early intervention is always better than waiting for problems to escalate."
        },
        {
          question: "How can I suggest counseling without making my mentee feel stigmatized?",
          answer: "Normalize mental health care by discussing it like any other health service. Use positive language like 'getting additional support' rather than focusing on problems. Share success stories of counseling (with permission). Emphasize that seeking help shows strength and self-awareness. Offer to help them find resources or accompany them to their first appointment if appropriate. Frame it as an investment in their overall well-being."
        },
        {
          question: "What should I do in a crisis (e.g., if a mentee talks about self-harm)?",
          answer: "Take all mentions of self-harm seriously and don't leave them alone. Ask directly about their intentions and plans. If there's immediate danger, contact emergency services. Connect them with crisis hotlines or professional services immediately. Inform appropriate authorities while maintaining their dignity. Stay calm and supportive while ensuring their safety. Follow up consistently after the crisis passes."
        }
      ]
    },
    {
      id: "communication",
      title: "Communication & Emotional Support",
      icon: MessageSquare,
      color: "bg-blue-500/10 text-blue-600 border-blue-200",
      description: "Effective communication strategies and emotional intelligence",
      faqs: [
        {
          question: "How do I maintain confidentiality while dealing with sensitive issues?",
          answer: "Establish clear boundaries about confidentiality at the beginning of your mentoring relationship. Explain exceptions (safety concerns, legal requirements). Only share information on a need-to-know basis and with appropriate personnel. Document conversations appropriately while protecting privacy. Seek guidance from supervisors when unsure about confidentiality limits. Always prioritize your mentee's trust while ensuring their safety."
        },
        {
          question: "What if supporting a mentee's psychological issues affects me emotionally?",
          answer: "Practice self-care through regular activities that restore your energy. Seek supervision or peer support to process difficult situations. Set healthy boundaries to prevent burnout. Consider professional counseling for yourself if needed. Remember that feeling affected shows your empathy, but you need to maintain your own well-being to be effective. Debrief with trusted colleagues while maintaining confidentiality."
        },
        {
          question: "How can I recognize if my mentee is emotionally disturbed?",
          answer: "Watch for sudden changes in behavior, academic performance, or social interactions. Notice emotional expressions that seem disproportionate to situations. Look for signs like excessive crying, anger outbursts, withdrawal, or seeming disconnected. Pay attention to changes in grooming, energy levels, or participation in activities. Trust your instincts if something feels different about their usual demeanor."
        },
        {
          question: "What if my mentee does not openly talk about their emotional problems?",
          answer: "Create opportunities through activities or informal settings. Use indirect approaches like discussing general stress or challenges. Share appropriate personal experiences to model openness. Ask about specific areas of their life (academics, relationships, family). Use observation skills to notice non-verbal cues. Be patient and consistent in showing that you care and are available when they're ready to share."
        },
        {
          question: "How should I start a sensitive conversation with a struggling mentee?",
          answer: "Choose an appropriate time and private setting. Begin with general check-ins about their well-being. Use open-ended questions and avoid assumptions. Start with observations like 'I've noticed you seem stressed lately.' Express genuine care and concern. Give them permission to share by saying things like 'It's okay to talk about difficult things here.' Be prepared to listen without rushing to fix everything."
        },
        {
          question: "What if my mentee becomes emotional or starts crying during our meeting?",
          answer: "Stay calm and present with them. Offer tissues and allow them space to express their emotions. Don't try to stop their crying or minimize their feelings. Use gentle, supportive language like 'It's okay to feel this way.' Wait for them to compose themselves before continuing the conversation. Validate their emotions and thank them for trusting you with their feelings."
        },
        {
          question: "How can I listen effectively without making them feel judged?",
          answer: "Maintain a neutral, accepting facial expression and posture. Avoid interrupting or rushing to give advice. Use reflective statements to show understanding. Ask clarifying questions without challenging their perspective. Avoid expressing shock or strong reactions to what they share. Focus on understanding their experience rather than evaluating it. Practice unconditional positive regard."
        }
      ]
    },
    {
      id: "professional",
      title: "Professional Responsibilities",
      icon: Shield,
      color: "bg-green-500/10 text-green-600 border-green-200",
      description: "Understanding your role and boundaries as a mentor",
      faqs: [
        {
          question: "What should I do if the mentee expects me to solve all their personal problems?",
          answer: "Clarify your role and boundaries early in the relationship. Explain that your role is to support and guide, not to solve their problems. Help them develop their own problem-solving skills by asking questions that encourage reflection. Teach them to identify resources and support systems. When appropriate, refer them to professional services. Emphasize that growth comes from learning to handle challenges themselves."
        },
        {
          question: "What if my mentee shares something highly personal or confidential?",
          answer: "Thank them for trusting you and honor that trust appropriately. Maintain confidentiality except in cases of safety concerns or legal requirements. Don't share their information with others unless absolutely necessary for their well-being. If you must break confidentiality, explain why and involve them in the process when possible. Document appropriately while protecting their privacy."
        },
        {
          question: "How do I refer a mentee without making them feel stigmatized?",
          answer: "Frame referrals as additional resources rather than evidence of problems. Explain the benefits of specialized support and normalize seeking help. Offer to help them research options or make initial contact. Use positive language about professional services. Share success stories when appropriate. Emphasize that you'll continue your support alongside professional help."
        },
        {
          question: "What if the mentee refuses professional help?",
          answer: "Respect their autonomy while expressing your concern. Continue to provide support within your capabilities. Help them identify alternative resources or support systems. Gradually educate them about the benefits of professional help. Sometimes planting the seed is enough - they may seek help later. Know when you've reached your limits and seek supervision or guidance."
        },
        {
          question: "What are the key responsibilities of a mentor?",
          answer: "Provide guidance, support, and encouragement to mentees. Help them set and achieve academic and personal goals. Share knowledge, experience, and professional insights. Model professional behavior and ethical standards. Maintain appropriate boundaries and confidentiality. Connect mentees with resources and opportunities. Advocate for their development and success. Provide honest, constructive feedback in a supportive manner."
        }
      ]
    },
    {
      id: "practical",
      title: "Practical Mentoring",
      icon: Target,
      color: "bg-purple-500/10 text-purple-600 border-purple-200",
      description: "Day-to-day mentoring activities and logistics",
      faqs: [
        {
          question: "How many mentees will be assigned to each mentor?",
          answer: "Typically, mentors are assigned 5-8 mentees to ensure quality relationships while maintaining manageable workloads. The exact number may vary based on mentor availability, department needs, and institutional capacity. This ratio allows for meaningful individual attention while enabling group activities when appropriate."
        },
        {
          question: "What is expected in terms of meeting frequency with mentees?",
          answer: "Regular one-on-one meetings should occur at least once every two weeks, with group sessions monthly. Additional meetings may be scheduled based on mentee needs or critical periods (exams, clinical rotations). Emergency support should be available as needed. Document all interactions for continuity and progress tracking."
        },
        {
          question: "What should I do if a mentee is irregular or unresponsive?",
          answer: "Try multiple communication methods and reach out consistently. Investigate potential barriers to engagement (academic stress, personal issues, schedule conflicts). Involve program coordinators if needed. Set clear expectations about communication and attendance. Sometimes non-engagement indicates underlying problems that need addressing."
        },
        {
          question: "Are there any tools or platforms provided for mentorship documentation? Require Orientation on MYJKKN for mentor mentee program?",
          answer: "Yes, the MYJKKN platform provides comprehensive tools for mentorship documentation including session notes, goal tracking, progress monitoring, and communication logs. All mentors will receive orientation and training on using the platform effectively. The system ensures proper documentation for continuity and program evaluation."
        },
        {
          question: "How is mentor effectiveness evaluated?",
          answer: "Evaluation includes mentee feedback, goal achievement rates, documentation quality, professional development of mentees, and self-reflection assessments. Regular check-ins with program coordinators and peer feedback also contribute to evaluation. Focus is on continuous improvement rather than punitive measures."
        }
      ]
    },
    {
      id: "development",
      title: "Skill Development & Growth",
      icon: Brain,
      color: "bg-orange-500/10 text-orange-600 border-orange-200",
      description: "Supporting mentee growth and professional development",
      faqs: [
        {
          question: "What if a mentor faces challenges addressing a mentee's personal or psychological issues?",
          answer: "Seek supervision and guidance from program coordinators or mental health professionals. Participate in additional training opportunities. Connect with experienced mentors for peer support. Know your limits and don't hesitate to refer to appropriate professionals. Document challenges and seek resources to improve your skills."
        },
        {
          question: "Will mentors receive ongoing support after the orientation?",
          answer: "Yes, ongoing support includes regular supervision sessions, peer mentoring groups, continuing education opportunities, access to resources and experts, and feedback mechanisms. The program provides continuous learning and development opportunities to enhance mentoring effectiveness."
        },
        {
          question: "What should mentors do if mentees face academic difficulties?",
          answer: "Help identify specific learning challenges and connect them with academic support services. Develop study strategies and time management skills. Provide encouragement and help them set realistic goals. Connect them with tutoring resources or study groups. Monitor progress and celebrate improvements."
        },
        {
          question: "What soft skills should I encourage in dental students?",
          answer: "Focus on communication skills, empathy, professional ethics, time management, stress management, teamwork, cultural sensitivity, patient interaction skills, conflict resolution, and leadership development. These skills are essential for successful dental practice and patient care."
        },
        {
          question: "How do I help my mentee build confidence?",
          answer: "Celebrate their achievements, both large and small. Provide specific, constructive feedback. Help them identify their strengths and past successes. Encourage them to take on appropriate challenges. Model confidence and positive self-talk. Share stories of overcoming obstacles. Create opportunities for them to succeed and recognize their progress."
        },
        {
          question: "How can I guide mentees about ethics and professionalism?",
          answer: "Model ethical behavior in all interactions. Discuss ethical dilemmas and decision-making frameworks. Share case studies and real-world examples. Encourage reflection on professional values. Connect them with professional organizations and codes of conduct. Emphasize the importance of integrity in all professional activities."
        },
        {
          question: "How do I guide mentees interested in international opportunities?",
          answer: "Help them research programs and requirements. Connect them with alumni or professionals who have international experience. Assist with application processes and preparation. Discuss cultural competency and adaptability. Help them develop necessary skills and qualifications for international opportunities."
        },
        {
          question: "How can I mentor mentees towards private practice readiness?",
          answer: "Discuss business skills, patient management, financial planning, and practice management. Provide exposure to different practice models. Connect them with practicing dentists and business mentors. Encourage shadowing opportunities and internships. Discuss the realities and challenges of private practice."
        }
      ]
    },
    {
      id: "institutional",
      title: "Institutional Support",
      icon: Users,
      color: "bg-teal-500/10 text-teal-600 border-teal-200",
      description: "Working within the institutional framework",
      faqs: [
        {
          question: "Are mentors work recognised in institution?",
          answer: "Yes, mentoring contributions are formally recognized through annual evaluations, awards programs, professional development credits, and potential career advancement considerations. The institution values mentoring as an essential component of faculty service and educational excellence."
        },
        {
          question: "How to address common issues of mentees to Higher authority?",
          answer: "Document issues systematically and present them with proposed solutions. Use proper channels and hierarchies for communication. Advocate for mentees while maintaining professional boundaries. Present data and evidence to support recommendations. Work collaboratively with administration to find solutions."
        },
        {
          question: "How to set goal and track the achievement of the goal with mentee?",
          answer: "Use SMART goal-setting principles (Specific, Measurable, Achievable, Relevant, Time-bound). Collaborate with mentees to set their own goals. Create action plans with specific steps and timelines. Regular check-ins to monitor progress and adjust goals as needed. Celebrate achievements and learn from setbacks. Use documentation tools to track progress over time."
        }
      ]
    }
  ];

  const allFAQs = faqCategories.flatMap(category => 
    category.faqs.map(faq => ({ ...faq, category: category.title, categoryId: category.id }))
  );

  const filteredFAQs = allFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6 py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
            <HelpCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent">
              JKKN Dental College & Hospital
            </h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Mentorship Orientation 2025 Program
            </h2>
            <p className="text-xl text-muted-foreground font-medium">
              Frequently Asked Questions for Mentors
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                <Book className="w-4 h-4 mr-2" />
                Complete Guide
              </Badge>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                {allFAQs.length} Questions Answered
              </Badge>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <Card className="mx-auto max-w-2xl shadow-lg border-0 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search FAQs by question, answer, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 py-3 text-lg border-2 focus:border-primary/50 bg-background/50"
              />
            </div>
            {searchTerm && (
              <div className="mt-4 text-center">
                <Badge variant="outline" className="text-base px-3 py-1">
                  {filteredFAQs.length} results found
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="categories" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 mx-auto max-w-md h-12">
            <TabsTrigger value="categories" className="text-base">By Categories</TabsTrigger>
            <TabsTrigger value="all" className="text-base">All Questions</TabsTrigger>
          </TabsList>

          {/* Categories View */}
          <TabsContent value="categories" className="space-y-8">
            <div className="grid gap-8 lg:gap-12">
              {filteredCategories.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Card key={category.id} className="shadow-lg border-0 overflow-hidden bg-card/50 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${category.color} shadow-sm`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-bold text-foreground">
                            {category.title}
                          </CardTitle>
                          <CardDescription className="text-base text-muted-foreground mt-2">
                            {category.description}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className="text-lg px-3 py-1">
                          {category.faqs.length} FAQs
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem 
                            key={index} 
                            value={`${category.id}-${index}`}
                            className="border border-border/50 rounded-lg px-4 bg-background/30"
                          >
                            <AccordionTrigger className="text-left hover:no-underline py-4">
                              <div className="flex items-start gap-3 pr-4">
                                <Badge variant="outline" className="mt-1 text-xs font-medium min-w-fit">
                                  Q{index + 1}
                                </Badge>
                                <span className="text-base font-medium leading-relaxed">
                                  {faq.question}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                              <div className="pl-12 pr-4">
                                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* All Questions View */}
          <TabsContent value="all" className="space-y-6">
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  All Frequently Asked Questions
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Complete collection of mentor guidance and support
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Accordion type="single" collapsible className="space-y-3">
                  {filteredFAQs.map((faq, index) => (
                    <AccordionItem 
                      key={index} 
                      value={`all-${index}`}
                      className="border border-border/50 rounded-lg px-4 bg-background/30"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <div className="flex items-start gap-3 pr-4">
                          <Badge variant="outline" className="mt-1 text-xs font-medium min-w-fit">
                            {index + 1}
                          </Badge>
                          <div className="flex-1">
                            <span className="text-base font-medium leading-relaxed block">
                              {faq.question}
                            </span>
                            <Badge variant="secondary" className="mt-2 text-xs">
                              {faq.category}
                            </Badge>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <div className="pl-12 pr-4">
                          <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Section */}
        <Card className="bg-gradient-to-r from-primary/5 via-background to-primary/5 border-primary/20 shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold mb-4">Need Additional Support?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
              This FAQ guide covers common mentoring scenarios, but every mentee is unique. 
              Don't hesitate to reach out for additional support, training, or consultation 
              when you encounter situations not covered here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge variant="outline" className="text-base px-4 py-2">
                <Shield className="w-4 h-4 mr-2" />
                Professional Development
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                <Users className="w-4 h-4 mr-2" />
                Peer Support Network
              </Badge>
              <Badge variant="outline" className="text-base px-4 py-2">
                <Heart className="w-4 h-4 mr-2" />
                Mental Health Resources
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;