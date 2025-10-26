import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { Briefcase, Plus, Search, Pencil, Eye, Trash2, AlertCircle, CheckCircle, Clock, Calendar, User } from 'lucide-react';
import { mockWorkflows, mockBranches } from '../lib/mockData';
import { Workflow } from '../types';
import { toast } from 'sonner@2.0.3';

const STORAGE_KEY = 'workflow_system_workflows';

export function WorkflowMonitoring() {
  const [searchTerm, setSearchTerm] = useState('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isMetricViewOpen, setIsMetricViewOpen] = useState(false);
  const [metricViewType, setMetricViewType] = useState<'total' | 'completed' | 'progress' | 'overdue'>('total');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    branchId: '',
    branchName: '',
    assignedTo: '',
    status: 'pending' as Workflow['status'],
    priority: 'medium' as Workflow['priority'],
    dueDate: '',
    progress: 0
  });

  // Load workflows from localStorage or use mock data
  useEffect(() => {
    const savedWorkflows = localStorage.getItem(STORAGE_KEY);
    if (savedWorkflows) {
      try {
        setWorkflows(JSON.parse(savedWorkflows));
      } catch (error) {
        console.error('Failed to parse saved workflows:', error);
        setWorkflows(mockWorkflows);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockWorkflows));
      }
    } else {
      setWorkflows(mockWorkflows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockWorkflows));
    }
  }, []);

  // Save to localStorage whenever workflows change
  useEffect(() => {
    if (workflows.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
    }
  }, [workflows]);

  const filteredWorkflows = workflows.filter(workflow =>
    workflow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workflow.assignedTo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      title: '',
      branchId: '',
      branchName: '',
      assignedTo: '',
      status: 'pending',
      priority: 'medium',
      dueDate: '',
      progress: 0
    });
  };

  const handleAddWorkflow = () => {
    if (!formData.title || !formData.branchId || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
    const newWorkflow: Workflow = {
      id: `wf-${Date.now()}`,
      ...formData,
      branchName: selectedBranch?.name || formData.branchName,
      status: 'pending', // Always start as pending
      progress: 0 // Always start at 0%
    };

    setWorkflows([...workflows, newWorkflow]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Workflow created successfully!');
  };

  const openEditDialog = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setFormData({
      title: workflow.title,
      branchId: workflow.branchId,
      branchName: workflow.branchName,
      assignedTo: workflow.assignedTo,
      status: workflow.status,
      priority: workflow.priority,
      dueDate: workflow.dueDate,
      progress: workflow.progress
    });
    setIsEditDialogOpen(true);
  };

  const handleEditWorkflow = () => {
    if (!formData.title || !formData.branchId || !formData.assignedTo || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedWorkflow) {
      const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
      const updatedWorkflows = workflows.map(w =>
        w.id === selectedWorkflow.id
          ? { ...w, ...formData, branchName: selectedBranch?.name || formData.branchName }
          : w
      );
      setWorkflows(updatedWorkflows);
      setIsEditDialogOpen(false);
      setSelectedWorkflow(null);
      resetForm();
      toast.success('Workflow updated successfully!');
    }
  };

  const openDeleteDialog = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteWorkflow = () => {
    if (selectedWorkflow) {
      setWorkflows(workflows.filter(w => w.id !== selectedWorkflow.id));
      setIsDeleteDialogOpen(false);
      setSelectedWorkflow(null);
      toast.success('Workflow deleted successfully!');
    }
  };

  const openViewSheet = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsViewSheetOpen(true);
  };

  const openMetricView = (type: 'total' | 'completed' | 'progress' | 'overdue') => {
    setMetricViewType(type);
    setIsMetricViewOpen(true);
  };

  const getMetricViewData = () => {
    switch (metricViewType) {
      case 'total':
        return { title: 'All Workflows', workflows: workflows };
      case 'completed':
        return { title: 'Completed Workflows', workflows: workflows.filter(w => w.status === 'completed') };
      case 'progress':
        return { title: 'In Progress Workflows', workflows: workflows.filter(w => w.status === 'in-progress') };
      case 'overdue':
        return { title: 'Overdue Workflows', workflows: workflows.filter(w => w.status === 'overdue') };
      default:
        return { title: 'Workflows', workflows: workflows };
    }
  };

  const getStatusBadge = (status: Workflow['status']) => {
    const variants = {
      'completed': 'default',
      'in-progress': 'default',
      'pending': 'secondary',
      'overdue': 'destructive',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: Workflow['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getPriorityColor = (priority: Workflow['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: Workflow['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-gray-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Workflow Monitoring</h2>
          <p className="text-muted-foreground">Track and manage workflows across all branches</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {/* Summary Cards - Compact & Clickable */}
      <div className="grid gap-2 md:grid-cols-4">
        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('total')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Workflows</CardTitle>
            <Briefcase className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{workflows.length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Active tasks</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('completed')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{workflows.filter(w => w.status === 'completed').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Finished tasks</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('progress')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{workflows.filter(w => w.status === 'in-progress').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Ongoing work</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('overdue')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{workflows.filter(w => w.status === 'overdue').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              All Workflows
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(workflow.status)}
                      <span>{workflow.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>{workflow.branchName}</TableCell>
                  <TableCell>{workflow.assignedTo}</TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(workflow.priority)}>
                      {workflow.priority.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={workflow.progress} className="w-16" />
                      <span className="text-xs text-muted-foreground">{workflow.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(workflow.status) as any} className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewSheet(workflow)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(workflow)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(workflow)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Workflow Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-600" />
              Create New Workflow
            </DialogTitle>
            <DialogDescription>
              Add a new workflow task. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-title">Workflow Title *</Label>
              <Input
                id="add-title"
                placeholder="Enter workflow title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-branch">Branch *</Label>
              <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.filter(b => b.status === 'active').map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-assigned">Assigned To *</Label>
              <Input
                id="add-assigned"
                placeholder="Enter assignee name"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-priority">Priority *</Label>
              <Select value={formData.priority} onValueChange={(value: Workflow['priority']) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-duedate">Due Date *</Label>
              <Input
                id="add-duedate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600" onClick={handleAddWorkflow}>
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workflow Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Workflow
            </DialogTitle>
            <DialogDescription>
              Update workflow information and track progress.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Workflow Title *</Label>
              <Input
                id="edit-title"
                placeholder="Enter workflow title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-branch">Branch *</Label>
              <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a branch" />
                </SelectTrigger>
                <SelectContent>
                  {mockBranches.filter(b => b.status === 'active').map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assigned">Assigned To *</Label>
              <Input
                id="edit-assigned"
                placeholder="Enter assignee name"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-priority">Priority *</Label>
                <Select value={formData.priority} onValueChange={(value: Workflow['priority']) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status *</Label>
                <Select value={formData.status} onValueChange={(value: Workflow['status']) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-duedate">Due Date *</Label>
              <Input
                id="edit-duedate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-progress">Progress: {formData.progress}%</Label>
              <Input
                id="edit-progress"
                type="range"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600" onClick={handleEditWorkflow}>
              Update Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workflow "{selectedWorkflow?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkflow} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Workflow Dialog */}
      <Dialog open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              Workflow Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this workflow
            </DialogDescription>
          </DialogHeader>
          {selectedWorkflow && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-muted-foreground mb-1">Workflow Title</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedWorkflow.status)}
                    <p className="font-medium truncate">{selectedWorkflow.title}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Branch</p>
                  <p className="truncate">{selectedWorkflow.branchName}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Assigned To</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <p className="truncate">{selectedWorkflow.assignedTo}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <p className="text-xs text-muted-foreground mb-1">Priority</p>
                  <Badge className={getPriorityColor(selectedWorkflow.priority)}>
                    {selectedWorkflow.priority}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={getStatusBadge(selectedWorkflow.status) as any} className={getStatusColor(selectedWorkflow.status)}>
                    {selectedWorkflow.status}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <p>{selectedWorkflow.dueDate}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-muted-foreground mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <Progress value={selectedWorkflow.progress} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{selectedWorkflow.progress}%</span>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <p className="text-xs text-muted-foreground mb-1">Workflow ID</p>
                <p className="text-xs font-mono text-muted-foreground">{selectedWorkflow.id}</p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600" 
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    openEditDialog(selectedWorkflow);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Workflow
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    openDeleteDialog(selectedWorkflow);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Metric View Dialog */}
      <Dialog open={isMetricViewOpen} onOpenChange={setIsMetricViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-600" />
              {getMetricViewData().title}
            </DialogTitle>
            <DialogDescription>
              {metricViewType === 'total' && `Showing all ${workflows.length} workflows`}
              {metricViewType === 'completed' && `${workflows.filter(w => w.status === 'completed').length} workflows completed`}
              {metricViewType === 'progress' && `${workflows.filter(w => w.status === 'in-progress').length} workflows in progress`}
              {metricViewType === 'overdue' && `${workflows.filter(w => w.status === 'overdue').length} workflows overdue`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-200">
              {getMetricViewData().workflows.map((workflow) => (
                <div 
                  key={workflow.id}
                  className="py-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    setIsMetricViewOpen(false);
                    openViewSheet(workflow);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      {getStatusIcon(workflow.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{workflow.title}</h4>
                        <Badge className={`${getPriorityColor(workflow.priority)} flex-shrink-0`}>
                          {workflow.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {workflow.branchName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {workflow.dueDate}
                        </span>
                        <span>{workflow.progress}%</span>
                      </div>
                    </div>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
