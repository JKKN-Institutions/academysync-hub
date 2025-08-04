import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <SidebarInset className="flex-1">
          {/* Global header with sidebar trigger */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1" />
          </header>
          
          {/* Main content area */}
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;