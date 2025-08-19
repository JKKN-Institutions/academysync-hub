
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
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
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/student-login" element={<Login />} />
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Index />} />
              <Route path="/handbook" element={<Landing />} />
              <Route path="/mentors" element={
                <ProtectedRoute requiredRoles={['admin', 'mentee', 'dept_lead']}>
                  <MentorsDirectory />
                </ProtectedRoute>
              } />
              <Route path="/staff" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                  <StaffDirectory />
                </ProtectedRoute>
              } />
              <Route path="/students" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                  <StudentsDirectory />
                </ProtectedRoute>
              } />
              <Route path="/student360" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                  <Student360 />
                </ProtectedRoute>
              } />
              <Route path="/student360/:studentId" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                  <Student360 />
                </ProtectedRoute>
              } />
              <Route path="/student/:studentId" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                  <Student360 />
                </ProtectedRoute>
              } />
              <Route path="/roles-permissions" element={
                <ProtectedRoute requiredRoles={['admin', 'super_admin']}>
                  <RolesPermissions />
                </ProtectedRoute>
              } />
              <Route path="/assignments" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee', 'dept_lead']}>
                  <Assignments />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/session/:sessionId" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                  <SessionDetail />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute requiredRoles={['admin', 'dept_lead']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="/audit" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <AuditViewer />
                </ProtectedRoute>
              } />
              <Route path="/help" element={<Help />} />
              <Route path="/faq" element={<FAQ />} />
              {/* Main application pages */}
              <Route path="/counseling" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                  <Counseling />
                </ProtectedRoute>
              } />
              <Route path="/goals" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                  <Goals />
                </ProtectedRoute>
              } />
              <Route path="/meetings" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor']}>
                  <Meetings />
                </ProtectedRoute>
              } />
              <Route path="/qna" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                  <QnA />
                </ProtectedRoute>
              } />
              <Route path="/alerts" element={
                <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee', 'dept_lead']}>
                  <Alerts />
                </ProtectedRoute>
              } />
              {/* User Management Module */}
              <Route path="/user-management" element={
                <ProtectedRoute requiredRoles={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }>
                <Route path="analytics" element={<UserAnalyticsDashboard />} />
                <Route path="users" element={<AllUsers />} />
                <Route path="roles-assignment" element={<RolesAssignment />} />
                <Route path="role-management" element={<RoleManagement />} />
                <Route path="audit-logs" element={<ActivityAuditLogs />} />
              </Route>
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
