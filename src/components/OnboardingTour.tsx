import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Users, 
  UserCheck, 
  Calendar, 
  Target, 
  BarChart3,
  CheckCircle
} from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const tourSteps = [
  {
    id: 'directories',
    title: 'Directories',
    description: 'Browse mentors and students synced from your People API. Use filters and search to find the right matches.',
    icon: Users,
    features: ['Search by expertise', 'Filter by department', 'View sync status', 'Demo mode available']
  },
  {
    id: 'assignments', 
    title: 'Assignments',
    description: 'Create and manage mentor-student relationships. Track active assignments and monitor progress.',
    icon: UserCheck,
    features: ['Link mentors & students', 'Set assignment periods', 'Track session counts', 'Bulk operations']
  },
  {
    id: 'counseling',
    title: 'Counseling Sessions',
    description: 'Schedule and conduct structured mentoring sessions with built-in templates and best practices.',
    icon: Calendar,
    features: ['Create 1:1 or group sessions', 'Q&A documentation', 'Calendar integration', 'Meeting logs']
  },
  {
    id: 'session-detail',
    title: 'Session Details',
    description: 'Document session outcomes, track conversations, and maintain comprehensive mentoring records.',
    icon: CheckCircle,
    features: ['Session notes', 'Attachment support', 'Status tracking', 'Export to PDF']
  },
  {
    id: 'goals',
    title: 'Goals & Action Plans',
    description: 'Set SMART goals using our structured template. Track progress and maintain version history.',
    icon: Target,
    features: ['SMART goal framework', 'Area of focus', 'Knowledge & skills tracking', 'Version history']
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    description: 'Monitor program effectiveness with comprehensive reports on engagement, outcomes, and risk factors.',
    icon: BarChart3,
    features: ['Mentor workload', 'Student engagement', 'Risk indicators', 'Export capabilities']
  }
];

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setIsCompleted(false);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Mark tour as completed in localStorage
    localStorage.setItem('onboarding_tour_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const current = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <current.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">{current.title}</CardTitle>
                <CardDescription>
                  Step {currentStep + 1} of {tourSteps.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress indicator */}
          <div className="flex space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {!isCompleted ? (
            <>
              {/* Step content */}
              <div className="space-y-4">
                <p className="text-muted-foreground text-lg">
                  {current.description}
                </p>

                <div>
                  <h4 className="font-medium mb-3">Key Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {current.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex space-x-2">
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                  {currentStep > 0 && (
                    <Button variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                  )}
                </div>

                <Button onClick={handleNext}>
                  {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
                  {currentStep < tourSteps.length - 1 && (
                    <ArrowRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>
            </>
          ) : (
            /* Completion screen */
            <div className="text-center space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-green-900">
                  Welcome to Your Mentoring Platform!
                </h3>
                <p className="text-green-700 mt-2">
                  You're all set to start creating meaningful mentoring relationships.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Quick Next Steps:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <Badge variant="outline" className="p-2 justify-start">
                    1. Configure your API integration
                  </Badge>
                  <Badge variant="outline" className="p-2 justify-start">
                    2. Sync your mentor/student data
                  </Badge>
                  <Badge variant="outline" className="p-2 justify-start">
                    3. Create your first assignment
                  </Badge>
                  <Badge variant="outline" className="p-2 justify-start">
                    4. Schedule a counseling session
                  </Badge>
                </div>
              </div>

              <Button onClick={handleComplete} className="w-full">
                Get Started
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};