import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Eye, ShoppingCart, Package, DollarSign, Clock, Truck, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const orderStatuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await axios.get(`${API}/orders${params}`);
      setOrders(res.data);
    } catch (e) { toast.error('Failed to fetch orders'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/orders/${id}/status?status=${status}`);
      toast.success('Order status updated');
      fetchOrders();
      if (selectedOrder?.id === id) {
        setSelectedOrder({ ...selectedOrder, status });
      }
    } catch (e) { toast.error('Failed to update'); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-800', processing: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };
  const statusIcons = { pending: Clock, processing: Package, shipped: Truck, completed: CheckCircle2 };

  const filteredOrders = orders.filter(o => o.order_number?.toLowerCase().includes(search.toLowerCase()) || o.customer_name?.toLowerCase().includes(search.toLowerCase()));
  const stats = { total: orders.length, pending: orders.filter(o => o.status === 'pending').length, revenue: orders.filter(o => ['completed', 'shipped'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0) };

  return (
    <div className="space-y-6" data-testid="admin-orders-page">
      <div><h1 className="font-ui text-2xl font-bold text-primary">Orders</h1><p className="text-primary/60 font-ui">Manage retail and wholesale orders</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><ShoppingCart className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total Orders</p><p className="text-xl font-bold text-primary">{stats.total}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-xs text-primary/60">Pending</p><p className="text-xl font-bold text-yellow-600">{stats.pending}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Truck className="w-8 h-8 text-purple-500" /><div><p className="text-xs text-primary/60">Shipped</p><p className="text-xl font-bold text-purple-600">{orders.filter(o => o.status === 'shipped').length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Revenue</p><p className="text-xl font-bold text-green-600">${stats.revenue.toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-primary/10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem>{orderStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">Order</TableHead>
            <TableHead className="text-primary/60">Customer</TableHead>
            <TableHead className="text-primary/60">Items</TableHead>
            <TableHead className="text-primary/60">Total</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60">Date</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : filteredOrders.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No orders found</TableCell></TableRow>
             : filteredOrders.map(order => (
              <TableRow key={order.id} className="border-primary/10">
                <TableCell><p className="font-mono text-sm font-medium">{order.order_number}</p>{order.is_gift && <Badge variant="outline" className="text-xs">Gift</Badge>}</TableCell>
                <TableCell><p className="font-medium text-primary">{order.customer_name}</p><p className="text-xs text-primary/60">{order.customer_email}</p></TableCell>
                <TableCell>{order.items?.length || 0} items</TableCell>
                <TableCell className="font-bold">${order.total?.toFixed(2)}</TableCell>
                <TableCell><Badge className={statusColors[order.status]}>{order.status}</Badge></TableCell>
                <TableCell className="text-sm text-primary/60">{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">Order {selectedOrder?.order_number}</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="flex items-center gap-3"><Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>{selectedOrder.is_gift && <Badge variant="outline">Gift Order</Badge>}{selectedOrder.order_type && <Badge variant="outline" className="capitalize">{selectedOrder.order_type}</Badge>}</div>
              <div className="grid grid-cols-2 gap-6">
                <div><h4 className="font-medium text-primary mb-2">Customer</h4><p className="text-primary/80">{selectedOrder.customer_name}</p><p className="text-sm text-primary/60">{selectedOrder.customer_email}</p><p className="text-sm text-primary/60">{selectedOrder.customer_phone}</p><p className="text-sm text-primary/60 mt-2">{selectedOrder.customer_address}</p></div>
                <div><h4 className="font-medium text-primary mb-2">Order Summary</h4><div className="space-y-1 text-sm"><p>Subtotal: ${selectedOrder.subtotal?.toFixed(2)}</p>{selectedOrder.discount > 0 && <p>Discount: -${selectedOrder.discount?.toFixed(2)}</p>}<p>Shipping: ${selectedOrder.shipping?.toFixed(2)}</p><p className="font-bold text-lg pt-2">Total: ${selectedOrder.total?.toFixed(2)}</p></div></div>
              </div>
              {selectedOrder.gift_message && <div className="p-4 bg-accent/10 rounded-lg"><h4 className="font-medium text-primary mb-1">Gift Message</h4><p className="text-sm text-primary/70">{selectedOrder.gift_message}</p></div>}
              <div><h4 className="font-medium text-primary mb-3">Items</h4><div className="space-y-2">{selectedOrder.items?.map((item, idx) => (<div key={idx} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg"><div><p className="font-medium text-primary">{item.name}</p><p className="text-sm text-primary/60">Qty: {item.quantity}</p></div><p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p></div>))}</div></div>
              <div><h4 className="font-medium text-primary mb-3">Update Status</h4><div className="flex flex-wrap gap-2">{orderStatuses.map(s => (<Button key={s} size="sm" variant={selectedOrder.status === s ? 'default' : 'outline'} className={selectedOrder.status === s ? 'bg-primary text-white' : ''} onClick={() => updateStatus(selectedOrder.id, s)}>{s}</Button>))}</div></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
