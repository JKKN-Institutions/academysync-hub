import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Clock, 
  ExternalLink, 
  GraduationCap, 
  Calendar, 
  FileText, 
  TrendingUp, 
  HelpCircle, 
  DollarSign,
  User,
  AlertCircle
} from "lucide-react";
import { useParams } from "react-router-dom";

const Student360 = () => {
  const { studentId } = useParams();
  
  // Mock student data - would come from People API
  const student = {
    id: "ext_101",
    name: "Alex Chen",
    rollNo: "CS2023001", 
    program: "Computer Science - MS",
    year: "2nd Year",
    semester: "Fall 2024",
    email: "alex.chen@student.university.edu",
    phone: "+1-555-0123",
    address: "123 Campus Drive, University City",
    advisor: "Dr. Sarah Johnson",
    lastSync: "2024-01-04T09:15:00Z"
  };

  const DataSourceBanner = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
      <div className="flex items-center text-sm text-muted-foreground">
        <ExternalLink className="w-4 h-4 mr-2" />
        Data source: Student Information System
        <Clock className="w-4 h-4 ml-4 mr-1" />
        Last sync: {new Date(student.lastSync).toLocaleString()}
      </div>
      <Button variant="outline" size="sm">
        <ExternalLink className="w-4 h-4 mr-2" />
        View in Source
      </Button>
    </div>
  );

  const ComingSoonPlaceholder = ({ title, description }: { title: string; description: string }) => (
    <Card className="text-center py-12">
      <CardContent>
        <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{description}</p>
        <Button variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          View in Source System
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={`/placeholder-avatar-${student.id}.jpg`} />
              <AvatarFallback className="text-lg">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold">{student.name}</h1>
              <p className="text-muted-foreground">Roll No: {student.rollNo}</p>
              <div className="flex items-center mt-2 space-x-4">
                <Badge variant="outline">
                  <GraduationCap className="w-3 h-3 mr-1" />
                  {student.program}
                </Badge>
                <Badge variant="secondary">{student.year}</Badge>
              </div>
            </div>
          </div>
          
          <DataSourceBanner>
            Student 360 provides a comprehensive view of student data from various systems.
          </DataSourceBanner>
        </div>

        {/* Student 360 Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Calendar className="w-4 h-4 mr-2" />
              Attendance
            </TabsTrigger>
            <TabsTrigger value="leave">
              <FileText className="w-4 h-4 mr-2" />
              Leave/OD
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <FileText className="w-4 h-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="results">
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger value="requests">
              <HelpCircle className="w-4 h-4 mr-2" />
              Requests
            </TabsTrigger>
            <TabsTrigger value="fees">
              <DollarSign className="w-4 h-4 mr-2" />
              Fees
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Student Profile</CardTitle>
                <CardDescription>Personal and academic information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Personal Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {student.email}</p>
                        <p><span className="font-medium">Phone:</span> {student.phone}</p>
                        <p><span className="font-medium">Address:</span> {student.address}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium text-sm text-muted-foreground mb-1">Academic Information</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium">Program:</span> {student.program}</p>
                        <p><span className="font-medium">Current Year:</span> {student.year}</p>
                        <p><span className="font-medium">Semester:</span> {student.semester}</p>
                        <p><span className="font-medium">Academic Advisor:</span> {student.advisor}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Current semester attendance summary</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">85%</div>
                      <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">42</div>
                      <p className="text-sm text-muted-foreground">Classes Attended</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">7</div>
                      <p className="text-sm text-muted-foreground">Classes Missed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ComingSoonPlaceholder
                title="Detailed Attendance Records"
                description="Course-wise attendance breakdown and monthly trends will be available once the attendance system connector is configured."
              />
            </div>
          </TabsContent>

          <TabsContent value="leave">
            <ComingSoonPlaceholder
              title="Leave & On-Duty Records"
              description="Leave applications and on-duty approvals will be displayed once the leave management system is connected."
            />
          </TabsContent>

          <TabsContent value="assignments">
            <ComingSoonPlaceholder
              title="Assignment Status"
              description="Current and past assignment submissions with due dates will be available once the assignment management system is integrated."
            />
          </TabsContent>

          <TabsContent value="results">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  <CardDescription>Semester-wise results and GPA</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">3.85</div>
                      <p className="text-sm text-muted-foreground">Current CGPA</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">3.92</div>
                      <p className="text-sm text-muted-foreground">Previous Semester GPA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <ComingSoonPlaceholder
                title="Detailed Academic Results"
                description="Course-wise marks, grades, and semester reports will be available once the examination management system is connected."
              />
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <ComingSoonPlaceholder
              title="Service Requests"
              description="Student service requests and their status will be displayed once the service request system is integrated."
            />
          </TabsContent>

          <TabsContent value="fees">
            <ComingSoonPlaceholder
              title="Fee Schedule & Payments"
              description="Fee structure, due dates, and payment history will be available once the fee management system is connected."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Student360;