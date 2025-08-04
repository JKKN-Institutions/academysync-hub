
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MentorsDirectory from "./pages/MentorsDirectory";
import StudentsDirectory from "./pages/StudentsDirectory";
import Assignments from "./pages/Assignments";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mentors" element={<MentorsDirectory />} />
          <Route path="/students" element={<StudentsDirectory />} />
          <Route path="/assignments" element={<Assignments />} />
          {/* Placeholder routes for remaining pages */}
          <Route path="/counseling" element={<div className="p-8">Counseling Sessions - Coming Soon</div>} />
          <Route path="/student360" element={<div className="p-8">Student 360 - Coming Soon</div>} />
          <Route path="/goals" element={<div className="p-8">Goals & Plans - Coming Soon</div>} />
          <Route path="/meetings" element={<div className="p-8">Meeting Logs - Coming Soon</div>} />
          <Route path="/qna" element={<div className="p-8">Q&A - Coming Soon</div>} />
          <Route path="/reports" element={<div className="p-8">Reports - Coming Soon</div>} />
          <Route path="/alerts" element={<div className="p-8">Alerts - Coming Soon</div>} />
          <Route path="/admin" element={<div className="p-8">Admin Panel - Coming Soon</div>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
