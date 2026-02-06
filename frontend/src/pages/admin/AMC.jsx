import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, CalendarClock, DollarSign, Eye, FileText, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const serviceTypes = ['Lawn Care', 'Garden Maintenance', 'Irrigation Check', 'Pest Control', 'Pruning', 'Full Service'];
const frequencies = ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'];

const AdminAMC = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [form, setForm] = useState({
    client_name: '', client_email: '', client_phone: '', service_type: 'Full Service',
    frequency: 'monthly', amount: '', start_date: '', property_address: '', services_included: [], notes: ''
  });

  useEffect(() => { fetchSubscriptions(); }, [statusFilter]);

  const fetchSubscriptions = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await axios.get(`${API}/amc${params}`);
      setSubscriptions(res.data);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/amc`, { ...form, amount: parseFloat(form.amount) });
      toast.success('AMC subscription created!');
      setDialogOpen(false);
      resetForm();
      fetchSubscriptions();
    } catch (e) { toast.error('Failed to create'); }
  };

  const openDetail = async (sub) => {
    try {
      const res = await axios.get(`${API}/amc/${sub.id}`);
      setSelectedSub(res.data);
      setDetailOpen(true);
    } catch (e) { toast.error('Failed to load'); }
  };

  const generateInvoice = async (id) => {
    try {
      await axios.post(`${API}/amc/${id}/invoice`);
      toast.success('Invoice generated!');
      if (selectedSub?.id === id) openDetail({ id });
    } catch (e) { toast.error('Failed to generate invoice'); }
  };

  const resetForm = () => setForm({ client_name: '', client_email: '', client_phone: '', service_type: 'Full Service', frequency: 'monthly', amount: '', start_date: '', property_address: '', services_included: [], notes: '' });

  const mrr = subscriptions.filter(s => s.status === 'active').reduce((sum, s) => {
    const amt = s.amount || 0;
    if (s.frequency === 'monthly') return sum + amt;
    if (s.frequency === 'quarterly') return sum + amt / 3;
    if (s.frequency === 'yearly') return sum + amt / 12;
    return sum + amt;
  }, 0);

  return (
    <div className="space-y-6" data-testid="admin-amc-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-ui text-2xl font-bold text-primary">AMC Subscriptions</h1><p className="text-primary/60 font-ui">Manage maintenance contracts and auto-scheduling</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="w-4 h-4" />New Subscription</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><CalendarClock className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Active Subscriptions</p><p className="text-xl font-bold text-primary">{subscriptions.filter(s => s.status === 'active').length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Monthly Recurring</p><p className="text-xl font-bold text-primary">${mrr.toLocaleString()}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">Total Subscriptions</p><p className="text-xl font-bold text-primary">{subscriptions.length}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="suspended">Suspended</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">Contract</TableHead>
            <TableHead className="text-primary/60">Client</TableHead>
            <TableHead className="text-primary/60">Service</TableHead>
            <TableHead className="text-primary/60">Frequency</TableHead>
            <TableHead className="text-primary/60">Amount</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : subscriptions.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No subscriptions found</TableCell></TableRow>
             : subscriptions.map(sub => (
              <TableRow key={sub.id} className="border-primary/10">
                <TableCell className="font-mono text-sm">{sub.contract_number}</TableCell>
                <TableCell><p className="font-medium text-primary">{sub.client_name}</p><p className="text-xs text-primary/60">{sub.client_email}</p></TableCell>
                <TableCell>{sub.service_type}</TableCell>
                <TableCell className="capitalize">{sub.frequency}</TableCell>
                <TableCell className="font-medium">${sub.amount}</TableCell>
                <TableCell><Badge className={sub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>{sub.status}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => openDetail(sub)}><Eye className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => generateInvoice(sub.id)}><FileText className="w-4 h-4" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">New AMC Subscription</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Client Name *</Label><Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Email *</Label><Input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Phone</Label><Input value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2"><Label>Property Address *</Label><Input value={form.property_address} onChange={e => setForm({...form, property_address: e.target.value})} className="bg-paper border-primary/10" required /></div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Service Type</Label><Select value={form.service_type} onValueChange={v => setForm({...form, service_type: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{serviceTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Frequency</Label><Select value={form.frequency} onValueChange={v => setForm({...form, frequency: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{frequencies.map(f => <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Amount ($) *</Label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="bg-paper border-primary/10" required /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-paper border-primary/10" rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Create Subscription</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">Subscription Details</DialogTitle></DialogHeader>
          {selectedSub && (
            <div className="space-y-6">
              <div className="flex items-center gap-3"><Badge className={selectedSub.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>{selectedSub.status}</Badge><span className="font-mono text-sm text-primary/60">{selectedSub.contract_number}</span></div>
              <div className="grid grid-cols-2 gap-6">
                <div><h4 className="font-medium text-primary mb-2">Client</h4><p className="text-primary/80">{selectedSub.client_name}</p><p className="text-sm text-primary/60">{selectedSub.client_email}</p><p className="text-sm text-primary/60">{selectedSub.property_address}</p></div>
                <div><h4 className="font-medium text-primary mb-2">Contract</h4><p className="text-sm text-primary/60">Service: {selectedSub.service_type}</p><p className="text-sm text-primary/60 capitalize">Frequency: {selectedSub.frequency}</p><p className="text-sm text-primary/60">Amount: ${selectedSub.amount}</p><p className="text-sm text-primary/60">Next Billing: {selectedSub.next_billing_date?.split('T')[0]}</p></div>
              </div>
              {selectedSub.visits?.length > 0 && (<div><h4 className="font-medium text-primary mb-3">Visits ({selectedSub.visits.length})</h4><div className="space-y-2">{selectedSub.visits.map(v => (<div key={v.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg"><span className="text-primary">{v.scheduled_date}</span><Badge variant="outline">{v.status}</Badge></div>))}</div></div>)}
              {selectedSub.invoices?.length > 0 && (<div><h4 className="font-medium text-primary mb-3">Invoices ({selectedSub.invoices.length})</h4><div className="space-y-2">{selectedSub.invoices.map(i => (<div key={i.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg"><div><span className="font-mono text-sm">{i.invoice_number}</span><p className="text-xs text-primary/50">{i.created_at?.split('T')[0]}</p></div><div className="text-right"><span className="font-medium">${i.amount}</span><Badge className={i.status === 'paid' ? 'bg-green-100 text-green-800 ml-2' : 'bg-yellow-100 text-yellow-800 ml-2'}>{i.status}</Badge></div></div>))}</div></div>)}
              <div className="flex gap-3"><Button className="bg-primary hover:bg-primary/90 text-white" onClick={() => generateInvoice(selectedSub.id)}><FileText className="w-4 h-4 mr-2" />Generate Invoice</Button></div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAMC;
