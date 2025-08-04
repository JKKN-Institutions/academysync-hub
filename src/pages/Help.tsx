import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Search, 
  Users, 
  UserCheck, 
  Calendar, 
  Target, 
  BarChart3, 
  HelpCircle, 
  BookOpen, 
  Video,
  ExternalLink,
  Play
} from 'lucide-react';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const faqItems = [
    {
      category: "Getting Started",
      items: [
        {
          question: "How do I assign a student to a mentor?",
          answer: "Navigate to the Assignments page and click 'New Assignment'. Select a mentor and student from the synced directories, set the assignment dates, and save. Note: Assignment mode must be set to 'App-managed' in Admin settings."
        },
        {
          question: "What's the difference between Demo Mode and Live Data?",
          answer: "Demo Mode uses safe mock data with clearly fake IDs (DEMO_*) for training sessions. Live Data connects to your actual People API. You can toggle this in Admin → Settings."
        },
        {
          question: "How do I sync data from the People API?",
          answer: "Go to Admin → Integrations, configure your API credentials, test the connection, then run a Full Sync. You can also enable automatic incremental syncing."
        }
      ]
    },
    {
      category: "Counseling Sessions",
      items: [
        {
          question: "How do I create a counseling session?",
          answer: "From the main dashboard, click 'New Session' or navigate to Sessions → Create. Fill in the session details, select participants, and optionally connect to Google Calendar."
        },
        {
          question: "What's required to complete a session?",
          answer: "To mark a session as 'Completed', you need at least one note or outcome recorded, and the Meeting Log must have the focus and next session fields filled."
        },
        {
          question: "Can I attach files to sessions?",
          answer: "Yes, you can attach files to sessions, questions, answers, and goals. Supported formats include documents, images, and PDFs."
        }
      ]
    },
    {
      category: "Goals & Tracking",
      items: [
        {
          question: "What is the SMART goal template?",
          answer: "Our goal template includes: Area of Focus, SMART goal text, Knowledge to develop (what/how), Skills to gain (what/how), and Action Plan. This follows mentoring best practices."
        },
        {
          question: "How do I track goal progress?",
          answer: "Goals can be marked as Proposed, In Progress, Completed, or On Hold. Each status change is tracked with version history showing who made changes and when."
        }
      ]
    },
    {
      category: "Reports & Data",
      items: [
        {
          question: "What reports are available?",
          answer: "View mentor workload, student engagement, program oversight, and risk distribution reports. All reports can be filtered by department, program, semester, and date range."
        },
        {
          question: "How do I export data?",
          answer: "Most views have export options (CSV/PDF). Exports include filter headers and data source timestamps for compliance and audit purposes."
        }
      ]
    }
  ];

  const quickStartSteps = [
    {
      title: "1. Set Up Integration",
      description: "Configure your People API connection in Admin → Integrations",
      icon: Users
    },
    {
      title: "2. Sync Your Data", 
      description: "Run a full sync to import mentors and students",
      icon: UserCheck
    },
    {
      title: "3. Create Assignments",
      description: "Link mentors and students in the Assignments page",
      icon: Calendar
    },
    {
      title: "4. Schedule Sessions",
      description: "Create and manage counseling sessions",
      icon: Calendar
    },
    {
      title: "5. Set Goals",
      description: "Work with students to create SMART goals",
      icon: Target
    },
    {
      title: "6. Track Progress",
      description: "Monitor engagement and outcomes in Reports",
      icon: BarChart3
    }
  ];

  const videoTutorials = [
    {
      title: "Getting Started Overview",
      duration: "5:30",
      description: "Complete walkthrough of the mentoring platform"
    },
    {
      title: "Managing Assignments",
      duration: "3:45", 
      description: "How to create and manage mentor-student relationships"
    },
    {
      title: "Conducting Sessions",
      duration: "4:20",
      description: "Best practices for counseling sessions and documentation"
    },
    {
      title: "Goal Setting & Tracking",
      duration: "6:10",
      description: "Using the SMART goal framework effectively"
    }
  ];

  const filteredFAQs = faqItems.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Help Center</h1>
          <p className="text-muted-foreground">
            Get the most out of your mentoring platform with guides, tutorials, and FAQs
          </p>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search help topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="getting-started" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="getting-started">
              <BookOpen className="w-4 h-4 mr-2" />
              Quick Start
            </TabsTrigger>
            <TabsTrigger value="faqs">
              <HelpCircle className="w-4 h-4 mr-2" />
              FAQs
            </TabsTrigger>
            <TabsTrigger value="tutorials">
              <Video className="w-4 h-4 mr-2" />
              Tutorials
            </TabsTrigger>
            <TabsTrigger value="support">
              <ExternalLink className="w-4 h-4 mr-2" />
              Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="getting-started">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Start Guide</CardTitle>
                  <CardDescription>
                    Follow these steps to get your mentoring program up and running
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickStartSteps.map((step, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <step.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium text-sm">{step.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Tour</CardTitle>
                  <CardDescription>
                    Take a guided tour of the key features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full md:w-auto" onClick={() => {
                    // Would trigger the onboarding tour
                    alert('Starting platform tour...');
                  }}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Interactive Tour
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="faqs">
            <div className="space-y-6">
              {filteredFAQs.map((category, categoryIndex) => (
                <Card key={categoryIndex}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <HelpCircle className="w-5 h-5 mr-2" />
                      {category.category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {category.items.map((faq, faqIndex) => (
                        <AccordionItem key={faqIndex} value={`item-${categoryIndex}-${faqIndex}`}>
                          <AccordionTrigger className="text-left">
                            {faq.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {faq.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorials">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videoTutorials.map((video, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <Badge variant="secondary">{video.duration}</Badge>
                    </div>
                    <CardDescription>{video.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      <Play className="w-4 h-4 mr-2" />
                      Watch Tutorial
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>Get help from our support team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Submit Support Ticket
                  </Button>
                  <div className="text-sm text-muted-foreground">
                    <p>Email: support@mentoring.edu</p>
                    <p>Hours: Mon-Fri 9AM-5PM</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                  <CardDescription>Technical documentation and API guides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    <BookOpen className="w-4 h-4 mr-2" />
                    View API Documentation
                  </Button>
                  <Button variant="outline" className="w-full">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Admin Guide
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Help;