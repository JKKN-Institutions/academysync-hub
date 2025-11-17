
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import MentorsDirectory from "./pages/MentorsDirectory";
import StaffDirectory from "./pages/StaffDirectory";
import StudentsDirectory from "./pages/StudentsDirectory";
import Assignments from "./pages/Assignments";
import Admin from "./pages/Admin";
import Student360 from "./pages/Student360";
import SessionDetail from "./pages/SessionDetail";
import Reports from "./pages/Reports";
import AuditViewer from "./pages/AuditViewer";
import Help from "./pages/Help";
import FAQ from "./pages/FAQ";
import Counseling from "./pages/Counseling";
import Goals from "./pages/Goals";
import Meetings from "./pages/Meetings";
import QnA from "./pages/QnA";
import Alerts from "./pages/Alerts";
import UserAnalyticsDashboard from "./pages/user-management/UserAnalyticsDashboard";
import AllUsers from "./pages/user-management/AllUsers";
import RolesAssignment from "./pages/user-management/RolesAssignment";
import RoleManagement from "./pages/user-management/RoleManagement";
import ActivityAuditLogs from "./pages/user-management/ActivityAuditLogs";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import StudentDemo from "./pages/StudentDemo";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/handbook" element={<Landing />} />
              <Route path="/mentors" element={<MentorsDirectory />} />
              <Route path="/staff" element={<StaffDirectory />} />
              <Route path="/students" element={<StudentsDirectory />} />
              <Route path="/student360" element={<Student360 />} />
              <Route path="/student360/:studentId" element={<Student360 />} />
              <Route path="/student/:studentId" element={<Student360 />} />
              <Route path="/roles-permissions" element={<RolesPermissions />} />
              <Route path="/assignments" element={<Assignments />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/session/:sessionId" element={<SessionDetail />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/audit" element={<AuditViewer />} />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/counseling" element={<Counseling />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/meetings" element={<Meetings />} />
              <Route path="/qna" element={<QnA />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/user-management" element={<UserManagement />} />
              <Route path="/user-management/dashboard" element={<UserAnalyticsDashboard />} />
              <Route path="/user-management/users" element={<AllUsers />} />
              <Route path="/user-management/roles" element={<RoleManagement />} />
              <Route path="/user-management/roles-assignment" element={<RolesAssignment />} />
              <Route path="/user-management/activity-logs" element={<ActivityAuditLogs />} />
              <Route path="/student-demo" element={<StudentDemo />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
