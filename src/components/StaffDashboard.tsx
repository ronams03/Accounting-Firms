import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Calendar, Clock, DollarSign, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../types';
import { mockWorkflows, mockAttendance, mockPayroll } from '../lib/mockData';

interface StaffDashboardProps {
  user: User;
}

export function StaffDashboard({ user }: StaffDashboardProps) {
  // Filter data for current staff user
  const myWorkflows = mockWorkflows.filter(w => w.assignedTo === user.name);
  const myAttendance = mockAttendance.filter(a => a.userName === user.name);
  const myPayroll = mockPayroll.find(p => p.userName === user.name);

  const completedWorkflows = myWorkflows.filter(w => w.status === 'completed').length;
  const totalHours = myAttendance.reduce((sum, a) => sum + a.hoursWorked, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2>Welcome back, {user.name}!</h2>
        <p className="text-muted-foreground">Here's your activity overview</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white/90">My Workflows</CardTitle>
            <Briefcase className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{myWorkflows.length}</div>
            <p className="text-xs text-white/70 mt-1">
              {completedWorkflows} completed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white/90">Hours This Week</CardTitle>
            <Clock className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">{totalHours}</div>
            <p className="text-xs text-white/70 mt-1">Total hours worked</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white/90">Attendance Rate</CardTitle>
            <Calendar className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {myAttendance.length > 0 
                ? ((myAttendance.filter(a => a.status === 'present' || a.status === 'late').length / myAttendance.length) * 100).toFixed(0)
                : 0}%
            </div>
            <p className="text-xs text-white/70 mt-1">Last 7 days</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-white/90">Net Salary</CardTitle>
            <DollarSign className="h-5 w-5 text-white/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              ${myPayroll ? myPayroll.netSalary.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-white/70 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* My Workflows */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-indigo-600" />
            My Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {workflow.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : workflow.status === 'overdue' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Clock className="h-4 w-4 text-blue-600" />
                      )}
                      <span>{workflow.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workflow.priority === 'high' ? 'destructive' : 'secondary'}
                    >
                      {workflow.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>{workflow.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={workflow.progress} className="w-16" />
                      <span className="text-xs">{workflow.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={workflow.status === 'completed' ? 'default' : workflow.status === 'overdue' ? 'destructive' : 'secondary'}
                    >
                      {workflow.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Attendance & Payroll */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Recent Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAttendance.slice(0, 5).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.checkIn}</TableCell>
                    <TableCell>{record.checkOut}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : 'secondary'}
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-600" />
              Payroll Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {myPayroll ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Month</span>
                  <span>{myPayroll.month}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span>${myPayroll.baseSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Allowances</span>
                  <span className="text-green-600">+${myPayroll.allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Deductions</span>
                  <span className="text-red-600">-${myPayroll.deductions.toLocaleString()}</span>
                </div>
                <div className="border-t pt-4 flex justify-between items-center">
                  <span>Net Salary</span>
                  <span className="text-xl">${myPayroll.netSalary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={myPayroll.status === 'paid' ? 'default' : 'secondary'}>
                    {myPayroll.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No payroll data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
