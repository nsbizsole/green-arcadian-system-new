import { useState } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Handshake, User, LogOut, Menu, Leaf, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const navItems = [
  { path: '/partner', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/partner/deals', icon: Handshake, label: 'My Deals' },
  { path: '/partner/profile', icon: User, label: 'Profile' },
];

const PartnerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen bg-paper flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-primary/10 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-ui font-bold text-primary">Green Arcadian</h1>
                <p className="text-xs text-primary/60">Partner Portal</p>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => (
                <NavLink key={item.path} to={item.path} end={item.exact} onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-ui text-sm ${isActive ? 'bg-primary text-white' : 'text-primary/70 hover:bg-primary/5'}`}>
                  {({ isActive }) => (<><item.icon className="w-5 h-5" /><span className="flex-1">{item.label}</span>{isActive && <ChevronRight className="w-4 h-4" />}</>)}
                </NavLink>
              ))}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-primary/10">
            <div className="flex items-center gap-3 mb-4 p-3 bg-surface/50 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-primary font-bold">{user?.full_name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{user?.full_name}</p>
                <p className="text-xs text-primary/60">Sales Partner</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-primary/60" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 h-16 bg-paper/80 backdrop-blur-sm border-b border-primary/10">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden text-primary" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </Button>
            <Link to="/" target="_blank" className="ml-auto text-sm text-primary/60 hover:text-primary flex items-center gap-1">
              <ExternalLink className="w-4 h-4" /> View Website
            </Link>
          </div>
        </header>
        <div className="p-4 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
};

export default PartnerLayout;
