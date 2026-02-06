import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Leaf, 
  Users, 
  FolderKanban, 
  Handshake, 
  CalendarClock,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/dashboard/inventory', icon: Leaf, label: 'Inventory' },
  { path: '/dashboard/crm', icon: Users, label: 'CRM Pipeline' },
  { path: '/dashboard/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/dashboard/partners', icon: Handshake, label: 'Partners' },
  { path: '/dashboard/amc', icon: CalendarClock, label: 'AMC Billing' },
  { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-[#0A0A0A] border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-white">GreenForge</h1>
                <p className="text-xs text-muted-foreground">Business OS</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary/20 text-primary' 
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                      <span className="font-medium">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="w-4 h-4 ml-auto text-primary" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-muted-foreground hover:text-white hover:bg-white/5"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white"
              onClick={() => setSidebarOpen(true)}
              data-testid="mobile-menu-btn"
            >
              <Menu className="w-6 h-6" />
            </Button>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {user?.company_name || 'My Business'}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
