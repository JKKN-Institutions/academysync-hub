import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  is_system_role: boolean;
  status: 'active' | 'inactive';
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
  status?: 'active' | 'inactive';
}

export const useRoles = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Fetch roles with user count
      const { data: rolesData, error: rolesError } = await supabase
        .from('roles')
        .select('*')
        .order('created_at', { ascending: true });

      if (rolesError) throw rolesError;

      // Get user counts for each role from user_profiles table
      const rolesWithCounts = await Promise.all(
        rolesData.map(async (role) => {
          const { count } = await supabase
            .from('user_profiles')
            .select('*', { count: 'exact', head: true })
            .eq('role', role.name);

          return {
            ...role,
            permissions: Array.isArray(role.permissions) ? role.permissions : [],
            user_count: count || 0
          } as Role;
        })
      );

      setRoles(rolesWithCounts);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast({
        title: "Error",
        description: "Failed to fetch roles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (roleData: CreateRoleData) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .insert([
          {
            name: roleData.name,
            description: roleData.description,
            permissions: roleData.permissions,
            is_system_role: false,
            status: 'active'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role created successfully",
      });

      // Refresh roles list
      await fetchRoles();
      
      return data;
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateRole = async (roleId: string, updates: UpdateRoleData) => {
    try {
      const { data, error } = await supabase
        .from('roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role updated successfully",
      });

      // Refresh roles list
      await fetchRoles();
      
      return data;
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteRole = async (roleId: string) => {
    try {
      // First get the role name
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', roleId)
        .single();

      if (roleError) throw roleError;

      // Check if role has users assigned in user_profiles
      const { count } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', roleData.name);

      if (count && count > 0) {
        throw new Error('Cannot delete role with active users');
      }

      const { error } = await supabase
        .from('roles')
        .delete()
        .eq('id', roleId)
        .eq('is_system_role', false); // Prevent deletion of system roles

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      // Refresh roles list
      await fetchRoles();
    } catch (error: any) {
      console.error('Error deleting role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
      throw error;
    }
  };

  const assignRoleToUser = async (userId: string, roleId: string, expiresAt?: string) => {
    try {
      const { error } = await supabase
        .from('user_role_assignments')
        .insert([
          {
            user_id: userId,
            role_id: roleId,
            expires_at: expiresAt || null,
            status: 'active'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role assigned successfully",
      });
    } catch (error: any) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign role",
        variant: "destructive",
      });
      throw error;
    }
  };

  const removeRoleFromUser = async (userId: string, roleId: string) => {
    try {
      const { error } = await supabase
        .from('user_role_assignments')
        .delete()
        .eq('user_id', userId)
        .eq('role_id', roleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Role removed successfully",
      });
    } catch (error: any) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to remove role",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return {
    roles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    refetch: fetchRoles
  };
};