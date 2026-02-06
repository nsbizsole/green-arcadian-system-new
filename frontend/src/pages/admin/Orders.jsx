import { useState, useEffect } from 'react';
import axios from 'axios';
import { Eye, Package } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${API}/admin/orders${params}`);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`${API}/admin/orders/${orderId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6" data-testid="orders-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">Orders</h1>
          <p className="text-primary/60 font-ui">Manage customer orders</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-primary/10">
            <SelectValue placeholder="All Orders" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">Order</TableHead>
              <TableHead className="text-primary/60 font-ui">Customer</TableHead>
              <TableHead className="text-primary/60 font-ui">Items</TableHead>
              <TableHead className="text-primary/60 font-ui">Total</TableHead>
              <TableHead className="text-primary/60 font-ui">Status</TableHead>
              <TableHead className="text-primary/60 font-ui text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-primary/60">No orders found</TableCell></TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="border-primary/10">
                  <TableCell>
                    <p className="font-medium text-primary">{order.order_number}</p>
                    <p className="text-xs text-primary/60">{new Date(order.created_at).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-primary">{order.customer_name}</p>
                    <p className="text-xs text-primary/60">{order.customer_email}</p>
                  </TableCell>
                  <TableCell className="text-primary">{order.items?.length || 0} items</TableCell>
                  <TableCell className="text-primary font-medium">${order.total}</TableCell>
                  <TableCell>
                    <Select value={order.status} onValueChange={(v) => updateStatus(order.id, v)}>
                      <SelectTrigger className={`w-32 ${statusColors[order.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
                      <Eye className="w-4 h-4 text-primary/60" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-ui text-primary">Order {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-primary/60">Customer</p>
                  <p className="text-primary font-medium">{selectedOrder.customer_name}</p>
                </div>
                <div>
                  <p className="text-primary/60">Email</p>
                  <p className="text-primary">{selectedOrder.customer_email}</p>
                </div>
                <div>
                  <p className="text-primary/60">Phone</p>
                  <p className="text-primary">{selectedOrder.customer_phone}</p>
                </div>
                <div>
                  <p className="text-primary/60">Status</p>
                  <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                </div>
              </div>
              <div>
                <p className="text-primary/60 text-sm mb-2">Delivery Address</p>
                <p className="text-primary bg-surface/30 p-3 rounded">{selectedOrder.customer_address}</p>
              </div>
              <div>
                <p className="text-primary/60 text-sm mb-2">Items</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} className="flex justify-between p-3 bg-surface/30 rounded">
                      <div>
                        <p className="text-primary font-medium">{item.name}</p>
                        <p className="text-xs text-primary/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-primary font-medium">${item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-primary/10 pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span className="text-primary">Total</span>
                  <span className="text-primary">${selectedOrder.total}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Orders;
