import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Plane, Ship, Truck, Eye } from 'lucide-react';
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
const docTypes = ['phytosanitary', 'packing_list', 'certificate_of_origin', 'commercial_invoice', 'bill_of_lading'];
const shippingMethods = ['air', 'sea', 'land'];

const AdminExports = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [form, setForm] = useState({
    doc_type: 'packing_list', customer_name: '', destination_country: '', items: [],
    total_weight: '', total_boxes: '', shipping_method: 'air', notes: ''
  });
  const [itemInput, setItemInput] = useState({ name: '', quantity: '', weight: '' });

  useEffect(() => { fetchDocs(); }, [statusFilter]);

  const fetchDocs = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await axios.get(`${API}/exports${params}`);
      setDocs(res.data);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/exports`, {
        ...form,
        total_weight: parseFloat(form.total_weight),
        total_boxes: parseInt(form.total_boxes)
      });
      toast.success('Export document created!');
      setDialogOpen(false);
      resetForm();
      fetchDocs();
    } catch (e) { toast.error('Failed to create'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/exports/${id}/status?status=${status}`);
      toast.success('Status updated');
      fetchDocs();
    } catch (e) { toast.error('Failed to update'); }
  };

  const addItem = () => {
    if (!itemInput.name) return;
    setForm({
      ...form,
      items: [...form.items, { ...itemInput, quantity: parseInt(itemInput.quantity), weight: parseFloat(itemInput.weight) }]
    });
    setItemInput({ name: '', quantity: '', weight: '' });
  };

  const resetForm = () => {
    setForm({ doc_type: 'packing_list', customer_name: '', destination_country: '', items: [], total_weight: '', total_boxes: '', shipping_method: 'air', notes: '' });
    setItemInput({ name: '', quantity: '', weight: '' });
  };

  const statusColors = { draft: 'bg-gray-100 text-gray-800', pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800', shipped: 'bg-purple-100 text-purple-800', delivered: 'bg-green-100 text-green-800' };
  const shippingIcons = { air: Plane, sea: Ship, land: Truck };

  return (
    <div className="space-y-6" data-testid="admin-exports-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-ui text-2xl font-bold text-primary">Export Documents</h1><p className="text-primary/60 font-ui">Generate packing lists and phytosanitary certificates</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="w-4 h-4" />New Document</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><FileText className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total Documents</p><p className="text-xl font-bold text-primary">{docs.length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Plane className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">Air Shipments</p><p className="text-xl font-bold text-primary">{docs.filter(d => d.shipping_method === 'air').length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Ship className="w-8 h-8 text-cyan-500" /><div><p className="text-xs text-primary/60">Sea Shipments</p><p className="text-xl font-bold text-primary">{docs.filter(d => d.shipping_method === 'sea').length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Truck className="w-8 h-8 text-orange-500" /><div><p className="text-xs text-primary/60">Land Shipments</p><p className="text-xl font-bold text-primary">{docs.filter(d => d.shipping_method === 'land').length}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="draft">Draft</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="shipped">Shipped</SelectItem></SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">Document</TableHead>
            <TableHead className="text-primary/60">Type</TableHead>
            <TableHead className="text-primary/60">Customer</TableHead>
            <TableHead className="text-primary/60">Destination</TableHead>
            <TableHead className="text-primary/60">Method</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : docs.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No documents found</TableCell></TableRow>
             : docs.map(doc => {
              const ShipIcon = shippingIcons[doc.shipping_method] || Truck;
              return (
                <TableRow key={doc.id} className="border-primary/10">
                  <TableCell className="font-mono text-sm">{doc.doc_number}</TableCell>
                  <TableCell className="capitalize">{doc.doc_type?.replace('_', ' ')}</TableCell>
                  <TableCell className="font-medium text-primary">{doc.customer_name}</TableCell>
                  <TableCell>{doc.destination_country}</TableCell>
                  <TableCell><ShipIcon className="w-4 h-4 text-primary/60 inline mr-1" /><span className="capitalize">{doc.shipping_method}</span></TableCell>
                  <TableCell><Badge className={statusColors[doc.status]}>{doc.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedDoc(doc); setDetailOpen(true); }}><Eye className="w-4 h-4" /></Button>
                    {doc.status === 'draft' && <Button size="sm" variant="outline" onClick={() => updateStatus(doc.id, 'pending')}>Submit</Button>}
                    {doc.status === 'pending' && <Button size="sm" className="bg-green-600 text-white ml-1" onClick={() => updateStatus(doc.id, 'approved')}>Approve</Button>}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">New Export Document</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Document Type</Label><Select value={form.doc_type} onValueChange={v => setForm({...form, doc_type: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{docTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Shipping Method</Label><Select value={form.shipping_method} onValueChange={v => setForm({...form, shipping_method: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{shippingMethods.map(m => <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Customer Name *</Label><Input value={form.customer_name} onChange={e => setForm({...form, customer_name: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Destination Country *</Label><Input value={form.destination_country} onChange={e => setForm({...form, destination_country: e.target.value})} className="bg-paper border-primary/10" required /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Total Weight (kg) *</Label><Input type="number" step="0.1" value={form.total_weight} onChange={e => setForm({...form, total_weight: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Total Boxes *</Label><Input type="number" value={form.total_boxes} onChange={e => setForm({...form, total_boxes: e.target.value})} className="bg-paper border-primary/10" required /></div>
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              <div className="flex gap-2">
                <Input placeholder="Item name" value={itemInput.name} onChange={e => setItemInput({...itemInput, name: e.target.value})} className="bg-paper border-primary/10" />
                <Input placeholder="Qty" type="number" value={itemInput.quantity} onChange={e => setItemInput({...itemInput, quantity: e.target.value})} className="bg-paper border-primary/10 w-24" />
                <Input placeholder="Weight" type="number" step="0.1" value={itemInput.weight} onChange={e => setItemInput({...itemInput, weight: e.target.value})} className="bg-paper border-primary/10 w-24" />
                <Button type="button" variant="outline" onClick={addItem}>Add</Button>
              </div>
              {form.items.length > 0 && <div className="mt-2 space-y-1">{form.items.map((item, i) => (<div key={i} className="text-sm bg-surface/30 px-3 py-2 rounded flex justify-between"><span>{item.name}</span><span>Qty: {item.quantity}, {item.weight}kg</span></div>))}</div>}
            </div>
            <div className="space-y-2"><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="bg-paper border-primary/10" rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Create Document</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader><DialogTitle className="font-ui text-primary">Document {selectedDoc?.doc_number}</DialogTitle></DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Badge className={statusColors[selectedDoc.status]}>{selectedDoc.status}</Badge><Badge variant="outline" className="capitalize">{selectedDoc.doc_type?.replace('_', ' ')}</Badge></div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-primary/50">Customer</p><p className="font-medium">{selectedDoc.customer_name}</p></div>
                <div><p className="text-primary/50">Destination</p><p className="font-medium">{selectedDoc.destination_country}</p></div>
                <div><p className="text-primary/50">Weight</p><p className="font-medium">{selectedDoc.total_weight} kg</p></div>
                <div><p className="text-primary/50">Boxes</p><p className="font-medium">{selectedDoc.total_boxes}</p></div>
              </div>
              {selectedDoc.items?.length > 0 && (<div><p className="text-primary/50 text-sm mb-2">Items</p><div className="space-y-1">{selectedDoc.items.map((item, i) => (<div key={i} className="text-sm bg-surface/30 px-3 py-2 rounded flex justify-between"><span>{item.name}</span><span>Qty: {item.quantity}</span></div>))}</div></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminExports;
