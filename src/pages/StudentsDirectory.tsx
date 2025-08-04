
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Clock, ExternalLink, Filter, GraduationCap } from "lucide-react";
import { useState } from "react";

const StudentsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - would come from People API
  const students = [
    {
      id: "ext_101",
      name: "Alex Chen",
      program: "Computer Science - MS",
      year: "2nd Year",
      email: "alex.chen@student.university.edu",
      interests: ["Machine Learning", "Web Development", "Data Analysis"],
      gpa: "3.85",
      mentorAssigned: true,
      mentorName: "Dr. Sarah Johnson",
      lastSync: "2024-01-04 09:15:00",
      status: "Active"
    },
    {
      id: "ext_102",
      name: "Maria Rodriguez", 
      program: "Engineering - BS",
      year: "3rd Year",
      email: "maria.rodriguez@student.university.edu",
      interests: ["Systems Design", "Project Management", "Innovation"],
      gpa: "3.92",
      mentorAssigned: false,
      mentorName: null,
      lastSync: "2024-01-04 09:15:00",
      status: "Active"
    }
  ];

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Directory</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Browse student profiles and academic information</p>
            <div className="flex items-center text-sm text-gray-500">
              <ExternalLink className="w-4 h-4 mr-1" />
              Data source: People API
              <Clock className="w-4 h-4 ml-4 mr-1" />
              Last Sync: Today 09:15 AM
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, program, or interests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/placeholder-avatar-${student.id}.jpg`} />
                    <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{student.name}</CardTitle>
                    <CardDescription>{student.program}</CardDescription>
                    <div className="flex items-center mt-1">
                      <GraduationCap className="w-3 h-3 mr-1 text-gray-400" />
                      <span className="text-xs text-gray-500">{student.year}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        ID: {student.id}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Contact</p>
                    <p className="text-sm text-gray-600 truncate">{student.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Academic Standing</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">GPA: <span className="font-medium text-blue-600">{student.gpa}</span></span>
                      <Badge variant={student.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Interests</p>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Mentor Assignment</p>
                    {student.mentorAssigned ? (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm text-green-700">{student.mentorName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                        <span className="text-sm text-yellow-700">Unassigned</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-2">
                    <div className="flex items-center">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      People API • Last sync: {new Date(student.lastSync).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No students found matching your search criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentsDirectory;
