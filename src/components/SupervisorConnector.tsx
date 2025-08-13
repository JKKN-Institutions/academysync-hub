import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Calendar, BarChart3, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStaffData } from '@/hooks/useStaffData';
import { useAssignments } from '@/hooks/useAssignments';
import { useToast } from '@/hooks/use-toast';

interface SupervisorConnectorProps {
  assignmentId: string;
  currentSupervisorId?: string;
  onSupervisorAssigned?: (supervisorId: string) => void;
}

const SupervisorConnector: React.FC<SupervisorConnectorProps> = ({
  assignmentId,
  currentSupervisorId,
  onSupervisorAssigned
}) => {
  const [selectedSupervisor, setSelectedSupervisor] = useState(currentSupervisorId || '');
  const [showConnector, setShowConnector] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'pending' | 'connected' | 'failed'>('pending');
  
  const { staff } = useStaffData();
  const { updateAssignment } = useAssignments();
  const { toast } = useToast();

  // Filter staff for potential supervisors (department heads, deans, etc.)
  const potentialSupervisors = staff.filter(member => 
    member.designation?.toLowerCase().includes('head') ||
    member.designation?.toLowerCase().includes('dean') ||
    member.designation?.toLowerCase().includes('director') ||
    member.designation?.toLowerCase().includes('supervisor') ||
    member.designation?.toLowerCase().includes('coordinator')
  );

  const currentSupervisor = staff.find(s => s.id === currentSupervisorId);

  const handleAssignSupervisor = async () => {
    if (!selectedSupervisor) {
      toast({
        title: 'No Supervisor Selected',
        description: 'Please select a supervisor before connecting.',
        variant: 'destructive'
      });
      return;
    }

    try {
      setConnectionStatus('pending');
      
      // Update assignment with supervisor
      const result = await updateAssignment(assignmentId, {
        assignment_metadata: {
          supervisor_id: selectedSupervisor,
          created_via: 'supervisor_assignment',
          is_fresh_assignment: true
        }
      });

      if (result.success) {
        setConnectionStatus('connected');
        onSupervisorAssigned?.(selectedSupervisor);
        
        toast({
          title: 'Supervisor Connected',
          description: 'Supervisor has been successfully assigned to oversee this mentoring relationship.',
        });

        // Send notification to supervisor (in real app)
        console.log('Sending notification to supervisor:', selectedSupervisor);
        
        setShowConnector(false);
      } else {
        setConnectionStatus('failed');
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast({
        title: 'Connection Failed',
        description: 'Failed to connect supervisor. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const renderSupervisorOverview = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Supervisor Overview</h3>
        {currentSupervisor && (
          <Badge variant="outline" className="bg-green-50 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        )}
      </div>

      {currentSupervisor ? (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={currentSupervisor.avatar} />
                <AvatarFallback>
                  {currentSupervisor.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold">{currentSupervisor.name}</h4>
                <p className="text-sm text-muted-foreground">{currentSupervisor.designation}</p>
                <p className="text-sm text-muted-foreground">{currentSupervisor.department}</p>
              </div>
              <div className="text-right">
                <Button variant="outline" size="sm">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No supervisor assigned to this mentoring relationship.</p>
            <Button onClick={() => setShowConnector(true)}>
              <Users className="w-4 h-4 mr-2" />
              Assign Supervisor
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSupervisorSelection = () => (
    <div className="space-y-4">
      <div>
        <h4 className="font-semibold mb-2">Select Supervisor</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a faculty member to oversee and support this mentoring relationship.
        </p>
        
        <Select value={selectedSupervisor} onValueChange={setSelectedSupervisor}>
          <SelectTrigger>
            <SelectValue placeholder="Select a supervisor..." />
          </SelectTrigger>
          <SelectContent>
            {potentialSupervisors.map(supervisor => (
              <SelectItem key={supervisor.id} value={supervisor.id}>
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="font-medium">{supervisor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {supervisor.designation} • {supervisor.department}
                    </p>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedSupervisor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Supervisor Responsibilities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Monitor mentoring relationship progress</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Provide guidance to mentor when needed</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Ensure proper functioning of the mentoring process</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Intervene if issues arise</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Review mentoring outcomes and reports</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSupervisorDashboard = () => (
    <div className="space-y-4">
      <h4 className="font-semibold">Supervisor Dashboard</h4>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Last Review</p>
                    <p className="text-xs text-muted-foreground">2 weeks ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Progress Rating</p>
                    <p className="text-xs text-muted-foreground">Excellent (4.8/5)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="communication" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Communication tools and channels for supervisor oversight will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                Mentoring progress reports and analytics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  return (
    <div className="space-y-4">
      {renderSupervisorOverview()}
      
      {currentSupervisor && renderSupervisorDashboard()}

      <Dialog open={showConnector} onOpenChange={setShowConnector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Supervisor</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {renderSupervisorSelection()}
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowConnector(false)}>
                Cancel
              </Button>
              <Button onClick={handleAssignSupervisor} disabled={!selectedSupervisor}>
                Connect Supervisor
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupervisorConnector;