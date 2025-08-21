import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface EndpointTest {
  name: string;
  url: string;
  status: 'idle' | 'testing' | 'success' | 'error' | 'warning';
  result?: any;
  error?: string;
  responseTime?: number;
  corsError?: boolean;
  authError?: boolean;
  networkError?: boolean;
}

interface DiagnosticResult {
  apiKeyValid: boolean;
  corsIssues: boolean;
  networkConnectivity: boolean;
  serverResponding: boolean;
  firewallBlocking: boolean;
}

export const SimpleApiTester = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [tests, setTests] = useState<EndpointTest[]>([
    { name: 'Students', url: 'https://my.jkkn.ac.in/api/api-management/students?page=1&limit=5', status: 'idle' },
    { name: 'Staff', url: 'https://my.jkkn.ac.in/api/api-management/staff?limit=5', status: 'idle' },
    { name: 'Departments', url: 'https://my.jkkn.ac.in/api/api-management/organizations/departments?page=1', status: 'idle' },
    { name: 'Institutions', url: 'https://my.jkkn.ac.in/api/api-management/organizations/institutions', status: 'idle' },
  ]);

  const getApiKey = async () => {
    try {
      console.log('🔑 Fetching API key...');
      const { data, error } = await supabase.functions.invoke('get-secret', {
        body: { name: 'MYJKKN_API_KEY' }
      });

      if (error) {
        throw new Error(`Failed to get API key: ${error.message}`);
      }

      if (!data?.value) {
        throw new Error('MYJKKN_API_KEY not found in secrets');
      }

      console.log(`✅ Got API key: ${data.value.substring(0, 15)}...`);
      setApiKey(data.value);
      return data.value;
    } catch (error) {
      console.error('❌ API key fetch failed:', error);
      throw error;
    }
  };

  const runDiagnostics = async (key: string) => {
    console.log('🔍 Running comprehensive diagnostics...');
    
    const diagnostics: DiagnosticResult = {
      apiKeyValid: false,
      corsIssues: false,
      networkConnectivity: false,
      serverResponding: false,
      firewallBlocking: false
    };

    // Test 1: Basic connectivity to MyJKKN domain
    try {
      console.log('🌐 Testing basic connectivity...');
      const pingResponse = await fetch('https://my.jkkn.ac.in', { 
        method: 'HEAD',
        mode: 'no-cors' 
      });
      diagnostics.networkConnectivity = true;
      diagnostics.serverResponding = true;
    } catch (error) {
      console.warn('⚠️ Basic connectivity failed:', error);
      diagnostics.networkConnectivity = false;
    }

    // Test 2: Test via edge function to bypass CORS
    try {
      console.log('🔧 Testing via edge function...');
      const { data, error } = await supabase.functions.invoke('auto-sync-on-login', {
        body: { test_connectivity: true }
      });
      
      if (!error && data) {
        diagnostics.apiKeyValid = true;
        diagnostics.corsIssues = false;
      }
    } catch (error) {
      console.warn('⚠️ Edge function test failed:', error);
    }

    setDiagnostics(diagnostics);
    return diagnostics;
  };

  const testEndpoint = async (endpoint: EndpointTest, key: string) => {
    const startTime = Date.now();
    
    setTests(prev => prev.map(t => 
      t.name === endpoint.name 
        ? { 
            ...t, 
            status: 'testing', 
            error: undefined, 
            result: undefined,
            corsError: false,
            authError: false,
            networkError: false
          }
        : t
    ));

    try {
      console.log(`🧪 Testing ${endpoint.name}: ${endpoint.url}`);
      console.log(`🔑 Using key: ${key.substring(0, 15)}...`);

      const response = await fetch(endpoint.url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      console.log(`📊 ${endpoint.name} - Status: ${response.status}, Time: ${responseTime}ms`);

      let result;
      const responseText = await response.text();
      
      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }

      console.log(`📋 ${endpoint.name} response:`, {
        status: response.status,
        ok: response.ok,
        headers: Object.fromEntries([...response.headers.entries()]),
        dataType: typeof result,
        dataStructure: typeof result === 'object' ? Object.keys(result) : 'not object'
      });

      // Analyze response for specific error types
      const isAuthError = response.status === 401 || response.status === 403;
      const isCorsError = false; // CORS would throw in catch block
      const isNetworkError = response.status >= 500;

      if (!response.ok) {
        const errorMsg = typeof result === 'object' && result?.error 
          ? result.error 
          : `HTTP ${response.status}: ${response.statusText}`;
          
        setTests(prev => prev.map(t => 
          t.name === endpoint.name 
            ? { 
                ...t, 
                status: 'error', 
                error: errorMsg,
                responseTime,
                authError: isAuthError,
                networkError: isNetworkError
              }
            : t
        ));
        return;
      }

      // Check data structure
      const dataCount = Array.isArray(result?.data) ? result.data.length : 
                       Array.isArray(result) ? result.length : 
                       result ? 1 : 0;

      setTests(prev => prev.map(t => 
        t.name === endpoint.name 
          ? { 
              ...t, 
              status: 'success', 
              result: `Found ${dataCount} records`,
              responseTime 
            }
          : t
      ));

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ ${endpoint.name} failed:`, error);
      
      // Determine error type
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      const isCorsError = errorMessage.includes('CORS') || errorMessage.includes('cors');
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
      
      setTests(prev => prev.map(t => 
        t.name === endpoint.name 
          ? { 
              ...t, 
              status: 'error', 
              error: errorMessage,
              responseTime,
              corsError: isCorsError,
              networkError: isNetworkError
            }
          : t
      ));
    }
  };

  const testAllEndpoints = async () => {
    try {
      const key = await getApiKey();
      
      // Run diagnostics first
      await runDiagnostics(key);
      
      // Test endpoints sequentially to avoid overwhelming the API
      for (const endpoint of tests) {
        await testEndpoint(endpoint, key);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('❌ Testing failed:', error);
      alert(`Failed to start testing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = (status: EndpointTest['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'testing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDiagnosticBadge = (test: EndpointTest) => {
    if (test.corsError) return <Badge variant="destructive" className="ml-2">CORS Issue</Badge>;
    if (test.authError) return <Badge variant="destructive" className="ml-2">Auth Error</Badge>;
    if (test.networkError) return <Badge variant="destructive" className="ml-2">Network Error</Badge>;
    return null;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>MyJKKN API Endpoint Tester</CardTitle>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Test connectivity to all MyJKKN API endpoints
          </p>
          <Button onClick={testAllEndpoints} disabled={tests.some(t => t.status === 'testing')}>
            {tests.some(t => t.status === 'testing') ? 'Testing...' : 'Test All Endpoints'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {diagnostics && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>System Diagnostics:</strong>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div className={diagnostics.networkConnectivity ? 'text-green-600' : 'text-red-600'}>
                  Network: {diagnostics.networkConnectivity ? '✅ Connected' : '❌ Failed'}
                </div>
                <div className={diagnostics.serverResponding ? 'text-green-600' : 'text-red-600'}>
                  Server: {diagnostics.serverResponding ? '✅ Responding' : '❌ Unavailable'}
                </div>
                <div className={diagnostics.apiKeyValid ? 'text-green-600' : 'text-red-600'}>
                  API Key: {diagnostics.apiKeyValid ? '✅ Valid' : '❌ Invalid/Expired'}
                </div>
                <div className={!diagnostics.corsIssues ? 'text-green-600' : 'text-red-600'}>
                  CORS: {!diagnostics.corsIssues ? '✅ No Issues' : '❌ Blocked'}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {apiKey && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>API Key:</strong> {apiKey.substring(0, 20)}...
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {tests.map((test) => (
            <div key={test.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(test.status)}
                  <h3 className="font-semibold">{test.name}</h3>
                  {test.status === 'success' && <Badge variant="secondary" className="bg-green-100 text-green-800">Success</Badge>}
                  {test.status === 'error' && <Badge variant="destructive">Error</Badge>}
                  {test.status === 'warning' && <Badge variant="outline" className="border-yellow-500 text-yellow-700">Warning</Badge>}
                  {test.status === 'testing' && <Badge variant="outline">Testing...</Badge>}
                  {getDiagnosticBadge(test)}
                </div>
                {test.responseTime && (
                  <span className="text-sm text-muted-foreground">{test.responseTime}ms</span>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                <code className="bg-muted px-2 py-1 rounded text-xs break-all">
                  {test.url}
                </code>
              </div>
              
              {test.result && (
                <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                  ✅ {test.result}
                </div>
              )}
              
              {test.error && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  ❌ {test.error}
                </div>
              )}
            </div>
          ))}
        </div>

        {tests.some(t => t.status === 'error') && (
          <Alert variant="destructive" className="mt-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Detected Issues & Solutions:</strong>
              <ul className="list-disc ml-4 mt-1">
                {tests.some(t => t.corsError) && (
                  <li><strong>CORS Policy Restriction:</strong> Browser blocking cross-origin requests. Use the sync function instead of direct API calls.</li>
                )}
                {tests.some(t => t.authError) && (
                  <li><strong>Authentication Failed:</strong> API key invalid or expired. Update the MYJKKN_API_KEY secret in Supabase settings.</li>
                )}
                {tests.some(t => t.networkError) && (
                  <li><strong>Network/Server Issues:</strong> MyJKKN API server may be down or experiencing issues. Try again later.</li>
                )}
                {!diagnostics?.networkConnectivity && (
                  <li><strong>Connectivity Issues:</strong> Unable to reach MyJKKN servers. Check internet connection or firewall settings.</li>
                )}
                <li><strong>Recommended:</strong> Use the "Trigger Manual Sync" button in Student Demo page which bypasses browser limitations.</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};