
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import MentorsDirectory from "./pages/MentorsDirectory";
import StudentsDirectory from "./pages/StudentsDirectory";
import Assignments from "./pages/Assignments";
import Admin from "./pages/Admin";
import Student360 from "./pages/Student360";
import SessionDetail from "./pages/SessionDetail";
import Reports from "./pages/Reports";
import AuditViewer from "./pages/AuditViewer";
import Help from "./pages/Help";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

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
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/mentors" element={
              <ProtectedRoute requiredRoles={['admin', 'mentee', 'dept_lead']}>
                <MentorsDirectory />
              </ProtectedRoute>
            } />
            <Route path="/students" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                <StudentsDirectory />
              </ProtectedRoute>
            } />
            <Route path="/student/:studentId" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'dept_lead']}>
                <Student360 />
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
            <Route path="/help" element={
              <ProtectedRoute>
                <Help />
              </ProtectedRoute>
            } />
            {/* Placeholder routes for remaining pages */}
            <Route path="/counseling" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                <div className="p-8">Counseling Sessions - Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="/goals" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                <div className="p-8">Goals & Plans - Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="/meetings" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor']}>
                <div className="p-8">Meeting Logs - Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="/qna" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee']}>
                <div className="p-8">Q&A - Coming Soon</div>
              </ProtectedRoute>
            } />
            <Route path="/alerts" element={
              <ProtectedRoute requiredRoles={['admin', 'mentor', 'mentee', 'dept_lead']}>
                <div className="p-8">Alerts - Coming Soon</div>
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
