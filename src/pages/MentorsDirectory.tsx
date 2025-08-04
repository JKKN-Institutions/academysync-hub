
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Clock, ExternalLink, Filter } from "lucide-react";
import { useState } from "react";

const MentorsDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - would come from People API
  const mentors = [
    {
      id: "ext_001",
      name: "Dr. Sarah Johnson",
      department: "Computer Science",
      email: "sarah.johnson@university.edu",
      expertise: ["Machine Learning", "Data Science", "Research Methods"],
      activeAssignments: 12,
      lastSync: "2024-01-04 09:15:00",
      status: "Active"
    },
    {
      id: "ext_002", 
      name: "Prof. Michael Chen",
      department: "Engineering",
      email: "michael.chen@university.edu",
      expertise: ["Software Engineering", "Systems Design", "Project Management"],
      activeAssignments: 8,
      lastSync: "2024-01-04 09:15:00",
      status: "Active"
    }
  ];

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentors Directory</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Browse available mentors and their expertise</p>
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
                    placeholder="Search by name, department, or expertise..."
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

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMentors.map((mentor) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`/placeholder-avatar-${mentor.id}.jpg`} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{mentor.name}</CardTitle>
                    <CardDescription>{mentor.department}</CardDescription>
                    <Badge variant="outline" className="mt-1 text-xs">
                      ID: {mentor.id}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Contact</p>
                    <p className="text-sm text-gray-600">{mentor.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Expertise</p>
                    <div className="flex flex-wrap gap-1">
                      {mentor.expertise.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <div className="text-sm">
                      <span className="font-medium text-blue-600">{mentor.activeAssignments}</span>
                      <span className="text-gray-600"> active mentees</span>
                    </div>
                    <Badge variant={mentor.status === "Active" ? "default" : "secondary"}>
                      {mentor.status}
                    </Badge>
                  </div>

                  <div className="text-xs text-gray-500 border-t pt-2">
                    <div className="flex items-center">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      People API • Last sync: {new Date(mentor.lastSync).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMentors.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-500 text-lg">No mentors found matching your search criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your search terms or filters.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MentorsDirectory;
