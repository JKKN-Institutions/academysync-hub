import { useState } from "react";
import { 
  Home, 
  Users, 
  GraduationCap, 
  Calendar, 
  Target, 
  FileText, 
  MessageSquare, 
  ClipboardList,
  UserCircle,
  BarChart3,
  Bell,
  Settings,
  Shield,
  ChevronRight,
  Database,
  BookOpen,
  TrendingUp,
  Activity
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

interface MenuGroup {
  label: string;
  icon: React.ComponentType<any>;
  items: MenuItem[];
  roles: UserRole[];
}

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  roles: UserRole[];
  description?: string;
}

export function AppSidebar() {
  const { user } = useAuth();
  const { state } = useSidebar();
  const location = useLocation();
  const [openGroups, setOpenGroups] = useState<string[]>(['dashboard', 'people', 'mentoring']);
  
  const isCollapsed = state === "collapsed";

  const userRole = user?.role || "admin";

  const menuGroups: MenuGroup[] = [
    {
      label: "Dashboard",
      icon: Home,
      roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"],
      items: [
        { title: "Overview", url: "/", icon: Activity, roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"], description: "Main dashboard" },
      ]
    },
    {
      label: "People Management",
      icon: Users,
      roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"],
      items: [
        { title: "Mentors Directory", url: "/mentors", icon: Users, roles: ["admin", "super_admin", "mentee", "dept_lead"], description: "Browse mentor profiles" },
        { title: "Students Directory", url: "/students", icon: GraduationCap, roles: ["admin", "super_admin", "mentor", "dept_lead"], description: "Browse student profiles" },
        { title: "Student 360", url: "/student360", icon: UserCircle, roles: ["admin", "super_admin", "mentor", "dept_lead"], description: "Detailed student view" },
        { title: "Assignments", url: "/assignments", icon: ClipboardList, roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"], description: "Mentor-student assignments" },
      ]
    },
    {
      label: "Mentoring Activities",
      icon: Calendar,
      roles: ["admin", "super_admin", "mentor", "mentee"],
      items: [
        { title: "Counseling Sessions", url: "/counseling", icon: Calendar, roles: ["admin", "super_admin", "mentor", "mentee"], description: "Schedule and manage sessions" },
        { title: "Goals & Action Plans", url: "/goals", icon: Target, roles: ["admin", "super_admin", "mentor", "mentee"], description: "Track development goals" },
        { title: "Meeting Logs", url: "/meetings", icon: FileText, roles: ["admin", "super_admin", "mentor"], description: "Session documentation" },
        { title: "Q&A Exchange", url: "/qna", icon: MessageSquare, roles: ["admin", "super_admin", "mentor", "mentee"], description: "Questions and answers" },
      ]
    },
    {
      label: "Analytics & Insights",
      icon: BarChart3,
      roles: ["admin", "super_admin", "dept_lead"],
      items: [
        { title: "Reports Dashboard", url: "/reports", icon: BarChart3, roles: ["admin", "super_admin", "dept_lead"], description: "Performance analytics" },
        { title: "Engagement Metrics", url: "/reports?tab=engagement", icon: TrendingUp, roles: ["admin", "super_admin", "dept_lead"], description: "Student engagement data" },
      ]
    },
    {
      label: "Notifications & Alerts",
      icon: Bell,
      roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"],
      items: [
        { title: "Alert Center", url: "/alerts", icon: Bell, roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"], description: "Risk and event alerts" },
      ]
    },
    {
      label: "System Administration",
      icon: Settings,
      roles: ["admin", "super_admin"],
      items: [
        { title: "Admin Dashboard", url: "/admin", icon: Settings, roles: ["admin", "super_admin"], description: "System configuration" },
        { title: "Audit Logs", url: "/audit", icon: Shield, roles: ["admin", "super_admin"], description: "Security and change logs" },
        { title: "Data Sync", url: "/admin?tab=sync", icon: Database, roles: ["admin", "super_admin"], description: "People API integration" },
      ]
    },
    {
      label: "Help & Support",
      icon: BookOpen,
      roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"],
      items: [
        { title: "Help Center", url: "/help", icon: BookOpen, roles: ["admin", "super_admin", "mentor", "mentee", "dept_lead"], description: "Documentation and guides" },
      ]
    }
  ];

  const filteredGroups = menuGroups.filter(group => 
    group.roles.includes(userRole) && group.items.some(item => item.roles.includes(userRole))
  );

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(prev => 
      prev.includes(groupLabel) 
        ? prev.filter(g => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  const isItemActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname.startsWith(url);
  };

  const hasActiveItem = (items: MenuItem[]) => {
    return items.some(item => 
      item.roles.includes(userRole) && isItemActive(item.url)
    );
  };

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-80"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground">AcademySync Hub</span>
              <span className="text-xs text-sidebar-foreground/70">Mentoring Platform</span>
            </div>
          )}
        </div>
        {!isCollapsed && user && (
          <div className="px-3 pb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
              </Badge>
              {user.department && (
                <Badge variant="outline" className="text-xs">
                  {user.department}
                </Badge>
              )}
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="gap-0">
        {filteredGroups.map((group, groupIndex) => {
          const GroupIcon = group.icon;
          const isGroupOpen = openGroups.includes(group.label.toLowerCase().replace(/\s+/g, '_'));
          const hasActive = hasActiveItem(group.items);
          const filteredItems = group.items.filter(item => item.roles.includes(userRole));

          return (
            <SidebarGroup key={groupIndex}>
              <Collapsible 
                open={isGroupOpen} 
                onOpenChange={() => toggleGroup(group.label.toLowerCase().replace(/\s+/g, '_'))}
              >
                <SidebarGroupLabel asChild>
                  <CollapsibleTrigger className="group/label w-full">
                    <div className="flex items-center gap-2">
                      <GroupIcon className="h-4 w-4" />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-left">{group.label}</span>
                          <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/label:rotate-90" />
                        </>
                      )}
                    </div>
                    {hasActive && (
                      <div className="ml-auto h-2 w-2 rounded-full bg-primary" />
                    )}
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {filteredItems.map((item, itemIndex) => {
                        const ItemIcon = item.icon;
                        const isActive = isItemActive(item.url);

                        return (
                          <SidebarMenuItem key={itemIndex}>
                            <SidebarMenuButton asChild isActive={isActive}>
                              <NavLink to={item.url} className="group">
                                <ItemIcon className="h-4 w-4" />
                                {!isCollapsed && (
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="truncate">{item.title}</span>
                                    {item.description && (
                                      <span className="text-xs text-sidebar-foreground/60 truncate">
                                        {item.description}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}