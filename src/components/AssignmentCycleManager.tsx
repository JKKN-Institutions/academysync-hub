import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Lock, Unlock, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAssignmentCycles } from '@/hooks/useAssignmentCycles';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const AssignmentCycleManager: React.FC = () => {
  const { cycles, activeCycle, loading, isSuperAdmin, createCycle, lockCycle, activateCycle } = useAssignmentCycles();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCycle, setNewCycle] = useState({
    academic_year: '',
    cycle_name: '',
    start_date: '',
    end_date: '',
    status: 'draft' as 'draft' | 'active'
  });

  if (!isSuperAdmin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          Only Super Administrators can manage assignment cycles.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCreateCycle = async () => {
    if (!newCycle.academic_year || !newCycle.cycle_name || !newCycle.start_date || !newCycle.end_date) {
      return;
    }

    const result = await createCycle(newCycle);
    if (result.success) {
      setShowCreateDialog(false);
      setNewCycle({
        academic_year: '',
        cycle_name: '',
        start_date: '',
        end_date: '',
        status: 'draft'
      });
    }
  };

  const getStatusIcon = (status: string, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-4 h-4" />;
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string, isLocked: boolean) => {
    if (isLocked) return 'destructive';
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Assignment Cycles</h2>
          <p className="text-muted-foreground">
            Manage yearly assignment cycles and lock periods
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create New Cycle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Assignment Cycle</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  placeholder="e.g., 2024-2025"
                  value={newCycle.academic_year}
                  onChange={(e) => setNewCycle(prev => ({ ...prev, academic_year: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cycle_name">Cycle Name</Label>
                <Input
                  id="cycle_name"
                  placeholder="e.g., Academic Year 2024-2025 Assignment Cycle"
                  value={newCycle.cycle_name}
                  onChange={(e) => setNewCycle(prev => ({ ...prev, cycle_name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newCycle.start_date}
                    onChange={(e) => setNewCycle(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newCycle.end_date}
                    onChange={(e) => setNewCycle(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={newCycle.status} onValueChange={(value: 'draft' | 'active') => 
                  setNewCycle(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateCycle} className="w-full">
                Create Cycle
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Cycle Alert */}
      {activeCycle && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Active Assignment Cycle</AlertTitle>
          <AlertDescription>
            {activeCycle.cycle_name} ({format(new Date(activeCycle.start_date), 'MMM d, yyyy')} - {format(new Date(activeCycle.end_date), 'MMM d, yyyy')}) is currently active.
          </AlertDescription>
        </Alert>
      )}

      {/* Cycles List */}
      <div className="grid gap-4">
        {cycles.map((cycle) => (
          <Card key={cycle.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>{cycle.cycle_name}</CardTitle>
                    <CardDescription>{cycle.academic_year}</CardDescription>
                  </div>
                </div>
                <Badge variant={getStatusColor(cycle.status, cycle.is_locked)}>
                  <span className="flex items-center space-x-1">
                    {getStatusIcon(cycle.status, cycle.is_locked)}
                    <span>{cycle.is_locked ? 'Locked' : cycle.status}</span>
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{format(new Date(cycle.start_date), 'MMM d, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{format(new Date(cycle.end_date), 'MMM d, yyyy')}</p>
                  </div>
                </div>

                {cycle.is_locked && cycle.locked_at && (
                  <div className="p-3 bg-destructive/10 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      🔒 Locked on {format(new Date(cycle.locked_at), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      No changes can be made to assignments in this cycle.
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {!cycle.is_locked && cycle.status !== 'active' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => activateCycle(cycle.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate
                    </Button>
                  )}
                  {!cycle.is_locked && cycle.status === 'active' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => lockCycle(cycle.id)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Lock Cycle
                    </Button>
                  )}
                  {cycle.is_locked && (
                    <Badge variant="outline" className="text-muted-foreground">
                      <Lock className="w-3 h-3 mr-1" />
                      Permanently Locked
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {cycles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">No assignment cycles created yet.</p>
              <p className="text-muted-foreground mt-2">Create your first yearly assignment cycle to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AssignmentCycleManager;