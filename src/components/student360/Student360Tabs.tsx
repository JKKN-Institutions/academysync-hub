import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
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
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Bus,
  CalendarClock
} from "lucide-react";
import type { Student360Data } from "@/services/student360Api";

interface Student360TabsProps {
  student: Student360Data;
  isDemo?: boolean;
}

export const Student360Tabs: React.FC<Student360TabsProps> = ({
  student,
  isDemo = false
}) => {
  const DataSourceBanner = () => (
    <div className="flex items-center justify-between mb-4 p-3 bg-muted rounded-lg">
      <div className="flex items-center text-sm text-muted-foreground">
        <ExternalLink className="w-4 h-4 mr-2" />
        Data source: {isDemo ? "Demo Data" : "MyJKKN Student Information System"}
        <Clock className="w-4 h-4 ml-4 mr-1" />
        Last sync: {new Date().toLocaleString()}
      </div>
      {!isDemo && (
        <Button variant="outline" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          View in Source
        </Button>
      )}
    </div>
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'graded':
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
      case 'fail':
      case 'overdue':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
      case 'submitted':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'graded':
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
      case 'fail':
      case 'overdue':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
      case 'submitted':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <DataSourceBanner />

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
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
          <TabsTrigger value="transport">
            <Bus className="w-4 h-4 mr-2" />
            Transport
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
              <CardDescription>Personal and academic information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Picture and Basic Info */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-primary/10">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-semibold">{student.name}</h3>
                    <p className="text-muted-foreground">{student.rollNo}</p>
                    <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-muted-foreground border-b pb-2">Personal Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Phone:</span>
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Institution:</span>
                      <span className="text-sm">{student.institution}</span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-muted-foreground border-b pb-2">Academic Information</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium">Program:</span>
                      <p className="text-sm text-muted-foreground">{student.program}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Department:</span>
                      <p className="text-sm text-muted-foreground">{student.department}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Degree:</span>
                      <p className="text-sm text-muted-foreground">{student.degree}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="text-sm font-medium">Year:</span>
                        <p className="text-sm text-muted-foreground">{student.year}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Semester:</span>
                        <p className="text-sm text-muted-foreground">{student.semester}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Section:</span>
                        <p className="text-sm text-muted-foreground">{student.section}</p>
                      </div>
                    </div>
                    
                    {/* Academic Dates */}
                    <div className="space-y-3 pt-4 border-t">
                      <h5 className="text-sm font-semibold text-muted-foreground">Academic Timeline</h5>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <CalendarClock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Join Date:</span>
                          <span className="text-sm">{new Date(student.academic_dates.join_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-3">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Expected Completion:</span>
                          <span className="text-sm">{new Date(student.academic_dates.expected_completion_date).toLocaleDateString()}</span>
                        </div>
                        {student.academic_dates.actual_completion_date && (
                          <div className="flex items-center space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium">Completed:</span>
                            <span className="text-sm">{new Date(student.academic_dates.actual_completion_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Course Duration:</span>
                          <span className="text-sm">{student.academic_dates.course_duration_years} years</span>
                        </div>
                      </div>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-3xl font-bold text-green-600">{student.attendance.percentage}%</div>
                    <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    <Progress value={student.attendance.percentage} className="mt-2" />
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-3xl font-bold text-blue-600">{student.attendance.attended_classes}</div>
                    <p className="text-sm text-muted-foreground">Classes Attended</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                    <div className="text-3xl font-bold text-red-600">
                      {student.attendance.total_classes - student.attendance.attended_classes}
                    </div>
                    <p className="text-sm text-muted-foreground">Classes Missed</p>
                  </div>
                </div>

                {/* Subject-wise Attendance */}
                {student.attendance.subject_wise.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-4">Subject-wise Attendance</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Total Classes</TableHead>
                          <TableHead>Attended</TableHead>
                          <TableHead>Percentage</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {student.attendance.subject_wise.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subject.subject}</TableCell>
                            <TableCell>{subject.total}</TableCell>
                            <TableCell>{subject.attended}</TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Progress value={subject.percentage} className="w-16 h-2" />
                                <span className="text-sm font-medium">{subject.percentage}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={subject.percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {subject.percentage >= 75 ? 'Good' : 'Low'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leave">
          <Card>
            <CardHeader>
              <CardTitle>Leave & On-Duty Records</CardTitle>
              <CardDescription>Leave applications and on-duty approvals</CardDescription>
            </CardHeader>
            <CardContent>
              {student.leave_records.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approved By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.leave_records.map((leave) => (
                      <TableRow key={leave.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {leave.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{leave.days} days</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{leave.reason}</TableCell>
                        <TableCell>{new Date(leave.applied_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(leave.status)}
                            <Badge className={getStatusColor(leave.status)}>
                              {leave.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{leave.approved_by || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leave records found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
              <CardDescription>Current and past assignment submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {student.assignments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Feedback</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{assignment.title}</TableCell>
                        <TableCell>{assignment.subject}</TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(assignment.due_date).toLocaleDateString()}</p>
                            {assignment.submitted_date && (
                              <p className="text-sm text-muted-foreground">
                                Submitted: {new Date(assignment.submitted_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(assignment.status)}
                            <Badge className={getStatusColor(assignment.status)}>
                              {assignment.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.marks !== undefined ? (
                            <div>
                              <span className="font-medium">{assignment.marks}/{assignment.max_marks}</span>
                              <div className="w-16 mt-1">
                                <Progress value={(assignment.marks / (assignment.max_marks || 100)) * 100} />
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {assignment.feedback ? (
                            <p className="text-sm truncate" title={assignment.feedback}>
                              {assignment.feedback}
                            </p>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No assignments found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-6">
            {student.results.length > 0 ? (
              student.results.map((result) => (
                <Card key={result.id}>
                  <CardHeader>
                    <CardTitle>{result.semester} {result.year} Results</CardTitle>
                    <div className="flex gap-4">
                      <Badge variant="outline">SGPA: {result.sgpa}</Badge>
                      <Badge variant="outline">CGPA: {result.cgpa}</Badge>
                      <Badge variant="outline">Percentage: {result.percentage}%</Badge>
                      <Badge className={result.status === 'pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {result.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Subject</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead>Internal</TableHead>
                          <TableHead>External</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Credits</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {result.subjects.map((subject, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{subject.subject_name}</TableCell>
                            <TableCell>{subject.subject_code}</TableCell>
                            <TableCell>{subject.internal_marks}</TableCell>
                            <TableCell>{subject.external_marks}</TableCell>
                            <TableCell>
                              <div>
                                <span className="font-medium">{subject.total_marks}/{subject.max_marks}</span>
                                <div className="w-16 mt-1">
                                  <Progress value={(subject.total_marks / subject.max_marks) * 100} />
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{subject.grade}</Badge>
                            </TableCell>
                            <TableCell>{subject.credits}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Service Requests</CardTitle>
              <CardDescription>Student service requests and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {student.requests.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {student.requests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {request.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{request.title}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate" title={request.description}>
                            {request.description}
                          </p>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p>{new Date(request.submitted_date).toLocaleDateString()}</p>
                            {request.completed_date && (
                              <p className="text-sm text-muted-foreground">
                                Completed: {new Date(request.completed_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              request.priority === 'high' ? 'bg-red-100 text-red-700' :
                              request.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }
                          >
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <Badge className={getStatusColor(request.status)}>
                              {request.status}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No service requests found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <div className="space-y-6">
            {/* Fee Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Fee Overview</CardTitle>
                <CardDescription>Current fee status and payment summary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-2xl font-bold text-blue-600">₹{student.fees.total_fees.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Fees</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-2xl font-bold text-green-600">₹{student.fees.paid_amount.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                    <div className="text-2xl font-bold text-red-600">₹{student.fees.pending_amount.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Pending Amount</p>
                    {student.fees.due_date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(student.fees.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Fee Payment Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Payment Progress</span>
                    <span>{((student.fees.paid_amount / student.fees.total_fees) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(student.fees.paid_amount / student.fees.total_fees) * 100} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Fee Structure */}
            {student.fees.fee_structure.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Fee Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.fees.fee_structure.map((fee, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{fee.category}</TableCell>
                          <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                          <TableCell>₹{fee.paid.toLocaleString()}</TableCell>
                          <TableCell>₹{fee.pending.toLocaleString()}</TableCell>
                          <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Badge className={fee.pending === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {fee.pending === 0 ? 'Paid' : 'Pending'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Payment History */}
            {student.fees.payment_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Receipt No</TableHead>
                        <TableHead>Payment Method</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.fees.payment_history.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(payment.payment_date).toLocaleDateString()}</TableCell>
                          <TableCell>{payment.receipt_no}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{payment.payment_method}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="transport">
          <div className="space-y-6">
            {/* Transport Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Transport Fee Overview</CardTitle>
                <CardDescription>Bus transportation fees and payment status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100">
                    <div className="text-2xl font-bold text-blue-600">₹{student.bus_payments.total_bus_fees.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Bus Fees</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-green-50 to-green-100">
                    <div className="text-2xl font-bold text-green-600">₹{student.bus_payments.paid_amount.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Paid Amount</p>
                  </div>
                  <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-red-50 to-red-100">
                    <div className="text-2xl font-bold text-red-600">₹{student.bus_payments.pending_amount.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Pending Amount</p>
                  </div>
                </div>

                {/* Transport Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-muted-foreground border-b pb-2">Route Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Bus className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Route:</span>
                        <span className="text-sm">{student.bus_payments.route}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Stop:</span>
                        <span className="text-sm">{student.bus_payments.stop_name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Monthly Fee:</span>
                        <span className="text-sm">₹{student.bus_payments.monthly_fee.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-muted-foreground border-b pb-2">Payment Progress</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{((student.bus_payments.paid_amount / student.bus_payments.total_bus_fees) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(student.bus_payments.paid_amount / student.bus_payments.total_bus_fees) * 100} className="h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transport Payment History */}
            {student.bus_payments.payment_history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Transport Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Month</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Receipt No</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.bus_payments.payment_history.map((payment, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{payment.month}</TableCell>
                          <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            {payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{payment.receipt_no || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(payment.status)}
                              <Badge className={getStatusColor(payment.status)}>
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};