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
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Global header with sidebar trigger */}
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger className="-ml-1 h-8 w-8" />
            <div className="flex-1" />
            <ProfileDropdown />
          </header>
          
          {/* Main content area with proper padding */}
          <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            <main className="flex-1 overflow-auto px-6 py-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </main>
            <Footer />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Layout;