import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Plus, 
  Search, 
  Filter,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Send
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const QnA = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [newQuestion, setNewQuestion] = useState("");

  // Mock Q&A data
  const qnaItems = [
    {
      id: "1",
      question: "How do I prepare for upcoming placement interviews?",
      answer: "Start by researching the companies you're interested in, practice common interview questions, and work on your technical skills. I recommend using platforms like LeetCode for coding practice.",
      student: "John Doe",
      mentor: "Dr. Smith",
      sessionId: "session-1",
      status: "answered",
      priority: "high",
      timestamp: "2024-01-14 10:30 AM",
      category: "Career"
    },
    {
      id: "2",
      question: "What courses should I take next semester to strengthen my profile?",
      answer: "",
      student: "Jane Smith",
      mentor: "Prof. Williams",
      sessionId: null,
      status: "pending",
      priority: "medium", 
      timestamp: "2024-01-13 2:15 PM",
      category: "Academic"
    },
    {
      id: "3",
      question: "How can I improve my communication skills for presentations?",
      answer: "Practice regularly, join the debate club, and consider taking a public speaking course. Record yourself presenting and analyze areas for improvement.",
      student: "Mike Johnson",
      mentor: "Dr. Brown",
      sessionId: "session-2",
      status: "answered",
      priority: "medium",
      timestamp: "2024-01-12 4:00 PM",
      category: "Personal Development"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const handleSubmitQuestion = () => {
    if (newQuestion.trim()) {
      // Handle question submission
      console.log('Submitting question:', newQuestion);
      setNewQuestion("");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Q&A Management</h1>
          <p className="text-muted-foreground">
            Manage questions and answers for counseling sessions
          </p>
        </div>
        {user?.role === 'mentee' && (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Ask Question
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Questions</p>
                <p className="text-2xl font-bold text-blue-600">{qnaItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Answered</p>
                <p className="text-2xl font-bold text-green-600">
                  {qnaItems.filter(q => q.status === 'answered').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {qnaItems.filter(q => q.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold text-purple-600">7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ask New Question (for mentees) */}
      {user?.role === 'mentee' && (
        <Card>
          <CardHeader>
            <CardTitle>Ask a Question</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Type your question here..."
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end">
              <Button onClick={handleSubmitQuestion}>
                <Send className="w-4 h-4 mr-2" />
                Submit Question
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search questions and answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Q&A List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Q&A</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="answered">Answered</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {qnaItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={getStatusColor(item.status)}>
                        {getStatusIcon(item.status)}
                        <span className="ml-1">{item.status}</span>
                      </Badge>
                      <Badge variant={getPriorityColor(item.priority)}>
                        {item.priority} priority
                      </Badge>
                      <Badge variant="outline">{item.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold">{item.question}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {item.student.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span>{item.student}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {item.status === 'pending' ? 'Answer' : 'Edit Answer'}
                  </Button>
                </div>
              </CardHeader>
              
              {item.answer && (
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="w-4 h-4" />
                      Answer by {item.mentor}:
                    </div>
                    <p className="text-muted-foreground bg-muted p-3 rounded-lg">
                      {item.answer}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="pending">
          <div className="space-y-4">
            {qnaItems.filter(q => q.status === 'pending').map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{item.question}</h3>
                      <p className="text-sm text-muted-foreground">Asked by {item.student}</p>
                    </div>
                    <Button size="sm">
                      Answer
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="answered">
          <div className="space-y-4">
            {qnaItems.filter(q => q.status === 'answered').map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <p className="text-sm text-muted-foreground">
                    Asked by {item.student} • Answered by {item.mentor}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QnA;