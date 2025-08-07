import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  Calendar,
  Shield,
  Edit3,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    display_name: '',
    department: '',
    phone: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setProfile({
        display_name: user.displayName || '',
        department: user.department || '',
        phone: '',
        bio: '',
      });
    }
  }, [user]);

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

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: profile.display_name,
          department: profile.department,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfile({
        display_name: user.displayName || '',
        department: user.department || '',
        phone: '',
        bio: '',
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </CardHeader>
            </Card>
            <Card className="lg:col-span-2">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">Manage your personal information and settings</p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={loading} size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt={user.displayName || user.email || 'User'} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl">
                    {getInitials(user.displayName || user.email || 'U')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">
                {isEditing ? (
                  <Input
                    value={profile.display_name}
                    onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Enter your name"
                    className="text-center"
                  />
                ) : (
                  user.displayName || 'Unknown User'
                )}
              </CardTitle>
              <CardDescription className="flex flex-col items-center space-y-2">
                <Badge 
                  variant="outline" 
                  className={`text-sm px-3 py-1 ${getRoleColor(user.role || 'mentee')}`}
                >
                  {getRoleDisplayName(user.role || 'mentee')}
                </Badge>
                <span className="text-sm text-gray-500">{user.email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {getRoleDisplayName(user.role || 'mentee')}
                  </span>
                </div>
                {user.department && (
                  <div className="flex items-center space-x-3">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.department}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    Member since {new Date(user.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profile.display_name}
                      onChange={(e) => setProfile(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{user.displayName || 'Not set'}</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  {isEditing ? (
                    <Input
                      id="department"
                      value={profile.department}
                      onChange={(e) => setProfile(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Enter your department"
                    />
                  ) : (
                    <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{user.department || 'Not set'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {getRoleDisplayName(user.role || 'mentee')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Role is managed by administrators</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Last Login</Label>
                    <p className="text-sm text-gray-600">
                      {new Date(user.last_sign_in_at || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {user.externalId && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label>External ID</Label>
                    <div className="p-3 bg-blue-50 rounded-md">
                      <p className="text-sm font-mono text-blue-800">{user.externalId}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        This ID links your account to external systems
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              <span>Need Help?</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Profile Updates</h4>
                <p className="text-sm text-gray-600">
                  You can update your display name and department. Other information like email and role 
                  are managed by system administrators.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Account Issues</h4>
                <p className="text-sm text-gray-600">
                  If you're experiencing issues with your account or need to change your role, 
                  please contact your system administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;