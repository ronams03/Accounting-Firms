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
import { CalendarIcon, Plus, Search, Pencil, Eye, Trash2, UserCheck, UserX, Clock, User, Building2, Calendar as CalendarClock } from 'lucide-react';
import { mockAttendance, mockBranches } from '../lib/mockData';
import { Attendance } from '../types';
import { toast } from 'sonner@2.0.3';

const STORAGE_KEY = 'workflow_system_attendance';

export function AttendanceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewSheetOpen, setIsViewSheetOpen] = useState(false);
  const [isMetricViewOpen, setIsMetricViewOpen] = useState(false);
  const [metricViewType, setMetricViewType] = useState<'present' | 'late' | 'absent' | 'hours'>('present');
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    branchId: '',
    branchName: '',
    date: '',
    checkIn: '',
    checkOut: '',
    status: 'present' as Attendance['status'],
    hoursWorked: 0
  });

  // Load attendance from localStorage or use mock data
  useEffect(() => {
    const savedAttendance = localStorage.getItem(STORAGE_KEY);
    if (savedAttendance) {
      try {
        setAttendance(JSON.parse(savedAttendance));
      } catch (error) {
        console.error('Failed to parse saved attendance:', error);
        setAttendance(mockAttendance);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAttendance));
      }
    } else {
      setAttendance(mockAttendance);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockAttendance));
    }
  }, []);

  // Save to localStorage whenever attendance changes
  useEffect(() => {
    if (attendance.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attendance));
    }
  }, [attendance]);

  const filteredAttendance = attendance.filter(record =>
    record.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.branchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      userId: '',
      userName: '',
      branchId: '',
      branchName: '',
      date: '',
      checkIn: '',
      checkOut: '',
      status: 'present',
      hoursWorked: 0
    });
  };

  const calculateHours = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 0;
    
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    const diffMinutes = outMinutes - inMinutes;
    return Math.max(0, Math.round((diffMinutes / 60) * 100) / 100);
  };

  const handleAddRecord = () => {
    if (!formData.userName || !formData.branchId || !formData.date || !formData.checkIn || !formData.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
    const hours = calculateHours(formData.checkIn, formData.checkOut);
    
    const newRecord: Attendance = {
      id: `att-${Date.now()}`,
      userId: formData.userId || `user-${Date.now()}`,
      userName: formData.userName,
      branchId: formData.branchId,
      branchName: selectedBranch?.name || formData.branchName,
      date: formData.date,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      status: formData.status,
      hoursWorked: hours
    };

    setAttendance([...attendance, newRecord]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success('Attendance record created successfully!');
  };

  const openEditDialog = (record: Attendance) => {
    setSelectedRecord(record);
    setFormData({
      userId: record.userId,
      userName: record.userName,
      branchId: record.branchId,
      branchName: record.branchName,
      date: record.date,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      status: record.status,
      hoursWorked: record.hoursWorked
    });
    setIsEditDialogOpen(true);
  };

  const handleEditRecord = () => {
    if (!formData.userName || !formData.branchId || !formData.date || !formData.checkIn || !formData.checkOut) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedRecord) {
      const selectedBranch = mockBranches.find(b => b.id === formData.branchId);
      const hours = calculateHours(formData.checkIn, formData.checkOut);
      
      const updatedRecords = attendance.map(r =>
        r.id === selectedRecord.id
          ? { 
              ...r, 
              ...formData, 
              branchName: selectedBranch?.name || formData.branchName,
              hoursWorked: hours
            }
          : r
      );
      setAttendance(updatedRecords);
      setIsEditDialogOpen(false);
      setSelectedRecord(null);
      resetForm();
      toast.success('Attendance record updated successfully!');
    }
  };

  const openDeleteDialog = (record: Attendance) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRecord = () => {
    if (selectedRecord) {
      setAttendance(attendance.filter(r => r.id !== selectedRecord.id));
      setIsDeleteDialogOpen(false);
      setSelectedRecord(null);
      toast.success('Attendance record deleted successfully!');
    }
  };

  const openViewSheet = (record: Attendance) => {
    setSelectedRecord(record);
    setIsViewSheetOpen(true);
  };

  const openMetricView = (type: 'present' | 'late' | 'absent' | 'hours') => {
    setMetricViewType(type);
    setIsMetricViewOpen(true);
  };

  const getMetricViewData = () => {
    switch (metricViewType) {
      case 'present':
        return { title: 'Present Today', records: attendance.filter(r => r.status === 'present') };
      case 'late':
        return { title: 'Late Arrivals', records: attendance.filter(r => r.status === 'late') };
      case 'absent':
        return { title: 'Absent Records', records: attendance.filter(r => r.status === 'absent') };
      case 'hours':
        return { title: 'All Attendance Records', records: attendance };
      default:
        return { title: 'Attendance Records', records: attendance };
    }
  };

  const getStatusBadge = (status: Attendance['status']) => {
    const variants = {
      'present': 'default',
      'late': 'secondary',
      'absent': 'destructive',
      'half-day': 'secondary',
    };
    return variants[status] || 'default';
  };

  const getStatusIcon = (status: Attendance['status']) => {
    switch (status) {
      case 'present':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'half-day':
        return <Clock className="h-4 w-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Attendance['status']) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'late':
        return 'bg-yellow-500';
      case 'absent':
        return 'bg-red-500';
      case 'half-day':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const avgHours = attendance.length > 0 
    ? (attendance.reduce((sum, a) => sum + a.hoursWorked, 0) / attendance.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Attendance Management</h2>
          <p className="text-muted-foreground">Track employee attendance across all branches</p>
        </div>
        <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Record
        </Button>
      </div>

      {/* Summary Cards - Compact & Clickable */}
      <div className="grid gap-2 md:grid-cols-4">
        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('present')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Present Today</CardTitle>
            <UserCheck className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{attendance.filter(a => a.status === 'present').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">On time</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-yellow-500 to-orange-500 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('late')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Late Arrivals</CardTitle>
            <Clock className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{attendance.filter(a => a.status === 'late').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Delayed check-in</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-red-500 to-red-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('absent')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Absent</CardTitle>
            <UserX className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{attendance.filter(a => a.status === 'absent').length}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Not present</p>
          </CardContent>
        </Card>

        <Card 
          className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          onClick={() => openMetricView('hours')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-4">
            <CardTitle className="text-xs text-white/90">Avg. Hours</CardTitle>
            <Clock className="h-4 w-4 text-white/80" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl">{avgHours}</div>
            <p className="text-[10px] text-white/70 mt-0.5">Hours worked</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              Attendance Records
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
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <span>{record.userName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{record.branchName}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.checkIn}</TableCell>
                  <TableCell>{record.checkOut}</TableCell>
                  <TableCell>{record.hoursWorked} hrs</TableCell>
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
              <Plus className="h-5 w-5 text-green-600" />
              Add Attendance Record
            </DialogTitle>
            <DialogDescription>
              Create a new attendance record for an employee.
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
              <Label htmlFor="add-date">Date *</Label>
              <Input
                id="add-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="add-checkin">Check In *</Label>
                <Input
                  id="add-checkin"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="add-checkout">Check Out *</Label>
                <Input
                  id="add-checkout"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: Attendance['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600" onClick={handleAddRecord}>
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
              Edit Attendance Record
            </DialogTitle>
            <DialogDescription>
              Update attendance information for this employee.
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
              <Label htmlFor="edit-date">Date *</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-checkin">Check In *</Label>
                <Input
                  id="edit-checkin"
                  type="time"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-checkout">Check Out *</Label>
                <Input
                  id="edit-checkout"
                  type="time"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: Attendance['status']) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="present">Present</SelectItem>
                  <SelectItem value="late">Late</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="half-day">Half Day</SelectItem>
                </SelectContent>
              </Select>
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
              This will permanently delete the attendance record for "{selectedRecord?.userName}" on {selectedRecord?.date}. This action cannot be undone.
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
              <CalendarIcon className="h-5 w-5 text-green-600" />
              Attendance Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this attendance record
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <p className="text-xs text-muted-foreground mb-1">Employee Name</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    <p className="font-medium truncate">{selectedRecord.userName}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-muted-foreground mb-1">Branch</p>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <p className="truncate">{selectedRecord.branchName}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-muted-foreground mb-1">Date</p>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4 text-purple-600" />
                    <p>{selectedRecord.date}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-muted-foreground mb-1">Check In</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <p>{selectedRecord.checkIn}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-muted-foreground mb-1">Check Out</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <p>{selectedRecord.checkOut}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                  <p className="text-xs text-muted-foreground mb-1">Hours Worked</p>
                  <p className="font-medium">{selectedRecord.hoursWorked}h</p>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRecord.status)}
                    <Badge variant={getStatusBadge(selectedRecord.status) as any} className={getStatusColor(selectedRecord.status)}>
                      {selectedRecord.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200">
                <p className="text-xs text-muted-foreground mb-1">Record ID</p>
                <p className="text-xs font-mono text-muted-foreground">{selectedRecord.id}</p>
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

      {/* Metric View Dialog */}
      <Dialog open={isMetricViewOpen} onOpenChange={setIsMetricViewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-green-600" />
              {getMetricViewData().title}
            </DialogTitle>
            <DialogDescription>
              {metricViewType === 'present' && `${attendance.filter(r => r.status === 'present').length} employees present`}
              {metricViewType === 'late' && `${attendance.filter(r => r.status === 'late').length} employees arrived late`}
              {metricViewType === 'absent' && `${attendance.filter(r => r.status === 'absent').length} employees absent`}
              {metricViewType === 'hours' && `Showing all ${attendance.length} attendance records`}
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
                      {getStatusIcon(record.status)}
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
                          <CalendarClock className="h-3 w-3" />
                          {record.date}
                        </span>
                        <span>{record.hoursWorked}h</span>
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
