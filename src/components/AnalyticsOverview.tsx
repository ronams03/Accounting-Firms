import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MetricCard } from './MetricCard';
import { Building2, Users, Briefcase, CheckCircle, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockAnalytics, mockBranches, mockWorkflows } from '../lib/mockData';

const workflowData = [
  { name: 'Mon', workflows: 12 },
  { name: 'Tue', workflows: 15 },
  { name: 'Wed', workflows: 18 },
  { name: 'Thu', workflows: 14 },
  { name: 'Fri', workflows: 20 },
  { name: 'Sat', workflows: 8 },
  { name: 'Sun', workflows: 5 },
];

const branchPerformance = [
  { name: 'Downtown', completion: 85 },
  { name: 'Uptown', completion: 92 },
  { name: 'Eastside', completion: 78 },
  { name: 'Westside', completion: 65 },
];

const statusData = [
  { name: 'Completed', value: 28, color: '#10b981' },
  { name: 'In Progress', value: 12, color: '#3b82f6' },
  { name: 'Pending', value: 3, color: '#f59e0b' },
  { name: 'Overdue', value: 2, color: '#ef4444' },
];

export function AnalyticsOverview() {
  const completionRate = ((mockAnalytics.completedWorkflows / mockAnalytics.totalWorkflows) * 100).toFixed(1);

  const handleCardClick = (cardName: string) => {
    console.log(`Clicked on ${cardName} card`);
    // You can add navigation or modal logic here
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Analytics Overview</h2>
        <p className="text-muted-foreground">Monitor system-wide performance and metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Branches"
          value={mockAnalytics.totalBranches}
          subtitle={`${mockBranches.filter(b => b.status === 'active').length} active`}
          icon={Building2}
          gradient="from-blue-500 to-blue-600"
          trend={{ value: '+2', isPositive: true }}
          onClick={() => handleCardClick('Total Branches')}
        />
        
        <MetricCard
          title="Total Staff"
          value={mockAnalytics.totalStaff}
          subtitle="Across all branches"
          icon={Users}
          gradient="from-purple-500 to-purple-600"
          trend={{ value: '+12', isPositive: true }}
          onClick={() => handleCardClick('Total Staff')}
        />
        
        <MetricCard
          title="Active Workflows"
          value={mockAnalytics.totalWorkflows}
          subtitle="In progress"
          icon={Briefcase}
          gradient="from-indigo-500 to-indigo-600"
          trend={{ value: '+5', isPositive: true }}
          onClick={() => handleCardClick('Active Workflows')}
        />
        
        <MetricCard
          title="Completed"
          value={mockAnalytics.completedWorkflows}
          subtitle={`${completionRate}% completion rate`}
          icon={CheckCircle}
          gradient="from-green-500 to-green-600"
          trend={{ value: '+8%', isPositive: true }}
          onClick={() => handleCardClick('Completed')}
        />
        
        <MetricCard
          title="Attendance Rate"
          value={`${mockAnalytics.attendanceRate}%`}
          subtitle="This month"
          icon={Clock}
          gradient="from-orange-500 to-orange-600"
          trend={{ value: '+2.5%', isPositive: true }}
          onClick={() => handleCardClick('Attendance Rate')}
        />
        
        <MetricCard
          title="Payroll Processed"
          value={mockAnalytics.payrollProcessed}
          subtitle="Employees paid"
          icon={DollarSign}
          gradient="from-emerald-500 to-emerald-600"
          trend={{ value: '100%', isPositive: true }}
          onClick={() => handleCardClick('Payroll Processed')}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Weekly Workflow Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={workflowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="workflows" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ fill: '#6366f1', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              Branch Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={branchPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="completion" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-purple-600" />
              Workflow Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm">Workflow completed at Downtown Branch</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm">New staff member joined Uptown Branch</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm">Payroll processed for 75 employees</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5"></div>
                <div className="flex-1">
                  <p className="text-sm">Monthly attendance report generated</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
