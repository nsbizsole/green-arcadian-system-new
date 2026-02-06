import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API}/orders/my/all`);
        setOrders(res.data);
      } catch (e) {
        // Silent fail - orders will show empty
      }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, []);

  const statusColors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', completed: 'bg-green-100 text-green-800' };

  return (
    <div className="space-y-8" data-testid="customer-dashboard">
      <div><h1 className="font-ui text-2xl font-bold text-primary">Welcome Back!</h1><p className="text-primary/60">Manage your orders and account</p></div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-primary/5"><CardContent className="p-6"><div className="flex items-center gap-4"><div className="w-14 h-14 rounded-xl bg-accent/20 flex items-center justify-center"><ShoppingBag className="w-7 h-7 text-primary" /></div><div><p className="text-sm text-primary/60">Total Orders</p><p className="text-3xl font-bold text-primary">{orders.length}</p></div></div></CardContent></Card>
        <Card className="bg-accent/10 border-accent/20"><CardContent className="p-6"><Link to="/shop" className="flex items-center justify-between"><div><p className="font-ui font-bold text-primary">Browse Our Collection</p><p className="text-sm text-primary/60">Fresh flowers and plants</p></div><ArrowRight className="w-6 h-6 text-primary" /></Link></CardContent></Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader><CardTitle className="font-ui text-primary">Recent Orders</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>
           : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map(order => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg">
                  <div className="flex items-center gap-3"><Package className="w-5 h-5 text-primary/40" /><div><p className="font-medium text-primary">{order.order_number}</p><p className="text-sm text-primary/60">{new Date(order.created_at).toLocaleDateString()}</p></div></div>
                  <div className="text-right"><p className="font-bold text-primary">${order.total}</p><Badge className={statusColors[order.status]}>{order.status}</Badge></div>
                </div>
              ))}
            </div>
          ) : <div className="text-center py-8"><Package className="w-12 h-12 text-primary/20 mx-auto mb-3" /><p className="text-primary/60">No orders yet</p><Link to="/shop"><Button className="mt-4 bg-primary hover:bg-primary/90 text-white">Start Shopping</Button></Link></div>}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
