import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Database, Users, GraduationCap, Building2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FetchResult {
  students?: { fetched: number; active: number; synced?: number; syncError?: string };
  staff?: { fetched: number; synced?: number; syncError?: string };
  departments?: { fetched: number; active: number };
  institutions?: { fetched: number };
}

export const MyjkknDataFetcher: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<FetchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async (action: 'fetch' | 'sync', entities?: string[]) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('sync-myjkkn-data', {
        body: { action, entities }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setResults(data.results);
      toast({
        title: "Success!",
        description: data.message,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderEntityCard = (title: string, icon: React.ReactNode, data: any) => {
    if (!data) return null;

    if (data.error) {
      return (
        <Card key={title} className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-destructive">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{data.error}</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card key={title}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data.fetched !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fetched:</span>
                <Badge variant="secondary">{data.fetched}</Badge>
              </div>
            )}
            {data.active !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Active:</span>
                <Badge variant="default">{data.active}</Badge>
              </div>
            )}
            {data.synced !== undefined && (
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Synced:</span>
                <Badge variant="default" className="bg-green-500">{data.synced}</Badge>
              </div>
            )}
            {data.syncError && (
              <div className="text-sm text-destructive mt-2">
                Sync Error: {data.syncError}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            MyJKKN API Data Fetcher
          </CardTitle>
          <CardDescription>
            Fetch and sync data from the MyJKKN API. Your API key is securely stored and ready to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => fetchData('fetch')}
              disabled={loading}
              variant="outline"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              Fetch All Data
            </Button>
            
            <Button
              onClick={() => fetchData('sync')}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
              Fetch & Sync to Database
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => fetchData('fetch', ['students'])}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              Students Only
            </Button>
            
            <Button
              onClick={() => fetchData('fetch', ['staff'])}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Users className="h-4 w-4 mr-1" />
              Staff Only
            </Button>
            
            <Button
              onClick={() => fetchData('fetch', ['departments'])}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Building2 className="h-4 w-4 mr-1" />
              Departments Only
            </Button>
            
            <Button
              onClick={() => fetchData('fetch', ['institutions'])}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              <Building2 className="h-4 w-4 mr-1" />
              Institutions Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {results && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderEntityCard('Students', <GraduationCap className="h-5 w-5" />, results.students)}
          {renderEntityCard('Staff', <Users className="h-5 w-5" />, results.staff)}
          {renderEntityCard('Departments', <Building2 className="h-5 w-5" />, results.departments)}
          {renderEntityCard('Institutions', <Building2 className="h-5 w-5" />, results.institutions)}
        </div>
      )}
    </div>
  );
};