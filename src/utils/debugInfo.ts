// Debug utility for mentor-mentee application
export const generateDebugInfo = () => {
  const debugInfo = {
    // Environment
    timestamp: new Date().toISOString(),
    currentUrl: window.location.href,
    userAgent: navigator.userAgent,
    
    // Authentication State - Supabase
    supabaseAuth: {
      hasAccessToken: !!localStorage.getItem('sb-pbzndbvxjdvfmgoonxee-auth-token'),
      hasRefreshToken: !!localStorage.getItem('sb-pbzndbvxjdvfmgoonxee-auth-token-code-verifier'),
      sessionKeys: Object.keys(localStorage).filter(key => key.includes('supabase') || key.includes('sb-')),
    },
    
    // MyJKKN OAuth State
    myjkknAuth: {
      hasAccessToken: !!localStorage.getItem('myjkkn_access_token'),
      hasRefreshToken: !!localStorage.getItem('myjkkn_refresh_token'),
      tokenExpires: localStorage.getItem('myjkkn_token_expires'),
      oauthState: localStorage.getItem('oauth_state'),
      isTokenValid: false // Will be computed below
    },
    
    // URL Parameters
    urlParams: Object.fromEntries(new URLSearchParams(location.search)),
    
    // Cookies (truncated for security)
    allCookies: document.cookie ? document.cookie.split('; ').reduce((acc, cookie) => {
      const [name, value] = cookie.split('=');
      acc[name] = value ? value.substring(0, 20) + '...' : '';
      return acc;
    }, {} as Record<string, string>) : {},
    
    // Local Storage Keys (without sensitive values)
    localStorage: {
      totalKeys: Object.keys(localStorage).length,
      keys: Object.keys(localStorage),
      relevantKeys: Object.keys(localStorage).filter(key => 
        key.includes('auth') || 
        key.includes('user') || 
        key.includes('token') || 
        key.includes('myjkkn') ||
        key.includes('supabase') ||
        key.includes('sb-')
      )
    },
    
    // Environment Variables (only public ones)
    env: {
      mode: import.meta.env.MODE,
      dev: import.meta.env.DEV,
      prod: import.meta.env.PROD,
      supabaseUrl: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
      supabaseKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'SET' : 'NOT_SET',
      supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID ? 'SET' : 'NOT_SET'
    },
    
    // Application State
    appState: {
      route: window.location.pathname,
      hash: window.location.hash,
      isOnLoginPage: window.location.pathname.includes('/login'),
      isOnCallbackPage: window.location.pathname.includes('/callback'),
    },
    
    // Browser Capabilities
    browserCapabilities: {
      cookiesEnabled: navigator.cookieEnabled,
      localStorage: typeof Storage !== 'undefined',
      sessionStorage: typeof sessionStorage !== 'undefined',
      webGL: !!window.WebGLRenderingContext,
    },
    
    // Network State
    network: {
      online: navigator.onLine,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt
      } : 'Not available'
    }
  };

  // Add computed properties
  debugInfo.myjkknAuth.isTokenValid = debugInfo.myjkknAuth.tokenExpires ? 
    Date.now() < parseInt(debugInfo.myjkknAuth.tokenExpires) : false;

  return debugInfo;
};

// Console helper function
export const logDebugInfo = () => {
  const debugInfo = generateDebugInfo();
  console.group('🔧 Mentor-Mentee App Debug Info');
  console.log('Copy this information for support:');
  console.log(JSON.stringify(debugInfo, null, 2));
  console.groupEnd();
  return debugInfo;
};

// Browser console script generator
export const getConsoleScript = () => {
  return `
// Mentor-Mentee App Debug Script
// Run this in browser console and copy results for support

${generateDebugInfo.toString()}

${logDebugInfo.toString()}

// Execute
const debugInfo = logDebugInfo();
console.log('\\n📋 Copy the JSON above for support team');
debugInfo;
`;
};