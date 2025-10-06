import Cookies from 'js-cookie';

// Constants for Supabase Edge Functions (no env usage per Lovable guidelines)
const SUPABASE_FUNCTIONS_URL = 'https://pbzndbvxjdvfmgoonxee.supabase.co/functions/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBiem5kYnZ4amR2Zm1nb29ueGVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyOTg5NzQsImV4cCI6MjA2OTg3NDk3NH0.12mw6uOwJAL5nDRMqCf78xLGMJQg8D6HM3KCalwOXaA';

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
    // Start with minimal defaults; fetch real config from Edge Function when needed
    this.config = {
      parentAppUrl: 'https://auth.jkkn.ai',
      appId: '',
      redirectUri: (typeof window !== 'undefined' ? window.location.origin + '/callback' : '/callback'),
      scopes: ['read', 'write', 'profile']
    };

    // Try to hydrate from cache
    const cached = typeof window !== 'undefined' ? localStorage.getItem('myjkkn_config') : null;
    if (cached) {
      try { this.config = { ...this.config, ...JSON.parse(cached) }; } catch {}
    }
  }

  static getInstance(): ParentAuthService {
    if (!ParentAuthService.instance) {
      ParentAuthService.instance = new ParentAuthService();
    }
    return ParentAuthService.instance;
  }

  // Fetch config from Edge Function and cache it
  private async ensureConfig() {
    if (this.config.appId && this.config.parentAppUrl) return;
    const res = await fetch(`${SUPABASE_FUNCTIONS_URL}/myjkkn-config`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      this.config.appId = data.appId || this.config.appId;
      this.config.parentAppUrl = data.parentAppUrl || this.config.parentAppUrl;
      try { localStorage.setItem('myjkkn_config', JSON.stringify({ appId: this.config.appId, parentAppUrl: this.config.parentAppUrl })); } catch {}
    }
  }

  // Initialize OAuth2 authentication flow - Redirects to authorization page
  async initiateLogin(state?: string): Promise<void> {
    await this.ensureConfig();

    if (!this.config.appId) {
      console.error('[ParentAuth] Missing application ID');
      throw new Error('Missing MyJKKN application ID. Please configure the app.');
    }

    const computedRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}/callback`
      : this.config.redirectUri;

    // Generate state if not provided
    const oauthState = state || this.generateState();
    localStorage.setItem('oauth_state', oauthState);

    // Build authorization URL
    const params = new URLSearchParams({
      client_id: this.config.appId,
      redirect_uri: computedRedirect,
      response_type: 'code',
      scope: 'read write profile',
      state: oauthState,
    });

    const authUrl = `${this.config.parentAppUrl}/api/auth/authorize?${params.toString()}`;
    console.log('[ParentAuth] Redirecting to:', authUrl);
    
    window.location.href = authUrl;
  }

  // Handle OAuth callback with authorization code (via Edge Function)
  async handleCallback(code: string, state: string): Promise<UserSession> {
    const savedState = localStorage.getItem('oauth_state');
    if (state !== savedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    const computedRedirect = typeof window !== 'undefined'
      ? `${window.location.origin}/callback`
      : this.config.redirectUri;

    await this.ensureConfig();

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/myjkkn-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code,
        redirect_uri: computedRedirect,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('[ParentAuth] Token exchange failed', response.status, text);
      throw new Error('Authentication failed');
    }

    const session = await response.json();
    this.saveSession(session);
    this.scheduleTokenRefresh(session.expires_in);
    localStorage.removeItem('oauth_state');
    return session;
  }

  // Save session tokens securely
  private saveSession(session: UserSession): void {
    const expiresAt = new Date(Date.now() + session.expires_in * 1000);
    const isProduction = typeof window !== 'undefined' && window.location.protocol === 'https:';

    Cookies.set('access_token', session.access_token, {
      expires: expiresAt,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });

    Cookies.set('refresh_token', session.refresh_token, {
      expires: 30,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    });

    try {
      localStorage.setItem('user_data', JSON.stringify(session.user));
      localStorage.setItem('auth_timestamp', Date.now().toString());
    } catch (e) {
      console.error('Failed to save user data to localStorage:', e);
    }
  }

  getSession(): UserSession | null {
    try {
      const accessToken = Cookies.get('access_token');
      const refreshToken = Cookies.get('refresh_token');
      const userData = localStorage.getItem('user_data');
      if (!accessToken || !refreshToken || !userData) return null;
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        user: JSON.parse(userData),
        expires_in: 3600,
      };
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  async refreshToken(): Promise<UserSession | null> {
    const refreshToken = Cookies.get('refresh_token');
    if (!refreshToken) return null;

    const response = await fetch(`${SUPABASE_FUNCTIONS_URL}/myjkkn-auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    });

    if (!response.ok) {
      this.clearSession();
      return null;
    }

    const session = await response.json();
    this.saveSession(session);
    this.scheduleTokenRefresh(session.expires_in);
    return session;
  }

  private scheduleTokenRefresh(expiresIn: number): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    const refreshIn = Math.max((expiresIn - 300) * 1000, 60000);
    this.refreshTimer = setTimeout(() => this.refreshToken(), refreshIn);
  }

  async logout(redirectToParent: boolean = false): Promise<void> {
    this.clearSession();
    if (redirectToParent) {
      window.location.href = this.config.parentAppUrl || '/login';
      return;
    }
    window.location.href = '/login';
  }

  private clearSession(): void {
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_timestamp');
    sessionStorage.clear();
  }

  isAuthenticated(): boolean {
    return !!this.getSession();
  }

  getUser(): any {
    const session = this.getSession();
    return session?.user || null;
  }

  getAuthHeaders(): Record<string, string> {
    const session = this.getSession();
    if (!session) return {};
    return { Authorization: `Bearer ${session.access_token}`, 'X-App-ID': this.config.appId };
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }
}

export default ParentAuthService.getInstance();