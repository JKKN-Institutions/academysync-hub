import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bell, 
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  TrendingDown,
  DollarSign,
  FileText
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Alerts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock alerts data
  const alerts = [
    {
      id: "1",
      type: "attendance",
      title: "Low Attendance Alert",
      message: "Student John Doe has attendance below 75% threshold",
      student: "John Doe",
      priority: "high",
      status: "unread",
      timestamp: "2024-01-14 09:30 AM",
      details: "Current attendance: 68% (Required: 75%)"
    },
    {
      id: "2",
      type: "fees",
      title: "Fee Payment Due",
      message: "Jane Smith has outstanding fee payment of $2,500",
      student: "Jane Smith",
      priority: "high",
      status: "unread",
      timestamp: "2024-01-13 03:00 PM",
      details: "Due date: January 20, 2024"
    },
    {
      id: "3",
      type: "academic",
      title: "Academic Performance Warning",
      message: "Mike Johnson's GPA has dropped below 3.0",
      student: "Mike Johnson",
      priority: "medium",
      status: "read",
      timestamp: "2024-01-12 11:15 AM",
      details: "Current GPA: 2.8 (Warning threshold: 3.0)"
    },
    {
      id: "4",
      type: "service_request",
      title: "Pending Service Request",
      message: "Sarah Wilson has submitted a document verification request",
      student: "Sarah Wilson",
      priority: "low",
      status: "unread",
      timestamp: "2024-01-11 10:00 AM",
      details: "Request submitted 3 days ago"
    },
    {
      id: "5",
      type: "assignment",
      title: "Assignment Deadline Approaching", 
      message: "Research project submission due tomorrow for Alex Brown",
      student: "Alex Brown",
      priority: "medium",
      status: "read",
      timestamp: "2024-01-10 02:30 PM",
      details: "Due: January 15, 2024"
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'attendance':
        return <TrendingDown className="w-4 h-4" />;
      case 'fees':
        return <DollarSign className="w-4 h-4" />;
      case 'academic':
        return <AlertTriangle className="w-4 h-4" />;
      case 'service_request':
        return <FileText className="w-4 h-4" />;
      case 'assignment':
        return <Calendar className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'attendance':
        return 'text-red-600 bg-red-50';
      case 'fees':
        return 'text-orange-600 bg-orange-50';
      case 'academic':
        return 'text-yellow-600 bg-yellow-50';
      case 'service_request':
        return 'text-blue-600 bg-blue-50';
      case 'assignment':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
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

  const getStatusIcon = (status: string) => {
    return status === 'read' ? (
      <CheckCircle className="w-4 h-4 text-green-600" />
    ) : (
      <XCircle className="w-4 h-4 text-red-600" />
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Alerts & Notifications</h1>
          <p className="text-muted-foreground">
            Monitor risk alerts and important notifications
          </p>
        </div>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Mark All Read
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">High Priority</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Unread</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.status === 'unread').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.type === 'attendance').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Fees</p>
                <p className="text-2xl font-bold text-orange-600">
                  {alerts.filter(a => a.type === 'fees').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className={`hover:shadow-md transition-shadow ${alert.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${getAlertColor(alert.type)}`}>
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold">{alert.title}</h3>
                          <Badge variant={getPriorityColor(alert.priority)}>
                            {alert.priority} priority
                          </Badge>
                          {getStatusIcon(alert.status)}
                        </div>
                        <p className="text-muted-foreground">{alert.message}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {alert.student}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {alert.timestamp}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.details}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {alert.status === 'unread' && (
                      <Button variant="outline" size="sm">
                        Mark Read
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="unread">
          <div className="space-y-4">
            {alerts.filter(a => a.status === 'unread').map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.student}</p>
                    </div>
                    <Button size="sm">Mark Read</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="high-priority">
          <div className="space-y-4">
            {alerts.filter(a => a.priority === 'high').map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.student}</p>
                    </div>
                    <Badge variant="destructive">High Priority</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="attendance">
          <div className="space-y-4">
            {alerts.filter(a => a.type === 'attendance').map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="fees">
          <div className="space-y-4">
            {alerts.filter(a => a.type === 'fees').map((alert) => (
              <Card key={alert.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-orange-600" />
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-muted-foreground">{alert.details}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Alerts;