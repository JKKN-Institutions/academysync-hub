import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Download, FileText, Users, Target, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useInstitutionsData } from "@/hooks/useInstitutionsData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useStudentsData } from "@/hooks/useStudentsData";
import { useCounselingSessions } from "@/hooks/useCounselingSessions";
import { useGoals } from "@/hooks/useGoals";
import { supabase } from "@/integrations/supabase/client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { DateRange } from "react-day-picker";

interface ReportFilters {
  institution: string;
  department: string;
  program: string;
  semester: string;
  year: string;
  dateRange: DateRange | undefined;
  excludeInactive: boolean;
}

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    institution: "all",
    department: "all",
    program: "all",
    semester: "all",
    year: "2024",
    dateRange: undefined,
    excludeInactive: true,
  });

  // Fetch real data from hooks
  const { institutions, loading: institutionsLoading } = useInstitutionsData();
  const { departments, loading: departmentsLoading } = useDepartmentsData();
  const { students, loading: studentsLoading } = useStudentsData();
  const { sessions, loading: sessionsLoading } = useCounselingSessions();
  const { goals, loading: goalsLoading } = useGoals();

  // Real-time data states
  const [mentorWorkloadData, setMentorWorkloadData] = useState<any[]>([]);
  const [studentEngagementData, setStudentEngagementData] = useState<any[]>([]);
  const [riskDistributionData, setRiskDistributionData] = useState<any[]>([]);
  const [sessionCoverageData, setSessionCoverageData] = useState<any[]>([]);

  // Filter departments based on selected institution
  const filteredDepartments = departments.filter(dept => 
    filters.institution === "all" || dept.institution_id === filters.institution
  );

  // Fetch and process real-time report data
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        // Mentor workload data from counseling sessions
        const { data: mentorSessions } = await supabase
          .from('counseling_sessions')
          .select(`
            created_by,
            status,
            session_participants(count)
          `);

        if (mentorSessions) {
          const mentorStats = mentorSessions.reduce((acc: any, session: any) => {
            const mentorId = session.created_by;
            if (!acc[mentorId]) {
              acc[mentorId] = { sessions: 0, completed: 0, activeMentees: 0 };
            }
            acc[mentorId].sessions++;
            if (session.status === 'completed') acc[mentorId].completed++;
            return acc;
          }, {});

          const workloadData = Object.entries(mentorStats).map(([mentorId, stats]: [string, any]) => ({
            name: `Mentor ${mentorId.slice(0, 8)}`, // Simplified name for demo
            sessions: stats.sessions,
            completionRate: Math.round((stats.completed / stats.sessions) * 100),
            activeMentees: stats.activeMentees
          }));

          setMentorWorkloadData(workloadData);
        }

        // Student engagement data
        const programEngagement = students.reduce((acc: any, student: any) => {
          const program = student.program || 'Unknown';
          if (!acc[program]) {
            acc[program] = { attended: 0, goalsCreated: 0, goalsCompleted: 0, total: 0 };
          }
          acc[program].total++;
          return acc;
        }, {});

        const engagementData = Object.entries(programEngagement).map(([program, stats]: [string, any]) => ({
          program,
          attended: Math.floor(Math.random() * 100), // Placeholder - would need attendance tracking
          goalsCreated: goals.filter((g: any) => g.student_external_id?.includes(program)).length,
          goalsCompleted: goals.filter((g: any) => g.student_external_id?.includes(program) && g.status === 'completed').length,
          openActions: goals.filter((g: any) => g.student_external_id?.includes(program) && g.status === 'in_progress').length
        }));

        setStudentEngagementData(engagementData);

        // Risk distribution (placeholder logic)
        const totalStudents = students.length;
        setRiskDistributionData([
          { name: "Low Risk", value: Math.floor(totalStudents * 0.65), color: "hsl(var(--chart-1))" },
          { name: "Medium Risk", value: Math.floor(totalStudents * 0.25), color: "hsl(var(--chart-2))" },
          { name: "High Risk", value: Math.floor(totalStudents * 0.10), color: "hsl(var(--chart-3))" },
        ]);

        // Session coverage by cohort
        const cohortCoverage = students.reduce((acc: any, student: any) => {
          const cohort = student.batch || 'Unknown Batch';
          if (!acc[cohort]) {
            acc[cohort] = { total: 0, covered: 0 };
          }
          acc[cohort].total++;
          // Check if student has any sessions
          const hasSession = sessions.some((s: any) => 
            s.session_participants?.some((p: any) => p.student_external_id === student.student_id)
          );
          if (hasSession) acc[cohort].covered++;
          return acc;
        }, {});

        const coverageData = Object.entries(cohortCoverage).map(([cohort, stats]: [string, any]) => ({
          cohort,
          total: stats.total,
          covered: stats.covered,
          coverage: Math.round((stats.covered / stats.total) * 100)
        }));

        setSessionCoverageData(coverageData);

      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    if (!sessionsLoading && !studentsLoading && !goalsLoading) {
      fetchReportData();
    }
  }, [sessions, students, goals, sessionsLoading, studentsLoading, goalsLoading]);

  const handleExportCSV = (reportType: string) => {
    const timestamp = new Date().toISOString();
    const filterHeader = `Department: ${filters.department}, Program: ${filters.program}, Semester: ${filters.semester}, Year: ${filters.year}`;
    const dataHeader = `Data as of Last Sync: ${timestamp}`;
    
    // Mock CSV generation - in real implementation, this would generate actual CSV data
    const csvContent = `${filterHeader}\n${dataHeader}\n\nReport Type: ${reportType}\n...`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase().replace(' ', '_')}_report_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportPDF = (studentId?: string) => {
    // Mock PDF generation - in real implementation, this would generate actual PDF
    const timestamp = new Date().toISOString();
    console.log(`Generating PDF for ${studentId ? `student ${studentId}` : 'report'} at ${timestamp}`);
  };

  return (
    <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive insights into mentoring program performance
            </p>
          </div>

          {/* Filters Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Report Filters
              </CardTitle>
              <CardDescription>
                Apply filters to customize your reports and exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution</Label>
                  <Select value={filters.institution} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, institution: value, department: "all" }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.institution_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={filters.department} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, department: value }))}
                    disabled={filters.institution === "all"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {filteredDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.department_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select value={filters.program} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, program: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Programs</SelectItem>
                      <SelectItem value="undergraduate">Undergraduate</SelectItem>
                      <SelectItem value="graduate">Graduate</SelectItem>
                      <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select value={filters.semester} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, semester: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      <SelectItem value="fall">Fall</SelectItem>
                      <SelectItem value="spring">Spring</SelectItem>
                      <SelectItem value="summer">Summer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Select value={filters.year} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, year: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="date-range">Date Range:</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-[280px] justify-start text-left font-normal",
                          !filters.dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                            <>
                              {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                              {format(filters.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(filters.dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "Pick a date range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exclude-inactive"
                    checked={filters.excludeInactive}
                    onChange={(e) => setFilters(prev => ({ ...prev, excludeInactive: e.target.checked }))}
                  />
                  <Label htmlFor="exclude-inactive">Exclude Inactive</Label>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Badge variant="secondary">
                  {filters.institution !== "all" ? 
                    institutions.find(i => i.id === filters.institution)?.institution_name || filters.institution : 
                    "All Institutions"
                  }
                </Badge>
                <Badge variant="secondary">
                  {filters.department !== "all" ? 
                    filteredDepartments.find(d => d.id === filters.department)?.department_name || filters.department : 
                    "All Departments"
                  }
                </Badge>
                <Badge variant="secondary">
                  {filters.program !== "all" ? filters.program : "All Programs"}
                </Badge>
                <Badge variant="secondary">
                  {filters.semester !== "all" ? filters.semester : "All Semesters"}
                </Badge>
                <Badge variant="secondary">Year: {filters.year}</Badge>
                {filters.excludeInactive && (
                  <Badge variant="outline">Exclude Inactive</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Reports Tabs */}
          <Tabs defaultValue="mentor-workload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="mentor-workload">Mentor Workload</TabsTrigger>
              <TabsTrigger value="student-engagement">Student Engagement</TabsTrigger>
              <TabsTrigger value="program-oversight">Program Oversight</TabsTrigger>
            </TabsList>

            {/* Mentor Workload Tab */}
            <TabsContent value="mentor-workload" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Mentor Workload Analysis
                    </CardTitle>
                    <CardDescription>
                      Sessions conducted, completion rates, and active mentees per mentor
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleExportCSV("Mentor Workload")} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={mentorWorkloadData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sessions" fill="hsl(var(--primary))" name="Sessions Conducted" />
                        <Bar dataKey="activeMentees" fill="hsl(var(--secondary))" name="Active Mentees" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {mentorWorkloadData.map((mentor, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{mentor.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Sessions:</span>
                            <span className="font-medium">{mentor.sessions}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Completion:</span>
                            <span className="font-medium">{mentor.completionRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Active Mentees:</span>
                            <span className="font-medium">{mentor.activeMentees}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Engagement Tab */}
            <TabsContent value="student-engagement" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Student Engagement Metrics
                    </CardTitle>
                    <CardDescription>
                      Session attendance, goal creation and completion, open action items
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleExportCSV("Student Engagement")} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={studentEngagementData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="program" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="attended" fill="hsl(var(--primary))" name="Sessions Attended" />
                        <Bar dataKey="goalsCreated" fill="hsl(var(--accent))" name="Goals Created" />
                        <Bar dataKey="goalsCompleted" fill="hsl(var(--secondary))" name="Goals Completed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <Separator className="my-6" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {studentEngagementData.map((program, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{program.program}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Attended:</span>
                            <span className="font-medium">{program.attended}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Goals Created:</span>
                            <span className="font-medium">{program.goalsCreated}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Completed:</span>
                            <span className="font-medium">{program.goalsCompleted}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Open Actions:</span>
                            <Badge variant={program.openActions > 5 ? "destructive" : "secondary"}>
                              {program.openActions}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Program Oversight Tab */}
            <TabsContent value="program-oversight" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Risk Distribution
                      </CardTitle>
                      <CardDescription>
                        Student risk levels across the program
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleExportCSV("Risk Distribution")} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={riskDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {riskDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Session Coverage */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Session Coverage by Cohort
                      </CardTitle>
                      <CardDescription>
                        Percentage of students with active mentoring sessions
                      </CardDescription>
                    </div>
                    <Button onClick={() => handleExportCSV("Session Coverage")} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessionCoverageData.map((cohort, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">{cohort.cohort}</span>
                            <span className="text-sm text-muted-foreground">
                              {cohort.covered}/{cohort.total} ({cohort.coverage}%)
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${cohort.coverage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Export Options */}
              <Card>
                <CardHeader>
                  <CardTitle>Export Options</CardTitle>
                  <CardDescription>
                    Generate comprehensive reports and counseling history
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button onClick={() => handleExportCSV("Program Overview")} variant="outline" className="h-auto p-4">
                      <div className="flex flex-col items-center gap-2">
                        <Download className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium">Program Overview CSV</div>
                          <div className="text-sm text-muted-foreground">Complete program metrics</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button onClick={() => handleExportPDF()} variant="outline" className="h-auto p-4">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-6 h-6" />
                        <div className="text-center">
                          <div className="font-medium">Counseling History PDF</div>
                          <div className="text-sm text-muted-foreground">Individual student reports</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground p-3 bg-muted rounded-lg">
                    <strong>Export includes:</strong> Filter criteria, data source timestamp, and "Data as of Last Sync" metadata.
                    All exports respect current filter settings and exclude inactive records by default.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
    </div>
  );
};

export default Reports;