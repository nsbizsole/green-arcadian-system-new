import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Package, FolderKanban, ShoppingCart, CalendarClock, Handshake, DollarSign, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, subtext, icon: Icon, color = 'primary' }) => (
  <Card className="bg-white border-primary/5 hover:border-primary/20 transition-colors">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-primary/60 mb-1 font-ui">{title}</p>
          <p className="text-3xl font-ui font-bold text-primary">{value}</p>
          {subtext && <p className="text-xs text-primary/60 mt-1">{subtext}</p>}
        </div>
        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      <div>
        <h1 className="font-ui text-2xl lg:text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-primary/60 font-ui">Welcome to Green Arcadian Admin</p>
      </div>

      {stats?.users?.pending > 0 && (
        <Card className="bg-terracotta/10 border-terracotta/30">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-terracotta" />
            <div>
              <p className="font-medium text-terracotta">Pending Approvals</p>
              <p className="text-sm text-primary/60">{stats.users.pending} user accounts waiting for approval</p>
            </div>
            <a href="/admin/users" className="ml-auto text-sm text-terracotta underline">Review</a>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Users" value={stats?.users?.active || 0} subtext={`${stats?.users?.pending || 0} pending`} icon={Users} />
        <StatCard title="Plant Inventory" value={stats?.inventory?.total_plants || 0} subtext={`${stats?.inventory?.low_stock || 0} low stock`} icon={Package} />
        <StatCard title="Active Projects" value={stats?.projects?.active || 0} subtext={`${stats?.projects?.total || 0} total`} icon={FolderKanban} />
        <StatCard title="Pending Orders" value={stats?.orders?.pending || 0} subtext={`${stats?.orders?.total || 0} total`} icon={ShoppingCart} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="AMC Subscriptions" value={stats?.amc?.active || 0} subtext={`$${(stats?.amc?.mrr || 0).toLocaleString()} MRR`} icon={CalendarClock} />
        <StatCard title="Active Partners" value={stats?.partners?.active || 0} subtext={`$${(stats?.partners?.pending_commissions || 0).toLocaleString()} pending`} icon={Handshake} />
        <StatCard title="Total Revenue" value={`$${(stats?.orders?.total_revenue || 0).toLocaleString()}`} icon={DollarSign} />
        <StatCard title="Inventory Value" value={`$${(stats?.inventory?.total_value || 0).toLocaleString()}`} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-primary/5">
          <CardHeader><CardTitle className="font-ui text-primary flex items-center gap-2"><ShoppingCart className="w-5 h-5" />Recent Orders</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_orders?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                    <div>
                      <p className="font-ui font-medium text-primary">{order.order_number}</p>
                      <p className="text-sm text-primary/60">{order.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-ui font-bold text-primary">${order.total}</p>
                      <Badge className={order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-primary/60 text-center py-8">No recent orders</p>}
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/5">
          <CardHeader><CardTitle className="font-ui text-primary flex items-center gap-2"><Users className="w-5 h-5" />Recent Signups</CardTitle></CardHeader>
          <CardContent>
            {stats?.recent_users?.length > 0 ? (
              <div className="space-y-3">
                {stats.recent_users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center"><span className="text-primary font-bold">{u.full_name?.charAt(0)}</span></div>
                      <div>
                        <p className="font-ui font-medium text-primary">{u.full_name}</p>
                        <p className="text-xs text-primary/60">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="capitalize" variant="outline">{u.role}</Badge>
                      <Badge className={u.status === 'active' ? 'bg-green-100 text-green-800 ml-2' : u.status === 'pending' ? 'bg-yellow-100 text-yellow-800 ml-2' : 'bg-gray-100 ml-2'}>{u.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-primary/60 text-center py-8">No recent users</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
