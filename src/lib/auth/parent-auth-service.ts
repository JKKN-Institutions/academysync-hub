import Cookies from 'js-cookie';

interface AuthConfig {
  parentAppUrl: string;
  appId: string;
  redirectUri: string;
  scopes: string[];
}

interface UserSession {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    institution_id?: string;
    permissions?: Record<string, boolean>;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
  session_id?: string;
}

export class ParentAuthService {
  private static instance: ParentAuthService;
  private config: AuthConfig;
  private refreshTimer?: NodeJS.Timeout;

  private constructor() {
    this.config = {
      parentAppUrl: import.meta.env.VITE_PARENT_APP_URL || 'https://my.jkkn.ac.in',
      appId: import.meta.env.VITE_APP_ID || '',
      redirectUri: import.meta.env.VITE_REDIRECT_URI || (typeof window !== 'undefined' ? window.location.origin + '/auth/callback' : '/auth/callback'),
      scopes: ['read', 'write', 'profile']
    };
  }

  static getInstance(): ParentAuthService {
    if (!ParentAuthService.instance) {
      ParentAuthService.instance = new ParentAuthService();
    }
    return ParentAuthService.instance;
  }

  // Initialize OAuth2 authentication flow - Redirects to consent page
  async initiateLogin(state?: string): Promise<void> {
    // Validate configuration before initiating login
    if (!this.config.appId || this.config.appId === 'your-app-id-here') {
      throw new Error('MyJKKN App ID not configured. Please contact administrator.');
    }

    const computedRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : this.config.redirectUri;
    
    // Use the consent page endpoint for child app authentication
    const authUrl = new URL(`${this.config.parentAppUrl}/auth/child-app/consent`);
    
    // OAuth2 standard parameters (MyJKKN expects child_app_id)
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('child_app_id', this.config.appId);
    authUrl.searchParams.append('redirect_uri', computedRedirect);
    authUrl.searchParams.append('scope', this.config.scopes.join(' '));
    authUrl.searchParams.append('state', state || this.generateState());
    
    // Store state for CSRF protection
    if (!state) {
      sessionStorage.setItem('oauth_state', authUrl.searchParams.get('state')!);
    }
    
    console.log('[ParentAuth] Initiating login', {
      authUrl: authUrl.toString(),
      appId: this.config.appId,
      redirect: computedRedirect
    });
    window.location.href = authUrl.toString();
  }

  // Handle OAuth callback with authorization code
  async handleCallback(code: string, state: string): Promise<UserSession> {
    // Verify state for CSRF protection
    const savedState = sessionStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const computedRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : this.config.redirectUri;
    
    // Exchange authorization code for tokens
    const response = await fetch(`${this.config.parentAppUrl}/api/auth/child-app/token`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-API-Key': import.meta.env.VITE_API_KEY || ''
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: code,
        child_app_id: this.config.appId,  // Note: Use child_app_id
        redirect_uri: computedRedirect
      })
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      let error: any = {};
      try { error = JSON.parse(text); } catch { error = { error_description: text || 'Authentication failed' }; }
      console.error('[ParentAuth] Token exchange failed', { status: response.status, error });
      throw new Error(error.error_description || `Authentication failed (${response.status})`);
    }

    const session = await response.json();
    
    // Save session data
    this.saveSession(session);
    
    // Schedule automatic token refresh
    this.scheduleTokenRefresh(session.expires_in);
    
    // Clear state
    sessionStorage.removeItem('oauth_state');
    
    return session;
  }

  // Save session tokens securely
  private saveSession(session: UserSession): void {
    // Store access token with expiry
    const expiresAt = new Date(Date.now() + session.expires_in * 1000);
    
    // Use appropriate cookie settings based on environment
    const isProduction = window.location.protocol === 'https:';
    
    Cookies.set('access_token', session.access_token, { 
      expires: expiresAt,
      secure: isProduction, // Only use secure in production
      sameSite: isProduction ? 'strict' : 'lax', // Use lax for development
      path: '/' // Ensure cookie is available site-wide
    });
    
    // Store refresh token for 30 days
    Cookies.set('refresh_token', session.refresh_token, { 
      expires: 30,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/'
    });
    
    // Store user data in localStorage with error handling
    try {
      localStorage.setItem('user_data', JSON.stringify(session.user));
      localStorage.setItem('auth_timestamp', Date.now().toString());
    } catch (e) {
      console.error('Failed to save user data to localStorage:', e);
    }
  }

  // Get current session
  getSession(): UserSession | null {
    try {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      const userData = localStorage.getItem('user_data');

      // Debug logging for troubleshooting
      if (!accessToken) console.debug('No access token found');
      if (!refreshToken) console.debug('No refresh token found');
      if (!userData) console.debug('No user data found');

      if (!accessToken || !refreshToken || !userData) {
        return null;
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: JSON.parse(userData),
        expires_in: 3600
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  // Refresh access token
  async refreshToken(): Promise<UserSession | null> {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.config.parentAppUrl}/api/auth/child-app/token`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-API-Key': import.meta.env.VITE_API_KEY || ''
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          child_app_id: this.config.appId  // Note: Use child_app_id
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const session = await response.json();
      this.saveSession(session);
      this.scheduleTokenRefresh(session.expires_in);
      
      return session;
    } catch (error) {
      // If refresh fails, clear session and redirect to login
      this.clearSession();
      return null;
    }
  }

  // Schedule automatic token refresh
  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    // Refresh 5 minutes before expiry
    const refreshIn = Math.max((expiresIn - 300) * 1000, 60000); // At least 1 minute
    
    this.refreshTimer = setTimeout(() => {
      this.refreshToken();
    }, refreshIn);
  }

  // Logout user - IMPORTANT: Only clears child app session, NOT parent session
  async logout(redirectToParent: boolean = false): Promise<void> {
    try {
      // Call child app logout endpoint (preserves parent session)
      const session = this.getSession();
      const computedRedirect = typeof window !== 'undefined'
        ? window.location.origin
        : this.config.parentAppUrl;
      const response = await fetch(`${this.config.parentAppUrl}/api/auth/child-app/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_id: this.config.appId,
          session_id: session?.session_id,
          access_token: session?.access_token,
          redirect_uri: redirectToParent ? this.config.parentAppUrl : computedRedirect
        })
      });

      // Clear local session data
      this.clearSession();

      if (redirectToParent && response.ok) {
        const data = await response.json().catch(() => ({}));
        if (data.redirect_uri) {
          window.location.href = data.redirect_uri;
          return;
        }
      }
      
      // Redirect to child app login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      this.clearSession();
      window.location.href = '/login';
    }
  }

  // Clear session data
  private clearSession(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }
    
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_timestamp');
    sessionStorage.clear();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  // Get current user
  getUser(): any {
    const session = this.getSession();
    return session?.user || null;
  }

  // Get auth headers for API calls
  getAuthHeaders(): Record<string, string> {
    const session = this.getSession();
    if (!session) return {};

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'X-App-ID': this.config.appId
    };
  }

  // Generate random state for CSRF protection
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default ParentAuthService.getInstance();