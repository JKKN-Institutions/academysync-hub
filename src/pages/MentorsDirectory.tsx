import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Filter, UserCheck, Calendar } from "lucide-react";
import { useState } from "react";
import { getDemoMentors } from "@/data/demoData";
import { useDemoMode } from "@/hooks/useDemoMode";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { EtiquetteTip } from "@/components/ui/etiquette-tip";
import { CardSkeleton } from "@/components/ui/loading-skeleton";

const MentorsDirectory = () => {
  const { isDemoMode } = useDemoMode();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Use demo data if demo mode is enabled, otherwise use empty array (would be replaced with API call)
  const mentors = isDemoMode ? getDemoMentors() : [];

  const filteredMentors = mentors.filter(mentor =>
    mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleRetrySync = () => {
    setSyncError(null);
    // Would trigger actual sync in real implementation
  };

  const handleSearch = () => {
    setLoading(true);
    // Simulate search delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner */}
        <DemoModeBanner />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mentors Directory</h1>
          <p className="text-gray-600">
            {isDemoMode 
              ? "Browse demo mentors with safe training data"
              : "Browse mentors from the People Directory API"
            }
          </p>
        </div>

        {/* Etiquette Tip */}
        <div className="mb-6">
          <EtiquetteTip type="respect-time" />
        </div>

        {/* Sync Error Banner */}
        {syncError && (
          <div className="mb-6">
            <ErrorState 
              message={`Sync failed: ${syncError}`}
              onRetry={handleRetrySync}
            />
          </div>
        )}

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={isDemoMode ? "Search demo mentors..." : "Search mentors..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                {loading ? "Searching..." : "Search"}
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mentors Grid */}
        {loading ? (
          <CardSkeleton count={6} />
        ) : error ? (
          <ErrorState 
            message={error}
            onRetry={() => setError(null)}
          />
        ) : filteredMentors.length === 0 ? (
          <EmptyState
            icon={Users}
            title={isDemoMode ? "No demo mentors found" : "No mentors found"}
            description={
              searchTerm 
                ? `No mentors match "${searchTerm}". Try adjusting your search.`
                : isDemoMode 
                  ? "Demo mode is active but no demo mentors are available."
                  : "No mentors have been synced from the People API yet."
            }
            action={{
              label: searchTerm ? "Clear search" : "Sync Directory",
              onClick: () => searchTerm ? setSearchTerm("") : handleRetrySync()
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.avatar} alt={mentor.name} />
                      <AvatarFallback>
                        {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{mentor.name}</CardTitle>
                      <CardDescription>{mentor.department}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Expertise</p>
                      <div className="flex flex-wrap gap-1">
                        {mentor.expertise.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-600">Active Assignments</p>
                        <p className="text-lg font-bold text-blue-600">{mentor.activeAssignments}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-600">Sessions</p>
                        <p className="text-lg font-bold text-green-600">{mentor.totalSessions}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                        {mentor.status}
                      </Badge>
                      {isDemoMode && (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          Demo Data
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      {isDemoMode ? (
                        <div className="flex items-center">
                          <UserCheck className="w-3 h-3 mr-1" />
                          ID: {mentor.staffId}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Last sync: Never
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" className="flex-1">
                        <UserCheck className="w-4 h-4 mr-1" />
                        Assign Students
                      </Button>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorsDirectory;