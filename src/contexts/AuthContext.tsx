import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';
import parentAuthService from '@/lib/auth/parent-auth-service';

export type UserRole = 'admin' | 'mentor' | 'mentee' | 'dept_lead' | 'super_admin';

export interface AuthUser extends User {
  role?: UserRole;
  displayName?: string;
  department?: string;
  externalId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions matrix
const PERMISSIONS = {
  super_admin: [
    'view_integrations',
    'manage_settings', 
    'manage_assignments',
    'view_reports',
    'view_audit',
    'manage_all_sessions',
    'manage_all_goals',
    'manage_all_qa',
    'view_all_students',
    'view_all_mentors',
    'manage_system_settings',
    'manage_user_roles',
    'full_system_access'
  ],
  admin: [
    'view_integrations',
    'manage_settings', 
    'manage_assignments',
    'view_reports',
    'view_audit',
    'manage_all_sessions',
    'manage_all_goals',
    'manage_all_qa',
    'view_all_students',
    'view_all_mentors'
  ],
  mentor: [
    'view_my_mentees',
    'manage_my_sessions',
    'create_counseling',
    'edit_counseling',
    'manage_my_goals',
    'manage_my_qa',
    'view_student_360'
  ],
  mentee: [
    'view_my_sessions',
    'view_my_goals',
    'view_my_360',
    'submit_qa',
    'view_my_assignments'
  ],
  dept_lead: [
    'view_reports',
    'view_cohort_overview',
    'view_students_directory',
    'view_mentors_directory'
  ]
};

// Route access control
const ROUTE_PERMISSIONS = {
  '/admin': ['super_admin', 'admin'],
  '/integrations': ['super_admin', 'admin'],
  '/reports': ['super_admin', 'admin', 'dept_lead'],
  '/audit': ['super_admin', 'admin'],
  '/assignments': ['super_admin', 'admin', 'mentor', 'mentee', 'dept_lead'],
  '/counseling': ['super_admin', 'admin', 'mentor', 'mentee'],
  '/goals': ['super_admin', 'admin', 'mentor', 'mentee'],
  '/meetings': ['super_admin', 'admin', 'mentor'],
  '/qna': ['super_admin', 'admin', 'mentor', 'mentee'],
  '/mentors': ['super_admin', 'admin', 'mentee', 'dept_lead'],
  '/students': ['super_admin', 'admin', 'mentor', 'dept_lead'],
  '/student/:id': ['super_admin', 'admin', 'mentor', 'dept_lead'],
  '/session/:id': ['super_admin', 'admin', 'mentor', 'mentee'],
  '/alerts': ['super_admin', 'admin', 'mentor', 'mentee', 'dept_lead']
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role, display_name, department, external_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('User profile fetched:', data);
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    console.log('AuthContext: Initializing auth...');
    
    const initAuth = async () => {
      // First check for OAuth callback parameters
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');
      
      console.log('Checking for callback code:', !!code);
      
      if (error) {
        console.error('OAuth error:', params.get('error_description'));
        if (mounted) setLoading(false);
        return;
      }
      
      if (code && state) {
        // Handle OAuth callback
        try {
          console.log('Processing OAuth callback...');
          const session = await parentAuthService.handleCallback(code, state);
          console.log('OAuth callback successful, user:', session.user.email);
          
          if (mounted) {
            setUser({
              ...session.user as any,
              role: (session.user.role as UserRole) || 'mentee',
              displayName: session.user.full_name || session.user.email || 'Unknown User',
              department: undefined,
              externalId: session.user.id
            });
          }
          
          // Clean URL after successful authentication
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Auth callback failed:', error);
        }
      } else {
        // Check for existing parent auth session first
        const parentSession = parentAuthService.getSession();
        if (parentSession) {
          console.log('Found existing parent session for user:', parentSession.user.email);
          if (mounted) {
            setUser({
              ...parentSession.user as any,
              role: (parentSession.user.role as UserRole) || 'mentee',
              displayName: parentSession.user.full_name || parentSession.user.email || 'Unknown User',
              department: undefined,
              externalId: parentSession.user.id
            });
          }
        } else {
          // Fallback to Supabase auth if no parent session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser({
              ...session.user,
              role: 'mentee',
              displayName: session.user.email || 'Unknown User',
              department: undefined,
              externalId: undefined
            });
            
            // Try to fetch profile for Supabase users
            setTimeout(async () => {
              if (!mounted) return;
              try {
                const profile = await fetchUserProfile(session.user.id);
                if (mounted && profile) {
                  setUser(prevUser => prevUser ? {
                    ...prevUser,
                    role: profile?.role as UserRole || 'mentee',
                    displayName: profile?.display_name || session.user.email || 'Unknown User',
                    department: profile?.department,
                    externalId: profile?.external_id
                  } : null);
                }
              } catch (error) {
                console.error('Error fetching profile:', error);
              }
            }, 0);
          } else if (mounted) {
            console.log('No stored auth data found');
            setUser(null);
          }
        }
      }
      
      if (mounted) {
        setLoading(false);
      }
    };
    
    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    
    // Log user activity
    try {
      await supabase.rpc('log_user_activity', {
        activity_type: 'login',
        activity_data: { login_method: 'email_password' }
      });
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError);
    }
  };

  const signOut = async () => {
    // Log user activity before signing out
    try {
      await supabase.rpc('log_user_activity', {
        activity_type: 'logout'
      });
    } catch (activityError) {
      console.warn('Failed to log activity:', activityError);
    }
    
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const login = async () => {
    // Use parent auth service for OAuth flow
    await parentAuthService.initiateLogin();
  };

  const logout = async () => {
    try {
      // Try parent auth logout first
      if (parentAuthService.isAuthenticated()) {
        await parentAuthService.logout();
      } else {
        // Fallback to Supabase logout
        await signOut();
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear and redirect
      setUser(null);
      window.location.href = '/login';
    }
  };

  const refreshSession = async () => {
    const session = await parentAuthService.refreshToken();
    if (session) {
      setUser({
        ...session.user as any,
        role: (session.user.role as UserRole) || 'mentee',
        displayName: session.user.full_name || session.user.email || 'Unknown User',
        department: undefined,
        externalId: session.user.id
      });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.role) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  const canAccessRoute = (route: string): boolean => {
    if (!user?.role) return false;
    
    // Check exact route match first
    if (ROUTE_PERMISSIONS[route]) {
      return ROUTE_PERMISSIONS[route].includes(user.role);
    }
    
    // Check dynamic routes
    for (const [pattern, roles] of Object.entries(ROUTE_PERMISSIONS)) {
      if (pattern.includes(':') && matchesPattern(route, pattern)) {
        return roles.includes(user.role);
      }
    }
    
    return true; // Allow access if no specific restrictions
  };

  // Helper function to match dynamic routes like /student/:id
  const matchesPattern = (route: string, pattern: string): boolean => {
    const routeParts = route.split('/');
    const patternParts = pattern.split('/');
    
    if (routeParts.length !== patternParts.length) return false;
    
    return patternParts.every((part, index) => 
      part.startsWith(':') || part === routeParts[index]
    );
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut,
    login,
    logout,
    refreshSession,
    hasPermission,
    canAccessRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};