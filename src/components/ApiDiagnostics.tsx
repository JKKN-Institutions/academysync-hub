import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Globe, 
  Key, 
  Users, 
  Building2, 
  GraduationCap,
  School
} from 'lucide-react';

interface ApiEndpoint {
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
}

interface TestResult {
  endpoint: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  responseTime?: number;
  statusCode?: number;
  responseData?: any;
}

export const ApiDiagnostics = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const API_BASE_URL = 'https://myadmin.jkkn.ac.in/api';
  const MOBILE_API_BASE_URL = 'https://m.jkkn.ac.in/api';

  const endpoints: ApiEndpoint[] = [
    {
      name: 'Students',
      url: '/api-management/students?page=1&limit=10',
      icon: <GraduationCap className="h-4 w-4" />,
      description: 'Fetch student data with pagination'
    },
    {
      name: 'Staff',
      url: '/api-management/staff?limit=10',
      icon: <Users className="h-4 w-4" />,
      description: 'Fetch staff members'
    },
    {
      name: 'Departments',
      url: '/api-management/organizations/departments?page=1',
      icon: <Building2 className="h-4 w-4" />,
      description: 'Fetch department data'
    },
    {
      name: 'Institutions (Mobile API)',
      url: '/api-management/organizations/institutions',
      icon: <School className="h-4 w-4" />,
      description: 'Fetch institutions from mobile API'
    }
  ];

  const getApiKey = async (): Promise<string> => {
    console.log('🔑 Fetching API key from Supabase secrets...');
    const { data, error } = await supabase.functions.invoke('get-secret', {
      body: { name: 'MYJKKN_API_KEY' }
    });

    if (error) {
      throw new Error(`Failed to retrieve API key: ${error.message}`);
    }

    if (!data?.value) {
      throw new Error('MYJKKN_API_KEY not found in secrets');
    }

    console.log(`✅ API key retrieved: ${data.value.substring(0, 20)}...`);
    return data.value;
  };

  const testEndpoint = async (endpoint: ApiEndpoint, apiKey: string): Promise<TestResult> => {
    const startTime = Date.now();
    const baseUrl = endpoint.name.includes('Mobile API') ? MOBILE_API_BASE_URL : API_BASE_URL;
    const fullUrl = `${baseUrl}${endpoint.url}`;

    try {
      console.log(`🧪 Testing ${endpoint.name}: ${fullUrl}`);
      console.log(`🔑 Using API key: Bearer ${apiKey.substring(0, 20)}...`);

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });

      const responseTime = Date.now() - startTime;
      const responseText = await response.text();
      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText;
      }

      console.log(`📊 ${endpoint.name} response:`, {
        status: response.status,
        statusText: response.statusText,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        dataType: typeof responseData,
        dataKeys: typeof responseData === 'object' ? Object.keys(responseData) : null
      });

      if (!response.ok) {
        return {
          endpoint: endpoint.name,
          status: 'error',
          message: `HTTP ${response.status}: ${response.statusText}`,
          responseTime,
          statusCode: response.status,
          responseData: responseData
        };
      }

      // Check if response has expected data structure
      const dataCount = responseData?.data?.length || 0;
      
      return {
        endpoint: endpoint.name,
        status: 'success',
        message: `Success! Found ${dataCount} records in ${responseTime}ms`,
        responseTime,
        statusCode: response.status,
        responseData: responseData
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      console.error(`❌ ${endpoint.name} failed:`, error);

      return {
        endpoint: endpoint.name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime,
        responseData: null
      };
    }
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      // First, get the API key
      console.log('=== STARTING API DIAGNOSTICS ===');
      const key = await getApiKey();
      setApiKey(key);

      // Test each endpoint
      for (const endpoint of endpoints) {
        setTestResults(prev => [...prev, {
          endpoint: endpoint.name,
          status: 'pending',
          message: 'Testing...'
        }]);

        const result = await testEndpoint(endpoint, key);
        
        setTestResults(prev => 
          prev.map(r => r.endpoint === endpoint.name ? result : r)
        );
      }

      console.log('=== API DIAGNOSTICS COMPLETE ===');
    } catch (error) {
      console.error('❌ Diagnostics failed:', error);
      setTestResults(prev => [...prev, {
        endpoint: 'API Key',
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get API key'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: TestResult['status'], statusCode?: number) => {
    switch (status) {
      case 'success': 
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Success {statusCode}</Badge>;
      case 'error': 
        return <Badge variant="destructive">Error {statusCode ? `${statusCode}` : ''}</Badge>;
      case 'pending': 
        return <Badge variant="outline">Testing...</Badge>;
    }
  };

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          <CardTitle>MyJKKN API Diagnostics</CardTitle>
        </div>
        <p className="text-muted-foreground">
          Test all API endpoints and validate connectivity
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              <span className="font-medium">API Configuration</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div><strong>Main API:</strong> {API_BASE_URL}</div>
              <div><strong>Mobile API:</strong> {MOBILE_API_BASE_URL}</div>
              <div><strong>API Key:</strong> {apiKey ? `${apiKey.substring(0, 20)}...` : 'Not loaded'}</div>
            </div>
          </div>
          
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="lg"
          >
            {isRunning ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Run Diagnostics
              </>
            )}
          </Button>
        </div>

        <Separator />

        {testResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Test Results</h3>
            
            <div className="grid gap-4">
              {endpoints.map(endpoint => {
                const result = testResults.find(r => r.endpoint === endpoint.name);
                
                return (
                  <Card key={endpoint.name} className="border-l-4 border-l-muted">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            {endpoint.icon}
                            {result && getStatusIcon(result.status)}
                          </div>
                          
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{endpoint.name}</h4>
                              {result && getStatusBadge(result.status, result.statusCode)}
                            </div>
                            
                            <p className="text-sm text-muted-foreground">
                              {endpoint.description}
                            </p>
                            
                            <code className="text-xs bg-muted px-2 py-1 rounded block">
                              {endpoint.name.includes('Mobile API') ? MOBILE_API_BASE_URL : API_BASE_URL}{endpoint.url}
                            </code>
                            
                            {result && (
                              <div className="text-sm">
                                {result.status === 'error' ? (
                                  <Alert variant="destructive">
                                    <AlertDescription>{result.message}</AlertDescription>
                                  </Alert>
                                ) : (
                                  <div className="text-muted-foreground">
                                    {result.message}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {result?.responseTime && (
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{result.responseTime}ms</div>
                            {result.responseData?.data && (
                              <div className="font-mono text-xs">
                                {Array.isArray(result.responseData.data) 
                                  ? `${result.responseData.data.length} items`
                                  : 'Data received'
                                }
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {testResults.some(r => r.status === 'error') && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Some endpoints failed. Common issues:
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>CORS policy restrictions</li>
                <li>Invalid or expired API key</li>
                <li>Network connectivity issues</li>
                <li>API server temporarily unavailable</li>
                <li>Firewall blocking external requests</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};