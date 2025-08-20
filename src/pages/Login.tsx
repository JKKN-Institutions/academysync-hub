import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { user, loading: userLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = (location.state as any)?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (user && !userLoading) {
      // Redirect to appropriate page based on role
      const targetPath = user.role === 'admin' || user.role === 'super_admin' 
        ? '/user-management' 
        : from === '/' || from === '/login' 
          ? '/assignments' 
          : from;
      navigate(targetPath, { replace: true });
    }
  }, [user, userLoading, navigate, from]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setAuthLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        throw error;
      }

      // Success message
      setError('');
    } catch (error: any) {
      setError(error.message || 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      setGoogleLoading(false);
    }
  };

  // Add effect to handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      setGoogleLoading(false);
    };

    // Check if we're coming back from OAuth
    if (window.location.search.includes('access_token') || window.location.search.includes('code')) {
      handleOAuthCallback();
    }
  }, []);

  if (userLoading || authLoading || googleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full animate-bounce opacity-20"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-pink-400 rounded-full animate-pulse opacity-30"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-green-400 rounded-full animate-bounce delay-1000 opacity-25"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-orange-400 rounded-full animate-pulse delay-500 opacity-20"></div>
        
        {/* Floating Icons */}
        <div className="absolute top-1/4 left-1/4 animate-float">
          <div className="w-8 h-8 bg-blue-400 rounded-lg rotate-45 opacity-30"></div>
        </div>
        <div className="absolute top-3/4 right-1/4 animate-float delay-1000">
          <div className="w-6 h-6 bg-purple-400 rounded-full opacity-40"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Animated Logo Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-6 shadow-2xl animate-pulse">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Mentor & Mentee
            </h1>
            <p className="text-blue-200 text-lg font-medium">Level Up Your Learning Journey!</p>
          </div>

            {/* Authentication Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl animate-scale-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-3">🚀 Ready to Begin?</h2>
                <p className="text-blue-200">Join your learning adventure</p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-6 bg-red-500/20 border-red-400/50">
                  <AlertCircle className="h-4 w-4 text-red-300" />
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="signin" className="space-y-6">
                <TabsList className="w-full bg-white/10 p-1">
                  <TabsTrigger value="signin" className="flex-1 text-white data-[state=active]:bg-white/20">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="flex-1 text-white data-[state=active]:bg-white/20">
                    Sign Up
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin" className="space-y-4">
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email" className="text-white">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 font-bold rounded-xl"
                      disabled={authLoading}
                    >
                      {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-white">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-white">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                          placeholder="Enter your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-white">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/60 pr-10"
                          placeholder="Confirm your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 text-white/60 hover:text-white"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 font-bold rounded-xl"
                      disabled={authLoading}
                    >
                      {authLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign Up
                    </Button>
                  </form>
                </TabsContent>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-transparent px-2 text-white/60">Or continue with</span>
                  </div>
                </div>

                <Button 
                  type="button" 
                  className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white py-4 text-lg font-bold rounded-2xl shadow-xl border-0 transition-all duration-300 hover:scale-105 hover:shadow-2xl" 
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading}
                >
                  {googleLoading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                  <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  🎮 Continue with Google
                </Button>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-sm text-blue-200/80">
                  For students, mentors & faculty
                </p>
              </div>
            </div>

          {/* Footer */}
          <div className="text-center mt-8 text-blue-200/60 text-sm animate-fade-in">
            © 2025 JKKN Educational Institutions
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;