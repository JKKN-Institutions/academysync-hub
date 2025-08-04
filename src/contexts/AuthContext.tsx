import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'mentor' | 'mentee' | 'dept_lead';

export interface AuthUser extends User {
  role?: UserRole;
  displayName?: string;
  department?: string;
  externalId?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccessRoute: (route: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions matrix
const PERMISSIONS = {
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
  '/admin': ['admin'],
  '/integrations': ['admin'],
  '/reports': ['admin', 'dept_lead'],
  '/audit': ['admin'],
  '/assignments': ['admin', 'mentor', 'mentee', 'dept_lead'],
  '/counseling': ['admin', 'mentor', 'mentee'],
  '/goals': ['admin', 'mentor', 'mentee'],
  '/meetings': ['admin', 'mentor'],
  '/qna': ['admin', 'mentor', 'mentee'],
  '/mentors': ['admin', 'mentee', 'dept_lead'],
  '/students': ['admin', 'mentor', 'dept_lead'],
  '/student/:id': ['admin', 'mentor', 'dept_lead'],
  '/session/:id': ['admin', 'mentor', 'mentee'],
  '/alerts': ['admin', 'mentor', 'mentee', 'dept_lead']
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Mock user data - in real app this would come from profiles table
        setUser({
          ...session.user,
          role: 'admin', // This would be fetched from user profile
          displayName: 'Dr. Sarah Johnson',
          department: 'Computer Science',
          externalId: 'staff_001'
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Mock user data - in real app this would come from profiles table
          setUser({
            ...session.user,
            role: 'admin',
            displayName: 'Dr. Sarah Johnson', 
            department: 'Computer Science',
            externalId: 'staff_001'
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
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
    signIn,
    signOut,
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