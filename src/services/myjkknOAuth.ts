interface MyJKKNOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
}

class MyJKKNOAuthService {
  private config: MyJKKNOAuthConfig = {
    clientId: 'your-myjkkn-client-id', // This should be configured
    redirectUri: `${window.location.origin}/auth/callback`,
    scope: 'read:profile read:institutions',
    authUrl: 'https://my.jkkn.ac.in/oauth/authorize',
    tokenUrl: 'https://my.jkkn.ac.in/oauth/token'
  };

  // Generate a random state parameter for security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // Step 1: Redirect to MyJKKN authorization endpoint
  initiateOAuth(): void {
    const state = this.generateState();
    
    // Store state in localStorage for verification later
    localStorage.setItem('oauth_state', state);
    
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scope,
      state: state
    });

    const authUrl = `${this.config.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
  }

  // Step 2: Handle callback and exchange code for tokens
  async handleCallback(code: string, state: string): Promise<TokenResponse> {
    // Verify state parameter
    const storedState = localStorage.getItem('oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter');
    }

    // Clean up stored state
    localStorage.removeItem('oauth_state');

    // Exchange authorization code for tokens
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.config.clientId,
        code: code,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokens: TokenResponse = await response.json();
    
    // Store tokens securely
    localStorage.setItem('myjkkn_access_token', tokens.access_token);
    localStorage.setItem('myjkkn_refresh_token', tokens.refresh_token);
    localStorage.setItem('myjkkn_token_expires', (Date.now() + tokens.expires_in * 1000).toString());

    return tokens;
  }

  // Step 3: Fetch user profile with access token
  async getUserProfile(accessToken: string): Promise<UserProfile> {
    const response = await fetch('https://my.jkkn.ac.in/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user profile: ${response.status}`);
    }

    const profile = await response.json();
    return profile.data;
  }

  // Check if user has valid tokens
  hasValidTokens(): boolean {
    const accessToken = localStorage.getItem('myjkkn_access_token');
    const expiresAt = localStorage.getItem('myjkkn_token_expires');
    
    if (!accessToken || !expiresAt) {
      return false;
    }

    return Date.now() < parseInt(expiresAt);
  }

  // Get stored access token
  getAccessToken(): string | null {
    if (!this.hasValidTokens()) {
      return null;
    }
    return localStorage.getItem('myjkkn_access_token');
  }

  // Refresh access token using refresh token
  async refreshToken(): Promise<TokenResponse> {
    const refreshToken = localStorage.getItem('myjkkn_refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        client_id: this.config.clientId,
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const tokens: TokenResponse = await response.json();
    
    // Update stored tokens
    localStorage.setItem('myjkkn_access_token', tokens.access_token);
    localStorage.setItem('myjkkn_refresh_token', tokens.refresh_token);
    localStorage.setItem('myjkkn_token_expires', (Date.now() + tokens.expires_in * 1000).toString());

    return tokens;
  }

  // Logout and clear tokens
  logout(): void {
    localStorage.removeItem('myjkkn_access_token');
    localStorage.removeItem('myjkkn_refresh_token');
    localStorage.removeItem('myjkkn_token_expires');
    localStorage.removeItem('oauth_state');
  }
}

export const myjkknOAuth = new MyJKKNOAuthService();
export type { UserProfile, TokenResponse };