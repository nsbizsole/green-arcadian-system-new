import { useState, useEffect } from 'react';
import axios from 'axios';
import { FileQuestion, DollarSign, Clock, Check, Send } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminRFQ = () => {
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [quoteForm, setQuoteForm] = useState({ amount: '', valid_until: '', notes: '' });

  useEffect(() => { fetchRfqs(); }, [statusFilter]);

  const fetchRfqs = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await axios.get(`${API}/rfq${params}`);
      setRfqs(res.data);
    } catch (e) { toast.error('Failed to fetch RFQs'); }
    finally { setLoading(false); }
  };

  const openQuoteDialog = (rfq) => {
    setSelectedRfq(rfq);
    setQuoteForm({ amount: '', valid_until: '', notes: '' });
    setQuoteOpen(true);
  };

  const submitQuote = async () => {
    if (!selectedRfq) return;
    try {
      await axios.put(`${API}/rfq/${selectedRfq.id}/quote?quote_amount=${quoteForm.amount}&valid_until=${quoteForm.valid_until}&notes=${encodeURIComponent(quoteForm.notes)}`);
      toast.success('Quote submitted!');
      setQuoteOpen(false);
      fetchRfqs();
    } catch (e) { toast.error('Failed to submit quote'); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-800', quoted: 'bg-blue-100 text-blue-800', accepted: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
  const stats = { total: rfqs.length, pending: rfqs.filter(r => r.status === 'pending').length, quoted: rfqs.filter(r => r.status === 'quoted').length };

  return (
    <div className="space-y-6" data-testid="admin-rfq-page">
      <div><h1 className="font-ui text-2xl font-bold text-primary">Bulk RFQ</h1><p className="text-primary/60 font-ui">Handle bulk quote requests from B2B clients</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><FileQuestion className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total RFQs</p><p className="text-xl font-bold text-primary">{stats.total}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-xs text-primary/60">Pending</p><p className="text-xl font-bold text-yellow-600">{stats.pending}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Send className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">Quoted</p><p className="text-xl font-bold text-blue-600">{stats.quoted}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="quoted">Quoted</SelectItem><SelectItem value="accepted">Accepted</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">RFQ #</TableHead>
            <TableHead className="text-primary/60">Company</TableHead>
            <TableHead className="text-primary/60">Contact</TableHead>
            <TableHead className="text-primary/60">Items</TableHead>
            <TableHead className="text-primary/60">Delivery</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : rfqs.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No RFQs found</TableCell></TableRow>
             : rfqs.map(rfq => (
              <TableRow key={rfq.id} className="border-primary/10">
                <TableCell className="font-mono text-sm">{rfq.rfq_number}</TableCell>
                <TableCell className="font-medium text-primary">{rfq.company_name}</TableCell>
                <TableCell><p>{rfq.contact_name}</p><p className="text-xs text-primary/60">{rfq.email}</p></TableCell>
                <TableCell>{rfq.items?.length || 0} items</TableCell>
                <TableCell className="text-sm">{new Date(rfq.delivery_date).toLocaleDateString()}</TableCell>
                <TableCell><Badge className={statusColors[rfq.status]}>{rfq.status}</Badge>{rfq.quote_amount && <p className="text-xs text-primary/60 mt-1">${rfq.quote_amount.toLocaleString()}</p>}</TableCell>
                <TableCell className="text-right">
                  {rfq.status === 'pending' && <Button size="sm" className="bg-primary text-white" onClick={() => openQuoteDialog(rfq)}>Send Quote</Button>}
                  {rfq.status === 'quoted' && <Badge variant="outline">Awaiting Response</Badge>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader><DialogTitle className="font-ui text-primary">Send Quote for {selectedRfq?.rfq_number}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="bg-surface/50 p-4 rounded-lg">
              <h4 className="font-medium text-primary mb-2">Request Details</h4>
              <p className="text-sm text-primary/60">Company: {selectedRfq?.company_name}</p>
              <p className="text-sm text-primary/60">Items: {selectedRfq?.items?.length || 0}</p>
              <p className="text-sm text-primary/60">Delivery by: {selectedRfq?.delivery_date}</p>
              {selectedRfq?.notes && <p className="text-sm text-primary/60 mt-2">Notes: {selectedRfq.notes}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Quote Amount ($) *</Label><Input type="number" value={quoteForm.amount} onChange={e => setQuoteForm({...quoteForm, amount: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Valid Until *</Label><Input type="date" value={quoteForm.valid_until} onChange={e => setQuoteForm({...quoteForm, valid_until: e.target.value})} className="bg-paper border-primary/10" required /></div>
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={quoteForm.notes} onChange={e => setQuoteForm({...quoteForm, notes: e.target.value})} className="bg-paper border-primary/10" rows={3} placeholder="Additional terms or notes..." /></div>
            <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={() => setQuoteOpen(false)}>Cancel</Button><Button className="bg-primary hover:bg-primary/90 text-white" onClick={submitQuote} disabled={!quoteForm.amount || !quoteForm.valid_until}>Send Quote</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRFQ;
