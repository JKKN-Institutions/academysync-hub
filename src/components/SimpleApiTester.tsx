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
  status: 'idle' | 'testing' | 'success' | 'error';
  result?: any;
  error?: string;
  responseTime?: number;
}

export const SimpleApiTester = () => {
  const [apiKey, setApiKey] = useState<string>('');
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

  const testEndpoint = async (endpoint: EndpointTest, key: string) => {
    const startTime = Date.now();
    
    setTests(prev => prev.map(t => 
      t.name === endpoint.name 
        ? { ...t, status: 'testing', error: undefined, result: undefined }
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
                responseTime 
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
      
      setTests(prev => prev.map(t => 
        t.name === endpoint.name 
          ? { 
              ...t, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Network error',
              responseTime 
            }
          : t
      ));
    }
  };

  const testAllEndpoints = async () => {
    try {
      const key = await getApiKey();
      
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
      case 'testing': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
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
                  {test.status === 'testing' && <Badge variant="outline">Testing...</Badge>}
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
              <strong>Common Issues:</strong>
              <ul className="list-disc ml-4 mt-1">
                <li>API server may be down or unreachable</li>
                <li>CORS policy blocking requests from this domain</li>
                <li>Invalid or expired API key</li>
                <li>Network connectivity issues</li>
                <li>Wrong endpoint URLs</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};