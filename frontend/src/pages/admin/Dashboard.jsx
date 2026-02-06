import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, 
  ShoppingCart, 
  Users,
  MessageSquare,
  DollarSign,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StatCard = ({ title, value, subtext, icon: Icon, color = 'primary' }) => (
  <Card className="bg-white border-primary/5">
    <CardContent className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-primary/60 mb-1 font-ui">{title}</p>
          <p className="text-3xl font-ui font-bold text-primary">{value}</p>
          {subtext && <p className="text-xs text-primary/60 mt-1">{subtext}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
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
      const response = await axios.get(`${API}/admin/dashboard`);
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
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Header */}
      <div>
        <h1 className="font-ui text-2xl lg:text-3xl font-bold text-primary">Dashboard</h1>
        <p className="text-primary/60 font-ui">Welcome to Green Arcadian Admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <StatCard
          title="Total Products"
          value={stats?.inventory?.total_products || 0}
          subtext={`${stats?.inventory?.low_stock || 0} low stock`}
          icon={Package}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.orders?.pending || 0}
          subtext={`${stats?.orders?.total || 0} total orders`}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Customers"
          value={stats?.customers?.total || 0}
          icon={Users}
        />
        <StatCard
          title="New Inquiries"
          value={stats?.inquiries?.new || 0}
          icon={MessageSquare}
        />
        <StatCard
          title="Total Revenue"
          value={`$${(stats?.revenue?.total || 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard
          title="Low Stock Items"
          value={stats?.inventory?.low_stock || 0}
          icon={AlertTriangle}
        />
      </div>

      {/* Recent Orders */}
      <Card className="bg-white border-primary/5">
        <CardHeader>
          <CardTitle className="font-ui text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders?.length > 0 ? (
            <div className="space-y-4">
              {stats.recent_orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg">
                  <div>
                    <p className="font-ui font-medium text-primary">{order.order_number}</p>
                    <p className="text-sm text-primary/60">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-ui font-bold text-primary">${order.total}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-primary/60 text-center py-8">No recent orders</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
