import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Settings, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      console.log('🚪 Starting sign out process...');
      
      // Use the logout method from AuthContext which handles both parent auth and Supabase
      await logout();
      
      console.log('✅ Sign out successful');
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
      
      // Small delay to ensure cleanup completes
      setTimeout(() => {
        navigate("/login", { replace: true });
        window.location.reload(); // Force reload to clear all state
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Sign out failed:', error);
      toast({
        title: "Error signing out",
        description: error.message || "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      
      // Force logout even if error occurs
      localStorage.clear();
      sessionStorage.clear();
      setTimeout(() => {
        navigate("/login", { replace: true });
        window.location.reload();
      }, 100);
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mentor':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'mentee':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dept_lead':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrator';
      case 'admin':
        return 'Administrator';
      case 'mentor':
        return 'Mentor';
      case 'mentee':
        return 'Student';
      case 'dept_lead':
        return 'Department Lead';
      default:
        return role?.charAt(0).toUpperCase() + role?.slice(1);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={user.displayName || user.email || 'User'} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(user.displayName || user.email || 'U')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="" alt={user.displayName || user.email || 'User'} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">
                  {getInitials(user.displayName || user.email || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.displayName || 'Unknown User'}
                </p>
              </div>
            </div>
            <Badge 
              variant="outline" 
              className={`w-fit text-xs px-2 py-1 ${getRoleColor(user.role || 'mentee')}`}
            >
              {getRoleDisplayName(user.role || 'mentee')}
            </Badge>
            {user.department && (
              <p className="text-xs text-gray-500">
                Department: {user.department}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/" className="flex items-center w-full">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center w-full">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="text-red-600 focus:text-red-600 focus:bg-red-50"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};