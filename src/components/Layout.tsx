import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ProfileDropdown } from "@/components/ProfileDropdown";
import { useAuth } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

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
        <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;