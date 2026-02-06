import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Factory, Package, DollarSign, CheckCircle2 } from 'lucide-react';
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
const productTypes = ['terrarium', 'dried_arrangement', 'gift_set', 'potted_arrangement', 'bouquet', 'wreath', 'centerpiece'];

const AdminProduction = () => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [selectedProd, setSelectedProd] = useState(null);
  const [actualQty, setActualQty] = useState('');
  const [form, setForm] = useState({
    product_type: 'terrarium', name: '', description: '', quantity: '', cost_per_unit: '', sell_price: '', components: []
  });
  const [componentInput, setComponentInput] = useState({ name: '', quantity: '' });

  useEffect(() => { fetchProductions(); }, []);

  const fetchProductions = async () => {
    try {
      const res = await axios.get(`${API}/production`);
      setProductions(res.data);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/production`, {
        ...form,
        quantity: parseInt(form.quantity),
        cost_per_unit: parseFloat(form.cost_per_unit || 0),
        sell_price: parseFloat(form.sell_price || 0)
      });
      toast.success('Production batch created!');
      setDialogOpen(false);
      resetForm();
      fetchProductions();
    } catch (e) { toast.error('Failed to create'); }
  };

  const completeProd = async () => {
    if (!selectedProd) return;
    try {
      await axios.put(`${API}/production/${selectedProd.id}/complete?actual_quantity=${actualQty}`);
      toast.success('Production completed!');
      setCompleteOpen(false);
      fetchProductions();
    } catch (e) { toast.error('Failed to complete'); }
  };

  const addComponent = () => {
    if (!componentInput.name) return;
    setForm({
      ...form,
      components: [...form.components, { ...componentInput, quantity: parseInt(componentInput.quantity) }]
    });
    setComponentInput({ name: '', quantity: '' });
  };

  const resetForm = () => {
    setForm({ product_type: 'terrarium', name: '', description: '', quantity: '', cost_per_unit: '', sell_price: '', components: [] });
    setComponentInput({ name: '', quantity: '' });
  };

  const stats = {
    total: productions.length,
    inProgress: productions.filter(p => p.status === 'in_progress').length,
    completed: productions.filter(p => p.status === 'completed').length,
    totalUnits: productions.filter(p => p.status === 'completed').reduce((s, p) => s + (p.actual_quantity || p.quantity || 0), 0)
  };

  return (
    <div className="space-y-6" data-testid="admin-production-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-ui text-2xl font-bold text-primary">Value-Added Production</h1><p className="text-primary/60 font-ui">Manage terrariums, dried arrangements, and gift sets</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="w-4 h-4" />New Batch</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Factory className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total Batches</p><p className="text-xl font-bold text-primary">{stats.total}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Package className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">In Progress</p><p className="text-xl font-bold text-blue-600">{stats.inProgress}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Completed</p><p className="text-xl font-bold text-green-600">{stats.completed}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-accent" /><div><p className="text-xs text-primary/60">Units Produced</p><p className="text-xl font-bold text-primary">{stats.totalUnits}</p></div></div></CardContent></Card>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">Batch</TableHead>
            <TableHead className="text-primary/60">Product</TableHead>
            <TableHead className="text-primary/60">Type</TableHead>
            <TableHead className="text-primary/60">Quantity</TableHead>
            <TableHead className="text-primary/60">Cost</TableHead>
            <TableHead className="text-primary/60">Price</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : productions.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8 text-primary/60">No production batches found</TableCell></TableRow>
             : productions.map(prod => (
              <TableRow key={prod.id} className="border-primary/10">
                <TableCell className="font-mono text-sm">{prod.batch_number}</TableCell>
                <TableCell className="font-medium text-primary">{prod.name}</TableCell>
                <TableCell className="capitalize">{prod.product_type?.replace('_', ' ')}</TableCell>
                <TableCell>{prod.status === 'completed' ? prod.actual_quantity : prod.quantity}</TableCell>
                <TableCell>${prod.cost_per_unit?.toFixed(2)}</TableCell>
                <TableCell className="font-medium">${prod.sell_price?.toFixed(2)}</TableCell>
                <TableCell><Badge className={prod.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>{prod.status?.replace('_', ' ')}</Badge></TableCell>
                <TableCell className="text-right">
                  {prod.status === 'in_progress' && (
                    <Button size="sm" className="bg-green-600 text-white" onClick={() => { setSelectedProd(prod); setActualQty(prod.quantity.toString()); setCompleteOpen(true); }}>Complete</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">New Production Batch</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Product Type</Label><Select value={form.product_type} onValueChange={v => setForm({...form, product_type: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{productTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Product Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-paper border-primary/10" required /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Cost/Unit ($)</Label><Input type="number" step="0.01" value={form.cost_per_unit} onChange={e => setForm({...form, cost_per_unit: e.target.value})} className="bg-paper border-primary/10" /></div>
              <div className="space-y-2"><Label>Sell Price ($)</Label><Input type="number" step="0.01" value={form.sell_price} onChange={e => setForm({...form, sell_price: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-paper border-primary/10" rows={2} /></div>
            <div className="space-y-2">
              <Label>Components (Materials Used)</Label>
              <div className="flex gap-2">
                <Input placeholder="Component name" value={componentInput.name} onChange={e => setComponentInput({...componentInput, name: e.target.value})} className="bg-paper border-primary/10" />
                <Input placeholder="Qty" type="number" value={componentInput.quantity} onChange={e => setComponentInput({...componentInput, quantity: e.target.value})} className="bg-paper border-primary/10 w-24" />
                <Button type="button" variant="outline" onClick={addComponent}>Add</Button>
              </div>
              {form.components.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{form.components.map((c, i) => (<span key={i} className="text-sm bg-surface/30 px-3 py-1 rounded">{c.name} × {c.quantity}</span>))}</div>}
            </div>
            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Create Batch</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-md">
          <DialogHeader><DialogTitle className="font-ui text-primary">Complete Production</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-primary/60">Completing batch: <strong>{selectedProd?.batch_number}</strong></p>
            <p className="text-primary/60">Product: <strong>{selectedProd?.name}</strong></p>
            <p className="text-primary/60">Target quantity: <strong>{selectedProd?.quantity}</strong></p>
            <div className="space-y-2"><Label>Actual Quantity Produced *</Label><Input type="number" value={actualQty} onChange={e => setActualQty(e.target.value)} className="bg-paper border-primary/10" required /></div>
            <div className="flex justify-end gap-3 pt-2"><Button variant="ghost" onClick={() => setCompleteOpen(false)}>Cancel</Button><Button className="bg-green-600 hover:bg-green-700 text-white" onClick={completeProd}>Mark Complete</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProduction;
