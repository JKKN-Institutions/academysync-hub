import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, Search, Filter, Eye, Shield, Trash2, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Navigation from '@/components/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { DateRange } from 'react-day-picker';

interface AuditLogEntry {
  id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  actor_id: string;
  actor_name: string;
  timestamp: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  details: Record<string, any> | null;
}

interface AuditFilters {
  entityType: string;
  action: string;
  actor: string;
  dateRange: DateRange | undefined;
  searchTerm: string;
}

const AuditViewer = () => {
  const { user } = useAuth();
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilters>({
    entityType: 'all',
    action: 'all',
    actor: 'all',
    dateRange: undefined,
    searchTerm: ''
  });

  // Mock data for development
  const mockAuditLogs: AuditLogEntry[] = [
    {
      id: '1',
      entity_type: 'counseling_session',
      entity_id: 'session_001',
      action: 'create',
      actor_id: 'user_001',
      actor_name: 'Dr. Sarah Johnson',
      timestamp: new Date().toISOString(),
      old_values: null,
      new_values: { name: 'Career Planning Session', status: 'pending' },
      details: { location: 'Office 204' }
    },
    {
      id: '2',
      entity_type: 'goal',
      entity_id: 'goal_001',
      action: 'update',
      actor_id: 'user_002',
      actor_name: 'Prof. Mike Wilson',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      old_values: { status: 'proposed' },
      new_values: { status: 'active' },
      details: { reason: 'Goal approved by mentor' }
    },
    {
      id: '3',
      entity_type: 'assignment',
      entity_id: 'assign_001',
      action: 'delete',
      actor_id: 'user_001',
      actor_name: 'Dr. Sarah Johnson',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      old_values: { mentor_id: 'mentor_001', student_id: 'student_001' },
      new_values: null,
      details: { reason: 'Student graduation' }
    },
    {
      id: '4',
      entity_type: 'system_setting',
      entity_id: 'setting_001',
      action: 'update',
      actor_id: 'user_003',
      actor_name: 'Admin User',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      old_values: { assignment_mode: 'manual' },
      new_values: { assignment_mode: 'automatic' },
      details: { module: 'Assignment Management' }
    }
  ];

  useEffect(() => {
    // In real implementation, fetch from Supabase
    setAuditLogs(mockAuditLogs);
    setLoading(false);
  }, []);

  const filteredLogs = auditLogs.filter(log => {
    const matchesEntityType = filters.entityType === 'all' || log.entity_type === filters.entityType;
    const matchesAction = filters.action === 'all' || log.action === filters.action;
    const matchesActor = filters.actor === 'all' || log.actor_name.toLowerCase().includes(filters.actor.toLowerCase());
    const matchesSearch = !filters.searchTerm || 
      log.entity_id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.actor_name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const logDate = new Date(log.timestamp);
    const matchesDateRange = !filters.dateRange?.from || 
      (logDate >= filters.dateRange.from && (!filters.dateRange.to || logDate <= filters.dateRange.to));

    return matchesEntityType && matchesAction && matchesActor && matchesSearch && matchesDateRange;
  });

  const handleExportCSV = () => {
    const timestamp = new Date().toISOString();
    const csvData = [
      ['Timestamp', 'Actor', 'Entity Type', 'Entity ID', 'Action', 'Old Values', 'New Values', 'Details'],
      ...filteredLogs.map(log => [
        log.timestamp,
        log.actor_name,
        log.entity_type,
        log.entity_id,
        log.action,
        log.old_values ? JSON.stringify(log.old_values) : '',
        log.new_values ? JSON.stringify(log.new_values) : '',
        log.details ? JSON.stringify(log.details) : ''
      ])
    ];

    const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const filterSummary = `Filters: Entity Type: ${filters.entityType}, Action: ${filters.action}, Actor: ${filters.actor}\nExported: ${timestamp}\n\n`;
    
    const blob = new Blob([filterSummary + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <Plus className="w-4 h-4 text-green-600" />;
      case 'update': return <Edit className="w-4 h-4 text-blue-600" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'view': return <Eye className="w-4 h-4 text-gray-600" />;
      default: return <Shield className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActionBadge = (action: string) => {
    const variants = {
      create: 'default',
      update: 'secondary', 
      delete: 'destructive',
      view: 'outline',
      export: 'secondary'
    } as const;
    
    return (
      <Badge variant={variants[action as keyof typeof variants] || 'outline'}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    );
  };

  const getDeltaSummary = (log: AuditLogEntry) => {
    if (log.action === 'create') {
      const fields = Object.keys(log.new_values || {});
      return `Created with ${fields.length} fields`;
    }
    
    if (log.action === 'update') {
      const changed = Object.keys(log.new_values || {});
      return `Updated ${changed.length} field${changed.length !== 1 ? 's' : ''}: ${changed.join(', ')}`;
    }
    
    if (log.action === 'delete') {
      return 'Entity deleted';
    }
    
    return log.details?.reason || 'No details available';
  };

  if (loading) {
    return (
      <div className="flex min-h-screen">
        <Navigation />
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Navigation />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Log Viewer</h1>
            <p className="text-muted-foreground">
              Complete audit trail of system activities and changes
            </p>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Audit Filters
              </CardTitle>
              <CardDescription>
                Filter audit logs by entity type, action, actor, and date range
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="entity-type">Entity Type</Label>
                  <Select value={filters.entityType} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, entityType: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select entity type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="counseling_session">Counseling Sessions</SelectItem>
                      <SelectItem value="goal">Goals</SelectItem>
                      <SelectItem value="assignment">Assignments</SelectItem>
                      <SelectItem value="meeting_log">Meeting Logs</SelectItem>
                      <SelectItem value="qa_question">Q&A Questions</SelectItem>
                      <SelectItem value="qa_answer">Q&A Answers</SelectItem>
                      <SelectItem value="attachment">Attachments</SelectItem>
                      <SelectItem value="system_setting">System Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">Action</Label>
                  <Select value={filters.action} onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, action: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="view">View</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="search"
                      placeholder="Search by entity ID or actor..."
                      className="pl-10"
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters.dateRange?.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange?.from ? (
                          filters.dateRange.to ? (
                            <>
                              {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                              {format(filters.dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(filters.dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          "Pick a date range"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={filters.dateRange?.from}
                        selected={filters.dateRange}
                        onSelect={(range) => setFilters(prev => ({ ...prev, dateRange: range }))}
                        numberOfMonths={2}
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2 flex-wrap">
                  {filters.entityType !== 'all' && (
                    <Badge variant="secondary">{filters.entityType}</Badge>
                  )}
                  {filters.action !== 'all' && (
                    <Badge variant="secondary">{filters.action}</Badge>
                  )}
                  {filters.searchTerm && (
                    <Badge variant="secondary">Search: {filters.searchTerm}</Badge>
                  )}
                  <Badge variant="outline">{filteredLogs.length} results</Badge>
                </div>

                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Audit Log Table */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Log Entries</CardTitle>
              <CardDescription>
                Detailed audit trail with actor, entity, action, and change summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actor</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Delta Summary</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No audit logs found matching your filters
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                          </TableCell>
                          <TableCell>{log.actor_name}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{log.entity_type}</div>
                              <div className="text-sm text-muted-foreground font-mono">
                                {log.entity_id}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              {getActionBadge(log.action)}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-sm">
                              {getDeltaSummary(log)}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditViewer;