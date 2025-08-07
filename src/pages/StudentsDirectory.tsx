import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Users, RefreshCw, Settings } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStudentsData } from "@/hooks/useStudentsData";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

const StudentsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { students, loading, error, refetch, isDemo } = useStudentsData();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.interests && student.interests.some(interest => 
      interest.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemo && <DemoModeBanner />}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Directory</h1>
            <p className="text-gray-600">Loading students...</p>
          </div>
          <CardSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (error && !isDemo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <ErrorState 
              title="Failed to Load Students"
              message={error}
              onRetry={refetch}
              retryLabel="Try Again"
            />
            <div className="flex justify-center">
              <Button onClick={() => navigate('/admin')} variant="default">
                <Settings className="h-4 w-4 mr-2" />
                Configure API
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <DemoModeBanner />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Directory</h1>
          <p className="text-gray-600">
            {isDemo 
              ? "Browse demo students with safe training data"
              : "Browse students from the myjkkn API"
            }
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={isDemo ? "Search demo students..." : "Search students..."}
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
              {!isDemo && (
                <Button onClick={refetch} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {isDemo ? "No demo students found" : "No students found"}
                </p>
                <p className="text-gray-400 mt-2">
                  {searchTerm 
                    ? `No students match "${searchTerm}". Try adjusting your search.`
                    : isDemo 
                      ? "Demo mode is active but no demo students are available."
                      : "No students have been synced from the myjkkn API yet. Please check your API configuration."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/student/${student.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>
                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{student.program} • Year {student.semesterYear}</CardDescription>
                      {isDemo && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                          Demo Data
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Contact</p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Academic Standing</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">GPA: <span className="font-medium text-blue-600">{student.gpa}</span></span>
                        <Badge variant={student.status === "active" ? "default" : "secondary"} className="text-xs">
                          {student.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {student.interests && student.interests.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-2">Interests</p>
                        <div className="flex flex-wrap gap-1">
                          {student.interests.map((interest: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-2">
                      <p className="text-sm font-medium text-gray-600 mb-1">Mentor Assignment</p>
                      {student.mentor ? (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm text-green-700">{student.mentor}</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-sm text-yellow-700">Unassigned</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 border-t pt-2">
                      <span>ID: {student.rollNo}</span>
                      {isDemo && <span className="ml-2">• Demo Data</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentsDirectory;