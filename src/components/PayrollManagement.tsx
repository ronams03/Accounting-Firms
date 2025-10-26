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
import { DollarSign, Plus, Search, Pencil, Eye, Trash2, TrendingUp, TrendingDown, User, Building2, Calendar } from 'lucide-react';
import { mockPayroll, mockBranches } from '../lib/mockData';
import { Payroll } from '../types';
import { toast } from 'sonner@2.0.3';

const STORAGE_KEY = 'workflow_system_payroll';

export function PayrollManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [payroll, setPayroll] = useState<Payroll[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isMetricViewOpen, setIsMetricViewOpen] = useState(false);
  const [metricViewType, setMetricViewType] = useState<'base' | 'allowances' | 'deductions' | 'net'>('base');
  const [selectedRecord, setSelectedRecord] = useState<Payroll | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    branchId: '',
    branchName: '',
    month: '',
    baseSalary: 0,
    allowances: 0,
    deductions: 0,
    netSalary: 0,
    status: 'pending' as Payroll['status']
  });

  // Load payroll from localStorage or use mock data
  useEffect(() => {
    const savedPayroll = localStorage.getItem(STORAGE_KEY);
    if (savedPayroll) {
      try {
        setPayroll(JSON.parse(savedPayroll));
      } catch (error) {
        console.error('Failed to parse saved payroll:', error);
        setPayroll(mockPayroll);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPayroll));
      }
    } else {
      setPayroll(mockPayroll);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockPayroll));
    }
  }, []);

  // Save to localStorage whenever payroll changes
  useEffect(() => {
    if (payroll.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payroll));
    }
  }, [payroll]);

  // Calculate net salary
  useEffect(() => {
    const net = formData.baseSalary + formData.allowances - formData.deductions;
    setFormData(prev => ({ ...prev, netSalary: net }));
  }, [formData.baseSalary, formData.allowances, formData.deductions]);

  const filteredPayroll = payroll.filter(record =>
    record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      userId: '',
      userName: '',
      branchId: '',
      branchName: '',
      month: '',
      baseSalary: 0,
      allowances: 0,
      deductions: 0,
      netSalary: 0,
      status: 'pending'
    });
  };

  const handleAddRecord = () => {
    if (!formData.userName || !formData.branchId || !formData.month || !formData.baseSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
    const newRecord: Payroll = {
      id: `pay-${Date.now()}`,
      userId: formData.userId || `user-${Date.now()}`,
      userName: formData.userName,
      branchId: formData.branchId,
      branchName: selectedBranch?.name || formData.branchName,
      month: formData.month,
      baseSalary: formData.baseSalary,
      allowances: formData.allowances,
      deductions: formData.deductions,
      netSalary: formData.netSalary,
      status: 'pending'
    };

    setPayroll([...payroll, newRecord]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Payroll record created successfully!');
  };

  const openEditDialog = (record: Payroll) => {
    setSelectedRecord(record);
    setFormData({
      userId: record.userId,
      userName: record.userName,
      branchId: record.branchId,
      branchName: record.branchName,
      month: record.month,
      baseSalary: record.baseSalary,
      allowances: record.allowances,
      deductions: record.deductions,
      netSalary: record.netSalary,
      status: record.status
    });
    setIsEditDialogOpen(true);
  };

  const handleEditRecord = () => {
    if (!formData.userName || !formData.branchId || !formData.month || !formData.baseSalary) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedRecord) {
      const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
      const updatedRecords = payroll.map(r =>
        r.id === selectedRecord.id
          ? { 
              ...r, 
              ...formData, 
              branchName: selectedBranch?.name || formData.branchName
            }
          : r
      );
      setPayroll(updatedRecords);
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      toast.success('Payroll record updated successfully!');
    }
  };

  const openDeleteDialog = (record: Payroll) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRecord = () => {
    if (selectedRecord) {
      setPayroll(payroll.filter(r => r.id !== selectedRecord.id));
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      toast.success('Payroll record deleted successfully!');
    }
  };

  const openViewSheet = (record: Payroll) => {
    setSelectedRecord(record);
    setIsViewSheetOpen(true);
  };

  const openMetricView = (type: 'base' | 'allowances' | 'deductions' | 'net') => {
    setMetricViewType(type);
    setIsMetricViewOpen(true);
  };

  const getMetricViewData = () => {
    const totalBase = payroll.reduce((sum, p) => sum + p.baseSalary, 0);
    const totalAllowances = payroll.reduce((sum, p) => sum + p.allowances, 0);
    const totalDeductions = payroll.reduce((sum, p) => sum + p.deductions, 0);
    const totalNet = payroll.reduce((sum, p) => sum + p.netSalary, 0);

    switch (metricViewType) {
      case 'base':
        return { title: 'Base Salary Records', subtitle: `Total: $${totalBase.toLocaleString()}`, records: payroll };
      case 'allowances':
        return { title: 'Allowances Records', subtitle: `Total: $${totalAllowances.toLocaleString()}`, records: payroll };
      case 'deductions':
        return { title: 'Deductions Records', subtitle: `Total: $${totalDeductions.toLocaleString()}`, records: payroll };
      case 'net':
        return { title: 'Net Payroll Records', subtitle: `Total: $${totalNet.toLocaleString()}`, records: payroll };
      default:
        return { title: 'Payroll Records', subtitle: '', records: payroll };
    }
  };

  const getStatusBadge = (status: Payroll['status']) => {
    const variants = {
      'paid': 'default',
      'processed': 'secondary',
      'pending': 'secondary',
    };
    return variants[status] || 'default';
  };

  const getStatusColor = (status: Payroll['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500';
      case 'processed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const totalBaseSalary = payroll.reduce((sum, p) => sum + p.baseSalary, 0);
  const totalNetSalary = payroll.reduce((sum, p) => sum + p.netSalary, 0);
  const totalAllowances = payroll.reduce((sum, p) => sum + p.allowances, 0);
  const totalDeductions = payroll.reduce((sum, p) => sum + p.deductions, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Payroll Management</h2>
          <p className="text-muted-foreground">Manage employee payroll and compensation</p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-600 to-green-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Payroll
        </Button>
      </div>

      {/* Summary Cards - Compact & Clickable */}
      <div className="grid gap-2 md:grid-cols-4">
        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('base')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Base Salary</CardTitle>
            <DollarSign className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">${totalBaseSalary.toLocaleString()}</div>
            <p className="text-[10px] text-white/70 mt-0.5">This month</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('allowances')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Allowances</CardTitle>
            <TrendingUp className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">${totalAllowances.toLocaleString()}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Additional benefits</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('deductions')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Total Deductions</CardTitle>
            <TrendingDown className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">${totalDeductions.toLocaleString()}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Taxes & others</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('net')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Net Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">${totalNetSalary.toLocaleString()}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Total payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Payroll Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Payroll Records
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or branch..."
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
                <TableHead>Employee</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayroll.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{record.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.branchName}</TableCell>
                  <TableCell>{record.month}</TableCell>
                  <TableCell>${record.baseSalary.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">
                    +${record.allowances.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-red-600">
                    -${record.deductions.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    ${record.netSalary.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(record.status) as any} className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewSheet(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(record)}
                        className="h-8 w-8 p-0"
                      >
                        <Pencil className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(record)}
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

      {/* Add Record Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-600" />
              Add Payroll Record
            </DialogTitle>
            <DialogDescription>
              Create a new payroll record for an employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Employee Name *</Label>
              <Input
                id="add-name"
                placeholder="Enter employee name"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
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
              <Label htmlFor="add-month">Month *</Label>
              <Input
                id="add-month"
                type="month"
                value={formData.month}
                onChange={(e) => {
                  const date = new Date(e.target.value);
                  const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                  setFormData({ ...formData, month: monthName });
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-base">Base Salary *</Label>
              <Input
                id="add-base"
                type="number"
                placeholder="0"
                value={formData.baseSalary || ''}
                onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-allowances">Allowances</Label>
                <Input
                  id="add-allowances"
                  type="number"
                  placeholder="0"
                  value={formData.allowances || ''}
                  onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-deductions">Deductions</Label>
                <Input
                  id="add-deductions"
                  type="number"
                  placeholder="0"
                  value={formData.deductions || ''}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <Label>Net Salary</Label>
              <p className="text-2xl font-semibold mt-1">${formData.netSalary.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-emerald-600 to-green-600" onClick={handleAddRecord}>
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-amber-600" />
              Edit Payroll Record
            </DialogTitle>
            <DialogDescription>
              Update payroll information for this employee.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Employee Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter employee name"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
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
              <Label htmlFor="edit-month">Month *</Label>
              <Input
                id="edit-month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                placeholder="e.g., October 2025"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-base">Base Salary *</Label>
              <Input
                id="edit-base"
                type="number"
                placeholder="0"
                value={formData.baseSalary || ''}
                onChange={(e) => setFormData({ ...formData, baseSalary: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-allowances">Allowances</Label>
                <Input
                  id="edit-allowances"
                  type="number"
                  placeholder="0"
                  value={formData.allowances || ''}
                  onChange={(e) => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-deductions">Deductions</Label>
                <Input
                  id="edit-deductions"
                  type="number"
                  placeholder="0"
                  value={formData.deductions || ''}
                  onChange={(e) => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: Payroll['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processed">Processed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
              <Label>Net Salary</Label>
              <p className="text-2xl font-semibold mt-1">${formData.netSalary.toLocaleString()}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-amber-600 to-orange-600" onClick={handleEditRecord}>
              Update Record
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
              This will permanently delete the payroll record for "{selectedRecord?.userName}" for {selectedRecord?.month}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRecord} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Record Dialog */}
      <Dialog open={isViewSheetOpen} onOpenChange={setIsViewSheetOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Payroll Details
            </DialogTitle>
            <DialogDescription>
              Complete payroll information for this employee
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Employee Name</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <p className="font-medium truncate">{selectedRecord.userName}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Branch</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    <p className="truncate">{selectedRecord.branchName}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-muted-foreground mb-1">Month</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <p className="truncate">{selectedRecord.month}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Base Salary</p>
                  <p className="text-xl font-semibold">${selectedRecord.baseSalary.toLocaleString()}</p>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Allowances</p>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <p className="font-medium text-green-600">+${selectedRecord.allowances.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <p className="text-xs text-muted-foreground mb-1">Deductions</p>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <p className="font-medium text-red-600">-${selectedRecord.deductions.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                  <p className="text-xs text-muted-foreground mb-1">Net Salary</p>
                  <p className="text-xl font-bold text-emerald-700">${selectedRecord.netSalary.toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <Badge variant={getStatusBadge(selectedRecord.status) as any} className={getStatusColor(selectedRecord.status)}>
                    {selectedRecord.status}
                  </Badge>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                  <p className="text-xs text-muted-foreground mb-1">Record ID</p>
                  <p className="text-xs font-mono text-muted-foreground truncate">{selectedRecord.id}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600" 
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    openEditDialog(selectedRecord);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Record
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setIsViewSheetOpen(false);
                    openDeleteDialog(selectedRecord);
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

      {/* Metric View Dialog - List Format */}
      <Dialog open={isMetricViewOpen} onOpenChange={setIsMetricViewOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              {getMetricViewData().title}
            </DialogTitle>
            <DialogDescription>
              {getMetricViewData().subtitle}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-slate-200">
              {getMetricViewData().records.map((record) => (
                <div 
                  key={record.id}
                  className="py-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                  onClick={() => {
                    setIsMetricViewOpen(false);
                    openViewSheet(record);
                  }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg ${getStatusColor(record.status)} flex items-center justify-center flex-shrink-0`}>
                      <DollarSign className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{record.userName}</h4>
                        <Badge variant={getStatusBadge(record.status) as any} className={`${getStatusColor(record.status)} flex-shrink-0`}>
                          {record.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {record.branchName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {record.month}
                        </span>
                        <span className="font-semibold text-emerald-600">${record.netSalary.toLocaleString()}</span>
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
