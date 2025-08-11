import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Global header with sidebar trigger */}
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex-1" />
          <ProfileDropdown />
        </header>
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer */}
        <footer className="border-t bg-muted/50 px-4 py-3">
          <div className="text-center text-sm text-muted-foreground">
            Developed by RahulRj - Copyright @ 2025. All Rights Reserved.
          </div>
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;