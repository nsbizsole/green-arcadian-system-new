import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', address: '', customer_type: 'retail', notes: ''
  });

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API}/admin/customers`);
      setCustomers(response.data);
    } catch (error) {
      toast.error('Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await axios.put(`${API}/admin/customers/${editingCustomer.id}`, formData);
        toast.success('Customer updated');
      } else {
        await axios.post(`${API}/admin/customers`, formData);
        toast.success('Customer added');
      }
      setDialogOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to save customer');
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name, email: customer.email || '', phone: customer.phone || '',
      company: customer.company || '', address: customer.address || '',
      customer_type: customer.customer_type, notes: customer.notes || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (customerId) => {
    if (!window.confirm('Delete this customer?')) return;
    try {
      await axios.delete(`${API}/admin/customers/${customerId}`);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', company: '', address: '', customer_type: 'retail', notes: '' });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="customers-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">Customers</h1>
          <p className="text-primary/60 font-ui">Manage your customer database</p>
        </div>
        <Button className="btn-primary gap-2" onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="add-customer-btn">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
        <Input placeholder="Search customers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-primary/10" />
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">Customer</TableHead>
              <TableHead className="text-primary/60 font-ui">Contact</TableHead>
              <TableHead className="text-primary/60 font-ui">Type</TableHead>
              <TableHead className="text-primary/60 font-ui">Orders</TableHead>
              <TableHead className="text-primary/60 font-ui text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </TableCell></TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-primary/60">No customers found</TableCell></TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="border-primary/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{customer.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-primary">{customer.name}</p>
                        {customer.company && <p className="text-xs text-primary/60">{customer.company}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-primary">{customer.email}</p>
                    <p className="text-xs text-primary/60">{customer.phone}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-primary/20 capitalize">{customer.customer_type}</Badge>
                  </TableCell>
                  <TableCell className="text-primary">{customer.total_orders || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(customer)}>
                        <Edit className="w-4 h-4 text-primary/60" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(customer.id)}>
                        <Trash2 className="w-4 h-4 text-terracotta" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-ui text-primary">{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-paper border-primary/10" required />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-paper border-primary/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-paper border-primary/10" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-paper border-primary/10" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Customer Type</Label>
              <Select value={formData.customer_type} onValueChange={(v) => setFormData({ ...formData, customer_type: v })}>
                <SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="retail">Retail</SelectItem>
                  <SelectItem value="wholesale">Wholesale</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-paper border-primary/10" rows={2} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="btn-primary">{editingCustomer ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Customers;
