import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Users, Settings } from "lucide-react";
import { useStudent360Data } from "@/hooks/useStudent360Data";
import { StudentFilters } from "@/components/student360/StudentFilters";
import { StudentCard } from "@/components/student360/StudentCard";
import { Student360Tabs } from "@/components/student360/Student360Tabs";
import { DemoModeBanner } from "@/components/ui/demo-mode-banner";
import { ErrorState } from "@/components/ui/error-state";
import type { Student360Data } from "@/services/student360Api";

const Student360 = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<Student360Data | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  const {
    students,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch,
    fetchStudentDetails,
    isDemo
  } = useStudent360Data();

  // If studentId is provided, load specific student details
  useEffect(() => {
    if (studentId) {
      handleViewDetails(studentId);
    }
  }, [studentId]);

  const handleViewDetails = async (id: string) => {
    setLoadingDetails(true);
    try {
      console.log('Loading student details for ID:', id);
      
      // First, find the student from the list to show basic info immediately
      const studentFromList = students.find(s => s.id === id || s.studentId === id);
      
      if (studentFromList) {
        // Set the student from list first to show basic info
        setSelectedStudent(studentFromList);
        navigate(`/student360/${id}`, { replace: true });
        
        // Then try to fetch detailed data in the background
        try {
          const detailedStudent = await fetchStudentDetails(id);
          if (detailedStudent) {
            console.log('✅ Detailed student data loaded:', detailedStudent);
            setSelectedStudent(detailedStudent);
          } else {
            console.log('ℹ️ Using basic student info from list view');
          }
        } catch (detailError) {
          console.warn('⚠️ Could not load detailed data, showing basic info:', detailError);
        }
      } else {
        console.warn('❌ Student not found in list:', id);
        handleBackToList();
      }
    } catch (error) {
      console.error('Error loading student details:', error);
      handleBackToList();
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setSelectedStudent(null);
    navigate('/student360', { replace: true });
  };

  // If showing specific student details
  if (selectedStudent || loadingDetails) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemo && <DemoModeBanner />}
          
          {/* Header with Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={handleBackToList}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Student List
            </Button>
            
            {selectedStudent && (
              <div className="flex items-center space-x-4">
                <div>
                  <h1 className="text-3xl font-bold">{selectedStudent.name}</h1>
                  <p className="text-muted-foreground">
                    {selectedStudent.rollNo} • {selectedStudent.program}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loadingDetails && (
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
              </div>
            </div>
          )}

          {/* Student Details */}
          {selectedStudent && !loadingDetails && (
            <Student360Tabs student={selectedStudent} isDemo={isDemo} />
          )}
        </div>
      </div>
    );
  }

  // Main student list view
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isDemo && <DemoModeBanner />}
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !isDemo) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <ErrorState 
              title="Failed to Load Student Data"
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
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Demo Mode Banner - Only show if demo mode is active */}
        {isDemo && <DemoModeBanner />}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Student 360°</h1>
              <p className="text-muted-foreground">
                {isDemo 
                  ? "Comprehensive student data view with demo data"
                  : "Comprehensive student data integrated from MyJKKN systems"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <StudentFilters
          filters={filters}
          onFiltersChange={updateFilters}
          onClearFilters={clearFilters}
          onRefetch={refetch}
          isDemo={isDemo}
          loading={loading}
        />

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {students.length === 0 
              ? "No students found matching the current filters" 
              : `Found ${students.length} student${students.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Students Grid */}
        {students.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
              <p className="text-muted-foreground mb-4">
                {Object.keys(filters).length > 0
                  ? "Try adjusting your filters to see more results."
                  : "No student data available. Please check your API configuration."
                }
              </p>
              {Object.keys(filters).length > 0 && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {students.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                onViewDetails={handleViewDetails}
                isDemo={isDemo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Student360;