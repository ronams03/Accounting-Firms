export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  username: string;
  password: string;
  role: UserRole;
  name: string;
  email: string;
  branchId?: string;
}

export interface Branch {
  id: string;
  name: string;
  location: string;
  manager: string;
  staff: number;
  status: 'active' | 'inactive';
}

export interface Workflow {
  id: string;
  title: string;
  branchId: string;
  branchName: string;
  assignedTo: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  progress: number;
}

export interface Attendance {
  id: string;
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hoursWorked: number;
}

export interface Payroll {
  id: string;
  userId: string;
  userName: string;
  branchId: string;
  branchName: string;
  month: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'processed' | 'paid';
}

export interface Analytics {
  totalBranches: number;
  totalStaff: number;
  totalWorkflows: number;
  completedWorkflows: number;
  attendanceRate: number;
  payrollProcessed: number;
}
