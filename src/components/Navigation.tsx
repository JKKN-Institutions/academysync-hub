
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Users, 
  Calendar, 
  Target, 
  FileText, 
  Bell, 
  BarChart3, 
  Settings, 
  UserCircle,
  GraduationCap,
  ClipboardList,
  MessageSquare,
  Home
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  userRole: "admin" | "mentor" | "mentee" | "dept_lead";
}

const Navigation = ({ userRole }: NavigationProps) => {
  const location = useLocation();

  const navigationItems = [
    { icon: Home, label: "Dashboard", href: "/", roles: ["admin", "mentor", "mentee", "dept_lead"] },
    { icon: Users, label: "Mentors Directory", href: "/mentors", roles: ["admin", "mentee", "dept_lead"] },
    { icon: GraduationCap, label: "Students Directory", href: "/students", roles: ["admin", "mentor", "dept_lead"] },
    { icon: ClipboardList, label: "Assignments", href: "/assignments", roles: ["admin", "mentor", "mentee", "dept_lead"] },
    { icon: Calendar, label: "Counseling", href: "/counseling", roles: ["admin", "mentor", "mentee"] },
    { icon: UserCircle, label: "Student 360", href: "/student360", roles: ["admin", "mentor", "dept_lead"] },
    { icon: Target, label: "Goals & Plans", href: "/goals", roles: ["admin", "mentor", "mentee"] },
    { icon: FileText, label: "Meeting Logs", href: "/meetings", roles: ["admin", "mentor"] },
    { icon: MessageSquare, label: "Q&A", href: "/qna", roles: ["admin", "mentor", "mentee"] },
    { icon: BarChart3, label: "Reports", href: "/reports", roles: ["admin", "dept_lead"] },
    { icon: Bell, label: "Alerts", href: "/alerts", roles: ["admin", "mentor", "mentee", "dept_lead"] },
    { icon: Settings, label: "Admin", href: "/admin", roles: ["admin"] },
  ];

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="w-64 bg-white shadow-lg border-r min-h-screen">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg text-gray-800">AcademySync Hub</h2>
        <p className="text-sm text-gray-600">Mentoring Platform</p>
      </div>
      
      <div className="p-4">
        <div className="space-y-2">
          {filteredItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link key={index} to={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-blue-600 text-white"
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
