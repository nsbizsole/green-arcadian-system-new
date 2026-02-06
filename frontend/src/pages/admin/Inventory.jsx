import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle } from 'lucide-react';
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
const categories = ['Indoor Plants', 'Outdoor Plants', 'Roses', 'Orchids', 'Succulents', 'Ferns', 'Palms', 'Flowering', 'Foliage', 'Trees'];
const stages = ['seedling', 'juvenile', 'mature', 'flowering', 'fruiting'];
const locations = ['Greenhouse A', 'Greenhouse B', 'Nursery', 'Field 1', 'Field 2', 'Storage'];

const Inventory = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stockDialogOpen, setStockDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [stockChange, setStockChange] = useState({ quantity: 0, reason: '' });
  const [form, setForm] = useState({
    name: '', scientific_name: '', category: '', growth_stage: 'seedling', batch_number: '',
    price: '', cost: '', quantity: '', min_stock: '10', location: 'Greenhouse A', description: '', care_info: '', image_url: ''
  });

  useEffect(() => { fetchPlants(); }, [categoryFilter]);

  const fetchPlants = async () => {
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      const res = await axios.get(`${API}/inventory?${params}`);
      setPlants(res.data);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: parseFloat(form.price), cost: parseFloat(form.cost || 0), quantity: parseInt(form.quantity), min_stock: parseInt(form.min_stock) };
      if (editing) {
        await axios.put(`${API}/inventory/${editing.id}`, payload);
        toast.success('Plant updated');
      } else {
        await axios.post(`${API}/inventory`, payload);
        toast.success('Plant added');
      }
      setDialogOpen(false);
      resetForm();
      fetchPlants();
    } catch (e) { toast.error('Failed to save'); }
  };

  const handleStockUpdate = async () => {
    if (!selectedPlant) return;
    try {
      await axios.put(`${API}/inventory/${selectedPlant.id}/stock?quantity_change=${stockChange.quantity}&reason=${encodeURIComponent(stockChange.reason)}`);
      toast.success('Stock updated');
      setStockDialogOpen(false);
      setStockChange({ quantity: 0, reason: '' });
      fetchPlants();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed'); }
  };

  const handleEdit = (plant) => {
    setEditing(plant);
    setForm({ name: plant.name, scientific_name: plant.scientific_name || '', category: plant.category, growth_stage: plant.growth_stage, batch_number: plant.batch_number || '', price: plant.price.toString(), cost: plant.cost?.toString() || '', quantity: plant.quantity.toString(), min_stock: plant.min_stock.toString(), location: plant.location, description: plant.description || '', care_info: plant.care_info || '', image_url: plant.image_url || '' });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete?')) return;
    try { await axios.delete(`${API}/inventory/${id}`); toast.success('Deleted'); fetchPlants(); }
    catch (e) { toast.error('Failed'); }
  };

  const resetForm = () => {
    setEditing(null);
    setForm({ name: '', scientific_name: '', category: '', growth_stage: 'seedling', batch_number: '', price: '', cost: '', quantity: '', min_stock: '10', location: 'Greenhouse A', description: '', care_info: '', image_url: '' });
  };

  const openStockDialog = (plant) => { setSelectedPlant(plant); setStockDialogOpen(true); };

  const filteredPlants = plants.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));
  const isLow = (p) => p.quantity <= p.min_stock;

  return (
    <div className="space-y-6" data-testid="inventory-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-ui text-2xl font-bold text-primary">Plant Inventory</h1><p className="text-primary/60 font-ui">Manage nursery stock, batches, and growth stages</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => { resetForm(); setDialogOpen(true); }} data-testid="add-plant-btn"><Plus className="w-4 h-4" />Add Plant</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
          <Input placeholder="Search plants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white border-primary/10" />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Categories</SelectItem>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">Plant</TableHead>
              <TableHead className="text-primary/60 font-ui">Batch/SKU</TableHead>
              <TableHead className="text-primary/60 font-ui">Stage</TableHead>
              <TableHead className="text-primary/60 font-ui">Stock</TableHead>
              <TableHead className="text-primary/60 font-ui">Price</TableHead>
              <TableHead className="text-primary/60 font-ui">Location</TableHead>
              <TableHead className="text-primary/60 font-ui text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : filteredPlants.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No plants found</TableCell></TableRow>
             : filteredPlants.map(plant => (
              <TableRow key={plant.id} className="border-primary/10">
                <TableCell>
                  <div className="flex items-center gap-3">
                    {plant.image_url ? <img src={plant.image_url} alt="" className="w-10 h-10 object-cover rounded" /> : <div className="w-10 h-10 bg-surface flex items-center justify-center rounded"><Package className="w-5 h-5 text-primary/40" /></div>}
                    <div><p className="font-medium text-primary">{plant.name}</p>{plant.scientific_name && <p className="text-xs text-primary/60 italic">{plant.scientific_name}</p>}</div>
                  </div>
                </TableCell>
                <TableCell><p className="text-xs font-mono text-primary">{plant.sku}</p><p className="text-xs text-primary/60">{plant.batch_number}</p></TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{plant.growth_stage}</Badge></TableCell>
                <TableCell>
                  <button onClick={() => openStockDialog(plant)} className={`font-medium ${isLow(plant) ? 'text-terracotta' : 'text-primary'} hover:underline`}>
                    {plant.quantity - (plant.reserved || 0)} {plant.reserved > 0 && <span className="text-xs text-primary/60">({plant.reserved} res.)</span>}
                  </button>
                  {isLow(plant) && <AlertTriangle className="w-4 h-4 text-terracotta inline ml-1" />}
                </TableCell>
                <TableCell className="text-primary font-medium">${plant.price}</TableCell>
                <TableCell className="text-primary/60 text-sm">{plant.location}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" onClick={() => handleEdit(plant)}><Edit className="w-4 h-4 text-primary/60" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDelete(plant.id)}><Trash2 className="w-4 h-4 text-terracotta" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">{editing ? 'Edit Plant' : 'Add Plant'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Scientific Name</Label><Input value={form.scientific_name} onChange={e => setForm({...form, scientific_name: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Category *</Label><Select value={form.category} onValueChange={v => setForm({...form, category: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Growth Stage</Label><Select value={form.growth_stage} onValueChange={v => setForm({...form, growth_stage: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{stages.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Location</Label><Select value={form.location} onValueChange={v => setForm({...form, location: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{locations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2"><Label>Price ($) *</Label><Input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Cost ($)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} className="bg-paper border-primary/10" /></div>
              <div className="space-y-2"><Label>Quantity *</Label><Input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Min Stock</Label><Input type="number" value={form.min_stock} onChange={e => setForm({...form, min_stock: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})} className="bg-paper border-primary/10" placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-paper border-primary/10" rows={2} /></div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">{editing ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={stockDialogOpen} onOpenChange={setStockDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-md">
          <DialogHeader><DialogTitle className="font-ui text-primary">Update Stock: {selectedPlant?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-primary/60">Current: <strong>{selectedPlant?.quantity}</strong></p>
            <div className="space-y-2"><Label>Quantity Change (+ or -)</Label><Input type="number" value={stockChange.quantity} onChange={e => setStockChange({...stockChange, quantity: parseInt(e.target.value) || 0})} className="bg-paper border-primary/10" /></div>
            <div className="space-y-2"><Label>Reason *</Label><Input value={stockChange.reason} onChange={e => setStockChange({...stockChange, reason: e.target.value})} className="bg-paper border-primary/10" placeholder="e.g., New shipment, Sold, Damaged" required /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStockDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleStockUpdate} className="bg-primary hover:bg-primary/90 text-white" disabled={!stockChange.reason}>Update Stock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
