import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, Clock, CheckCircle2, Truck, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders/my/all`);
      setOrders(res.data);
    } catch (e) { 
      toast.error('Failed to fetch orders'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: Clock,
    processing: Package,
    shipped: Truck,
    completed: CheckCircle2
  };

  return (
    <div className="space-y-6" data-testid="customer-orders-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">My Orders</h1>
          <p className="text-primary/60">Track and manage your orders</p>
        </div>
        <Link to="/shop">
          <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
            <ShoppingBag className="w-4 h-4" /> Continue Shopping
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Total Orders</p>
                <p className="text-2xl font-bold text-primary">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Shipped</p>
                <p className="text-2xl font-bold text-purple-600">
                  {orders.filter(o => o.status === 'shipped').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader>
          <CardTitle className="font-ui text-primary">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map(order => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <div key={order.id} className="p-4 bg-surface/30 rounded-lg border border-primary/5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <StatusIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-ui font-medium text-primary">{order.order_number}</h4>
                          <p className="text-sm text-primary/60">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={statusColors[order.status]}>{order.status}</Badge>
                            <span className="text-sm text-primary/50">
                              {order.items?.length || 0} item(s)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">${order.total?.toFixed(2)}</p>
                        {order.is_gift && (
                          <Badge variant="outline" className="mt-1">Gift Order</Badge>
                        )}
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-sm text-primary/60 mb-2">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {order.items.slice(0, 3).map((item, idx) => (
                            <span key={idx} className="text-sm bg-primary/5 px-3 py-1 rounded-full text-primary">
                              {item.name} × {item.quantity}
                            </span>
                          ))}
                          {order.items.length > 3 && (
                            <span className="text-sm text-primary/50">
                              +{order.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="font-ui text-lg font-medium text-primary mb-2">No Orders Yet</h3>
              <p className="text-primary/60 mb-4">Start shopping to place your first order!</p>
              <Link to="/shop">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  <ShoppingBag className="w-4 h-4 mr-2" /> Browse Products
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerOrders;
