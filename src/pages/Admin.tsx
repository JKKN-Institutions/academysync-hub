import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, CheckCircle, Clock, Database, Settings, Shield, RotateCcw } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const { toast } = useToast();
  const [apiConfig, setApiConfig] = useState({
    baseUrl: "",
    apiKey: "",
    isConnected: false,
    lastSync: null as Date | null,
    autoSync: true,
    syncInterval: "24" // hours
  });

  const [fieldMappings] = useState([
    { sourceField: "staff_id", appField: "staffId", required: true, mapped: true },
    { sourceField: "full_name", appField: "name", required: true, mapped: true },
    { sourceField: "email_address", appField: "email", required: true, mapped: true },
    { sourceField: "dept_name", appField: "department", required: false, mapped: true },
    { sourceField: "student_id", appField: "studentId", required: true, mapped: true },
    { sourceField: "roll_number", appField: "rollNo", required: true, mapped: true },
    { sourceField: "program_name", appField: "program", required: true, mapped: true },
    { sourceField: "semester_year", appField: "semesterYear", required: false, mapped: true }
  ]);

  const [syncHistory] = useState([
    {
      id: "1",
      type: "Full Sync",
      timestamp: new Date("2024-01-04T09:15:00"),
      status: "Success",
      summary: { fetched: 245, created: 12, updated: 8, inactivated: 3 }
    },
    {
      id: "2", 
      type: "Incremental Sync",
      timestamp: new Date("2024-01-03T09:15:00"),
      status: "Success",
      summary: { fetched: 15, created: 2, updated: 3, inactivated: 0 }
    }
  ]);

  const handleTestConnection = async () => {
    if (!apiConfig.baseUrl || !apiConfig.apiKey) {
      toast({
        title: "Missing Configuration",
        description: "Please enter both Base URL and API Key",
        variant: "destructive"
      });
      return;
    }

    // Simulate API test
    toast({
      title: "Testing Connection...",
      description: "Validating authentication and required fields"
    });

    setTimeout(() => {
      setApiConfig(prev => ({ ...prev, isConnected: true }));
      toast({
        title: "Connection Successful",
        description: "API authentication validated and required fields confirmed"
      });
    }, 2000);
  };

  const handleFullSync = async () => {
    toast({
      title: "Starting Full Sync",
      description: "Fetching all mentors and students from People API"
    });

    setTimeout(() => {
      setApiConfig(prev => ({ ...prev, lastSync: new Date() }));
      toast({
        title: "Sync Complete",
        description: "Fetched: 245, Created: 12, Updated: 8, Inactivated: 3"
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage system configuration and integrations</p>
        </div>

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="integrations">
              <Database className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Shield className="w-4 h-4 mr-2" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="integrations">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  People Directory Integration
                </CardTitle>
                <CardDescription>
                  Configure connection to external People API for mentor and student data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {apiConfig.isConnected ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                    <div>
                      <p className="font-medium">
                        {apiConfig.isConnected ? "Connected" : "Not Connected"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {apiConfig.lastSync 
                          ? `Last sync: ${apiConfig.lastSync.toLocaleString()}`
                          : "Never synced"
                        }
                      </p>
                    </div>
                  </div>
                  {apiConfig.lastSync && (
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor((Date.now() - apiConfig.lastSync.getTime()) / (1000 * 60 * 60))}h ago
                    </Badge>
                  )}
                </div>

                {/* API Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">Base URL</Label>
                    <Input
                      id="baseUrl"
                      placeholder="https://api.university.edu/people"
                      value={apiConfig.baseUrl}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="••••••••••••••••"
                      value={apiConfig.apiKey}
                      onChange={(e) => setApiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button onClick={handleTestConnection} variant="outline">
                    Test Connection
                  </Button>
                  <Button 
                    onClick={handleFullSync} 
                    disabled={!apiConfig.isConnected}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Run Full Sync
                  </Button>
                </div>

                {/* Auto Sync Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Sync Settings</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="autoSync">Automatic Sync</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable scheduled incremental syncs
                        </p>
                      </div>
                      <Switch
                        id="autoSync"
                        checked={apiConfig.autoSync}
                        onCheckedChange={(checked) => 
                          setApiConfig(prev => ({ ...prev, autoSync: checked }))
                        }
                      />
                    </div>
                    {apiConfig.autoSync && (
                      <div className="space-y-2">
                        <Label htmlFor="syncInterval">Sync Interval (hours)</Label>
                        <Input
                          id="syncInterval"
                          type="number"
                          min="1"
                          max="168"
                          value={apiConfig.syncInterval}
                          onChange={(e) => setApiConfig(prev => ({ ...prev, syncInterval: e.target.value }))}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Field Mapping */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Field Mapping</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source Field</TableHead>
                          <TableHead>App Field</TableHead>
                          <TableHead>Required</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fieldMappings.map((mapping, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {mapping.sourceField}
                            </TableCell>
                            <TableCell>{mapping.appField}</TableCell>
                            <TableCell>
                              {mapping.required && (
                                <Badge variant="secondary" className="text-xs">Required</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {mapping.mapped ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Sync History */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium mb-4">Sync History</h3>
                  <div className="space-y-3">
                    {syncHistory.map((sync) => (
                      <div key={sync.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <Badge variant={sync.status === "Success" ? "default" : "destructive"}>
                              {sync.status}
                            </Badge>
                            <span className="font-medium">{sync.type}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {sync.timestamp.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Fetched: {sync.summary.fetched} • Created: {sync.summary.created} • 
                          Updated: {sync.summary.updated} • Inactivated: {sync.summary.inactivated}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>Configure system-wide preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>View system activity and changes</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Audit logs coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;