import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Download, FileText, Users, Target, AlertTriangle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Navigation from "@/components/Navigation";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import type { DateRange } from "react-day-picker";

// Mock data for charts
const mentorWorkloadData = [
  { name: "Dr. Smith", sessions: 12, completionRate: 92, activeMentees: 8 },
  { name: "Prof. Johnson", sessions: 8, completionRate: 88, activeMentees: 6 },
  { name: "Dr. Brown", sessions: 15, completionRate: 95, activeMentees: 10 },
  { name: "Prof. Davis", sessions: 6, completionRate: 83, activeMentees: 4 },
  { name: "Dr. Wilson", sessions: 10, completionRate: 90, activeMentees: 7 },
];

const studentEngagementData = [
  { program: "Computer Science", attended: 85, goalsCreated: 24, goalsCompleted: 18, openActions: 6 },
  { program: "Engineering", attended: 78, goalsCreated: 20, goalsCompleted: 16, openActions: 4 },
  { program: "Business", attended: 82, goalsCreated: 18, goalsCompleted: 14, openActions: 4 },
  { program: "Medicine", attended: 90, goalsCreated: 28, goalsCompleted: 22, openActions: 6 },
];

const riskDistributionData = [
  { name: "Low Risk", value: 65, color: "#10b981" },
  { name: "Medium Risk", value: 25, color: "#f59e0b" },
  { name: "High Risk", value: 10, color: "#ef4444" },
];

const sessionCoverageData = [
  { cohort: "2024 Batch", coverage: 85, total: 120, covered: 102 },
  { cohort: "2023 Batch", coverage: 92, total: 110, covered: 101 },
  { cohort: "2022 Batch", coverage: 78, total: 95, covered: 74 },
  { cohort: "2021 Batch", coverage: 88, total: 80, covered: 70 },
];

interface ReportFilters {
  department: string;
  program: string;
  semester: string;
  year: string;
  dateRange: DateRange | undefined;
  excludeInactive: boolean;
}

const Reports = () => {
  const [filters, setFilters] = useState<ReportFilters>({
    department: "all",
    program: "all",
    semester: "all",
    year: "2024",
    dateRange: undefined,
    excludeInactive: true,
  });

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
    <div className="flex min-h-screen bg-background">
      <Navigation userRole="admin" />
      
      <div className="flex-1 p-8">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select value={filters.department} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, department: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="cs">Computer Science</SelectItem>
                      <SelectItem value="eng">Engineering</SelectItem>
                      <SelectItem value="bus">Business</SelectItem>
                      <SelectItem value="med">Medicine</SelectItem>
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

              <div className="flex gap-2">
                <Badge variant="secondary">
                  {filters.department !== "all" ? filters.department : "All Departments"}
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
    </div>
  );
};

export default Reports;