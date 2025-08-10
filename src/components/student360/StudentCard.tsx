import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  GraduationCap, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Eye
} from "lucide-react";
import type { Student360Data } from "@/services/student360Api";

interface StudentCardProps {
  student: Student360Data;
  onViewDetails: (studentId: string) => void;
  isDemo?: boolean;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  onViewDetails,
  isDemo = false
}) => {
  // Calculate some key metrics for display
  const attendancePercentage = student.attendance.percentage;
  const pendingAssignments = student.assignments.filter(a => a.status === 'pending').length;
  const overdueAssignments = student.assignments.filter(a => a.status === 'overdue').length;
  const pendingFees = student.fees.pending_amount;
  const feesPaidPercentage = student.fees.total_fees > 0 
    ? (student.fees.paid_amount / student.fees.total_fees) * 100 
    : 100;

  // Get attendance status color
  const getAttendanceStatus = (percentage: number) => {
    if (percentage >= 85) return { color: 'text-green-600', bg: 'bg-green-100', status: 'Excellent' };
    if (percentage >= 75) return { color: 'text-yellow-600', bg: 'bg-yellow-100', status: 'Good' };
    return { color: 'text-red-600', bg: 'bg-red-100', status: 'Low' };
  };

  const attendanceStatus = getAttendanceStatus(attendancePercentage);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 ring-2 ring-primary/10">
              <AvatarImage src={student.avatar} alt={student.name} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg font-semibold">{student.name}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{student.rollNo}</span>
                <span>•</span>
                <span>{student.section}</span>
                <span>•</span>
                <span>Sem {student.semester}</span>
              </CardDescription>
              {isDemo && (
                <Badge variant="outline" className="text-xs mt-1 text-blue-600 border-blue-200">
                  Demo Data
                </Badge>
              )}
            </div>
          </div>
          <Badge variant={student.status === 'active' ? 'default' : 'secondary'} className="text-xs">
            {student.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Program Information */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <GraduationCap className="w-4 h-4 mr-2" />
            <span className="font-medium">{student.program}</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{student.department}</span>
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-1">
          <div className="flex items-center text-sm text-muted-foreground">
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{student.email}</span>
          </div>
          {student.phone && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Phone className="w-4 h-4 mr-2" />
              <span>{student.phone}</span>
            </div>
          )}
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          {/* Attendance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Attendance</span>
              <span className={`text-xs font-semibold ${attendanceStatus.color}`}>
                {attendancePercentage}%
              </span>
            </div>
            <Progress value={attendancePercentage} className="h-2" />
            <div className={`text-xs px-2 py-1 rounded-full ${attendanceStatus.bg} ${attendanceStatus.color} text-center`}>
              {attendanceStatus.status}
            </div>
          </div>

          {/* Fees Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Fees Paid</span>
              <span className="text-xs font-semibold text-blue-600">
                {feesPaidPercentage.toFixed(0)}%
              </span>
            </div>
            <Progress value={feesPaidPercentage} className="h-2" />
            <div className="text-xs text-center">
              {pendingFees > 0 ? (
                <span className="text-red-600 font-medium">₹{pendingFees.toLocaleString()} Pending</span>
              ) : (
                <span className="text-green-600 font-medium">Fully Paid</span>
              )}
            </div>
          </div>
        </div>

        {/* Alerts & Status Indicators */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {/* Assignment Alerts */}
          {overdueAssignments > 0 && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {overdueAssignments} Overdue
            </Badge>
          )}
          {pendingAssignments > 0 && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {pendingAssignments} Pending
            </Badge>
          )}

          {/* Attendance Alert */}
          {attendancePercentage < 75 && (
            <Badge variant="destructive" className="text-xs flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Low Attendance
            </Badge>
          )}

          {/* Fees Alert */}
          {pendingFees > 0 && (
            <Badge variant="outline" className="text-xs flex items-center gap-1 text-orange-600 border-orange-200">
              <DollarSign className="w-3 h-3" />
              Fees Due
            </Badge>
          )}

          {/* All Good Indicator */}
          {overdueAssignments === 0 && pendingFees === 0 && attendancePercentage >= 85 && (
            <Badge variant="default" className="text-xs flex items-center gap-1 bg-green-100 text-green-700 border-green-200">
              <CheckCircle className="w-3 h-3" />
              All Good
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t">
          <Button 
            onClick={() => onViewDetails(student.id)}
            className="w-full group-hover:shadow-md transition-all duration-200"
            variant="default"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Student 360°
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};