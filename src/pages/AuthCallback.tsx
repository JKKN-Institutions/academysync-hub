import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { myjkknOAuth } from '@/services/myjkknOAuth';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          throw new Error(`OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Missing authorization code or state parameter');
        }

        // Exchange code for tokens
        const tokens = await myjkknOAuth.handleCallback(code, state);
        
        // Get user profile
        const profile = await myjkknOAuth.getUserProfile(tokens.access_token);
        
        console.log('MyJKKN OAuth login successful:', profile);
        
        // Here you would typically:
        // 1. Create or update user in your database
        // 2. Set up session/authentication state
        // 3. Redirect to the main app
        
        // For now, redirect to assignments page
        navigate('/assignments', { replace: true });
        
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Failed to complete authentication');
        setLoading(false);
      }
    };

    // Only process callback if not already authenticated
    if (!user) {
      handleOAuthCallback();
    } else {
      navigate('/assignments', { replace: true });
    }
  }, [searchParams, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Completing MyJKKN authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="text-center max-w-md mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <button 
          onClick={() => navigate('/login')}
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default AuthCallback;