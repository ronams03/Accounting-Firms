import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { AnalyticsOverview } from './components/AnalyticsOverview';
import { BranchManagement } from './components/BranchManagement';
import { WorkflowMonitoring } from './components/WorkflowMonitoring';
import { AttendanceManagement } from './components/AttendanceManagement';
import { PayrollManagement } from './components/PayrollManagement';
import { StaffDashboard } from './components/StaffDashboard';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { 
  BarChart3, 
  Building2, 
  Briefcase, 
  Calendar, 
  DollarSign, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { User } from './types';

type Tab = 'analytics' | 'branches' | 'workflows' | 'attendance' | 'payroll' | 'staff-dashboard';

const STORAGE_KEYS = {
  USER: 'workflow_system_user',
  ACTIVE_TAB: 'workflow_system_active_tab',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
    
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser) as User;
        setCurrentUser(user);
        if (savedTab) {
          setActiveTab(savedTab as Tab);
        } else if (user.role === 'staff') {
          setActiveTab('staff-dashboard');
        } else {
          setActiveTab('analytics');
        }
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
      }
    }
  }, []);

  // Save active tab to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
    }
  }, [activeTab, currentUser]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    const defaultTab = user.role === 'staff' ? 'staff-dashboard' : 'analytics';
    setActiveTab(defaultTab);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, defaultTab);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('analytics');
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB);
  };

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const adminNavItems = [
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'branches' as Tab, label: 'Branches', icon: Building2 },
    { id: 'workflows' as Tab, label: 'Workflows', icon: Briefcase },
    { id: 'attendance' as Tab, label: 'Attendance', icon: Calendar },
    { id: 'payroll' as Tab, label: 'Payroll', icon: DollarSign },
  ];

  const staffNavItems = [
    { id: 'staff-dashboard' as Tab, label: 'Dashboard', icon: BarChart3 },
  ];

  const navItems = currentUser.role === 'admin' ? adminNavItems : staffNavItems;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 flex flex-col shadow-xl ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div className={`flex-1 ${!sidebarOpen ? 'lg:hidden' : ''}`}>
              <h3 className="text-sm text-white">Workflow System</h3>
              <p className="text-xs text-slate-400">{currentUser.role === 'admin' ? 'Admin Portal' : 'Staff Portal'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  // Close sidebar on mobile after selection
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-sidebar-accent hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`text-sm ${!sidebarOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className={`mb-3 p-3 bg-sidebar-accent rounded-lg border border-sidebar-border ${!sidebarOpen ? 'lg:hidden' : ''}`}>
            <p className="text-xs text-slate-400">Signed in as</p>
            <p className="text-sm text-white">{currentUser.name}</p>
            <p className="text-xs text-slate-400">{currentUser.email}</p>
          </div>
          <Button
            variant="outline"
            className="w-full bg-transparent border-slate-600 text-slate-300 hover:bg-sidebar-accent hover:text-white"
            onClick={handleLogout}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={`ml-2 ${!sidebarOpen ? 'lg:hidden' : ''}`}>Sign Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!sidebarOpen ? 'lg:ml-20' : ''}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-slate-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent truncate">
                Multi-Branch Workflow Monitoring System
              </h1>
              <p className="text-xs text-slate-600 hidden sm:block">Integrated Analytics, Attendance & Payroll Management</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {currentUser.role === 'admin' ? (
            <>
              {activeTab === 'analytics' && <AnalyticsOverview />}
              {activeTab === 'branches' && <BranchManagement />}
              {activeTab === 'workflows' && <WorkflowMonitoring />}
              {activeTab === 'attendance' && <AttendanceManagement />}
              {activeTab === 'payroll' && <PayrollManagement />}
            </>
          ) : (
            <StaffDashboard user={currentUser} />
          )}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
