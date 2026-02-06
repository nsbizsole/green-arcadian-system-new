import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Leaf, 
  Users, 
  FolderKanban, 
  CalendarClock,
  ShoppingCart,
  Handshake,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, subtext, icon: Icon, trend, color = 'primary' }) => (
  <Card className="bg-[#0A0A0A] border-white/10 hover:border-primary/30 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-heading font-bold text-white">{value}</p>
          {subtext && (
            <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend >= 0 ? (
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          ) : (
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          )}
          <span className={`text-sm ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-muted-foreground">vs last month</span>
        </div>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl lg:text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Total Plants"
          value={stats?.inventory?.total_plants || 0}
          subtext={`${stats?.inventory?.total_stock || 0} total stock`}
          icon={Leaf}
          trend={12}
        />
        <StatCard
          title="Active Leads"
          value={stats?.crm?.active_leads || 0}
          subtext={`${stats?.crm?.total_leads || 0} total leads`}
          icon={Users}
          trend={8}
        />
        <StatCard
          title="Active Projects"
          value={stats?.projects?.active || 0}
          subtext={`${stats?.projects?.total || 0} total projects`}
          icon={FolderKanban}
          trend={-3}
        />
        <StatCard
          title="AMC Subscriptions"
          value={stats?.amc?.active_subscriptions || 0}
          subtext="Active recurring revenue"
          icon={CalendarClock}
          trend={15}
        />
        <StatCard
          title="Total Orders"
          value={stats?.ecommerce?.total_orders || 0}
          subtext="Online store orders"
          icon={ShoppingCart}
          trend={22}
        />
        <StatCard
          title="Active Partners"
          value={stats?.partners?.active || 0}
          subtext="Commission partners"
          icon={Handshake}
          trend={5}
        />
      </div>

      {/* Alerts */}
      {stats?.inventory?.low_stock_alerts > 0 && (
        <Card className="bg-warning/10 border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Low Stock Alert</p>
                <p className="text-sm text-muted-foreground">
                  {stats.inventory.low_stock_alerts} plants are running low on stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Plant', href: '/dashboard/inventory' },
              { label: 'New Lead', href: '/dashboard/crm' },
              { label: 'Create Project', href: '/dashboard/projects' },
              { label: 'Add Partner', href: '/dashboard/partners' }
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="p-4 bg-white/5 rounded-lg text-center hover:bg-white/10 transition-colors"
              >
                <span className="text-sm text-white">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-[#0A0A0A] border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { text: 'New lead added: Garden Design Project', time: '2 hours ago' },
                { text: 'Stock updated: Monstera Deliciosa +50', time: '4 hours ago' },
                { text: 'Project completed: Riverside Landscaping', time: '1 day ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <div>
                    <p className="text-sm text-white">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
