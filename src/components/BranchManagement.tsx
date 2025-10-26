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
import { Building2, MapPin, Users, Plus, Search, Pencil, Eye, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import { mockBranches } from '../lib/mockData';
import { Branch } from '../types';
import { toast } from 'sonner@2.0.3';

const STORAGE_KEY = 'workflow_system_branches';

export function BranchManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isMetricViewOpen, setIsMetricViewOpen] = useState(false);
  const [metricViewType, setMetricViewType] = useState<'total' | 'active' | 'staff'>('total');
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    manager: '',
    staff: 0,
    status: 'active' as 'active' | 'inactive'
  });

  // Load branches from localStorage or use mock data
  useEffect(() => {
    const savedBranches = localStorage.getItem(STORAGE_KEY);
    if (savedBranches) {
      try {
        setBranches(JSON.parse(savedBranches));
      } catch (error) {
        console.error('Failed to parse saved branches:', error);
        setBranches(mockBranches);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBranches));
      }
    } else {
      setBranches(mockBranches);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockBranches));
    }
  }, []);

  // Save branches to localStorage whenever they change
  useEffect(() => {
    if (branches.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branches));
    }
  }, [branches]);

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      manager: '',
      staff: 0,
      status: 'active'
    });
  };

  const handleAddBranch = () => {
    if (!formData.name || !formData.location || !formData.manager) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newBranch: Branch = {
      id: `branch-${Date.now()}`,
      ...formData,
      status: 'active' // Always set to active when creating
    };

    setBranches([...branches, newBranch]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Branch added successfully!');
  };

  const handleEditBranch = () => {
    if (!selectedBranch || !formData.name || !formData.location || !formData.manager) {
      toast.error('Please fill in all required fields');
      return;
    }

    setBranches(branches.map(b => 
      b.id === selectedBranch.id ? { ...b, ...formData } : b
    ));
    setIsEditDialogOpen(false);
    setSelectedBranch(null);
    resetForm();
    toast.success('Branch updated successfully!');
  };

  const handleDeleteBranch = () => {
    if (selectedBranch) {
      setBranches(branches.filter(b => b.id !== selectedBranch.id));
      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
      toast.success('Branch deleted successfully!');
    }
  };

  const handleToggleStatus = (branch: Branch) => {
    const newStatus = branch.status === 'active' ? 'inactive' : 'active';
    setBranches(branches.map(b => 
      b.id === branch.id ? { ...b, status: newStatus } : b
    ));
    toast.success(`Branch ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully!`);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      location: branch.location,
      manager: branch.manager,
      staff: branch.staff,
      status: branch.status
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsDeleteDialogOpen(true);
  };

  const openViewSheet = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsViewSheetOpen(true);
  };

  const openMetricView = (type: 'total' | 'active' | 'staff') => {
    setMetricViewType(type);
    setIsMetricViewOpen(true);
  };

  const getMetricViewData = () => {
    switch (metricViewType) {
      case 'total':
        return { title: 'All Branches', branches: branches };
      case 'active':
        return { title: 'Active Branches', branches: branches.filter(b => b.status === 'active') };
      case 'staff':
        return { title: 'Staff Distribution', branches: branches.sort((a, b) => b.staff - a.staff) };
      default:
        return { title: 'Branches', branches: branches };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Branch Management</h2>
          <p className="text-muted-foreground">Manage all branch locations</p>
        </div>
        <Button onClick={openAddDialog} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Branch
        </Button>
      </div>

      {/* Summary Cards - Compact & Clickable */}
      <div className="grid gap-2 md:grid-cols-3">
        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('total')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{branches.length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">All locations</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('active')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Active Branches</CardTitle>
            <Building2 className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{branches.filter(b => b.status === 'active').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Currently operating</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('staff')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{branches.reduce((sum, b) => sum + b.staff, 0)}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Across all branches</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-600" />
            All Branches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Staff Count</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBranches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>{branch.manager}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{branch.staff}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={branch.status === 'active' ? 'default' : 'secondary'}>
                      {branch.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openViewSheet(branch)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openEditDialog(branch)}
                        className="hover:bg-amber-50 hover:text-amber-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleToggleStatus(branch)}
                        className="hover:bg-purple-50 hover:text-purple-600"
                      >
                        {branch.status === 'active' ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => openDeleteDialog(branch)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Branch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>
              Create a new branch location. Fill in all the required information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Branch Name *</Label>
              <Input
                id="add-name"
                placeholder="Enter branch name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-location">Location *</Label>
              <Input
                id="add-location"
                placeholder="Enter location (City, State)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-manager">Manager Name *</Label>
              <Input
                id="add-manager"
                placeholder="Enter manager name"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-staff">Staff Count</Label>
              <Input
                id="add-staff"
                type="number"
                min="0"
                placeholder="Enter number of staff"
                value={formData.staff || ''}
                onChange={(e) => setFormData({ ...formData, staff: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBranch} className="bg-gradient-to-r from-blue-600 to-indigo-600">
              Add Branch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Update the branch information below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Branch Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter branch name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-location">Location *</Label>
              <Input
                id="edit-location"
                placeholder="Enter location (City, State)"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-manager">Manager Name *</Label>
              <Input
                id="edit-manager"
                placeholder="Enter manager name"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-staff">Staff Count</Label>
              <Input
                id="edit-staff"
                type="number"
                min="0"
                placeholder="Enter number of staff"
                value={formData.staff || ''}
                onChange={(e) => setFormData({ ...formData, staff: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditBranch} className="bg-gradient-to-r from-amber-600 to-orange-600">
              Update Branch
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
              This will permanently delete the branch "{selectedBranch?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBranch} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Branch Sheet */}
      {/* View Branch Dialog */}
      <Dialog open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Branch Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this branch
            </DialogDescription>
          </DialogHeader>
          {selectedBranch && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Branch Name</p>
                  <p className="font-medium">{selectedBranch.name}</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <p className="truncate">{selectedBranch.location}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-muted-foreground mb-1">Manager</p>
                  <p className="truncate">{selectedBranch.manager}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-muted-foreground mb-1">Staff Count</p>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-orange-600" />
                    <p>{selectedBranch.staff} employees</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge 
                    variant={selectedBranch.status === 'active' ? 'default' : 'secondary'}
                    className={selectedBranch.status === 'active' ? 'bg-green-500' : ''}
                  >
                    {selectedBranch.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                  <p className="text-xs text-muted-foreground mb-1">Branch ID</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">{selectedBranch.id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600" 
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    openEditDialog(selectedBranch);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Branch
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    handleToggleStatus(selectedBranch);
                  }}
                >
                  {selectedBranch.status === 'active' ? 'Deactivate' : 'Activate'}
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
              <Building2 className="h-5 w-5 text-blue-600" />
              {getMetricViewData().title}
            </DialogTitle>
            <DialogDescription>
              {metricViewType === 'total' && `Showing all ${branches.length} branches`}
              {metricViewType === 'active' && `${branches.filter(b => b.status === 'active').length} branches currently operating`}
              {metricViewType === 'staff' && `Total of ${branches.reduce((sum, b) => sum + b.staff, 0)} staff members across all branches`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-200">
              {getMetricViewData().branches.map((branch) => (
                <div 
                  key={branch.id}
                  className="py-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    setIsMetricViewOpen(false);
                    openViewSheet(branch);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium truncate">{branch.name}</h4>
                        <Badge 
                          variant={branch.status === 'active' ? 'default' : 'secondary'}
                          className={`flex-shrink-0 ${branch.status === 'active' ? 'bg-green-500' : ''}`}
                        >
                          {branch.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {branch.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {branch.staff} staff
                        </span>
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
