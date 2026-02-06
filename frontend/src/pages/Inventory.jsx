import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Filter, 
  Leaf, 
  MapPin,
  AlertTriangle,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = ['Indoor Plants', 'Outdoor Plants', 'Succulents', 'Flowering', 'Trees', 'Herbs', 'Seeds'];
const growthStages = ['seedling', 'juvenile', 'mature', 'flowering', 'fruiting'];

const Inventory = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scientific_name: '',
    category: '',
    growth_stage: 'seedling',
    price: '',
    cost: '',
    quantity: '',
    min_stock: '10',
    location: 'main',
    description: ''
  });

  useEffect(() => {
    fetchPlants();
  }, [searchQuery, selectedCategory, showLowStock]);

  const fetchPlants = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (showLowStock) params.append('low_stock', 'true');
      
      const response = await axios.get(`${API}/inventory/plants?${params}`);
      setPlants(response.data);
    } catch (error) {
      toast.error('Failed to fetch plants');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost || 0),
        quantity: parseInt(formData.quantity),
        min_stock: parseInt(formData.min_stock)
      };

      if (editingPlant) {
        await axios.put(`${API}/inventory/plants/${editingPlant.id}`, payload);
        toast.success('Plant updated successfully');
      } else {
        await axios.post(`${API}/inventory/plants`, payload);
        toast.success('Plant added successfully');
      }
      
      setDialogOpen(false);
      resetForm();
      fetchPlants();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save plant');
    }
  };

  const handleEdit = (plant) => {
    setEditingPlant(plant);
    setFormData({
      name: plant.name,
      scientific_name: plant.scientific_name || '',
      category: plant.category,
      growth_stage: plant.growth_stage,
      price: plant.price.toString(),
      cost: plant.cost?.toString() || '',
      quantity: plant.quantity.toString(),
      min_stock: plant.min_stock.toString(),
      location: plant.location,
      description: plant.description || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (plantId) => {
    if (!window.confirm('Are you sure you want to delete this plant?')) return;
    
    try {
      await axios.delete(`${API}/inventory/plants/${plantId}`);
      toast.success('Plant deleted');
      fetchPlants();
    } catch (error) {
      toast.error('Failed to delete plant');
    }
  };

  const resetForm = () => {
    setEditingPlant(null);
    setFormData({
      name: '',
      scientific_name: '',
      category: '',
      growth_stage: 'seedling',
      price: '',
      cost: '',
      quantity: '',
      min_stock: '10',
      location: 'main',
      description: ''
    });
  };

  const isLowStock = (plant) => plant.quantity <= plant.min_stock;
  const available = (plant) => plant.quantity - (plant.reserved || 0);

  return (
    <div className="space-y-6" data-testid="inventory-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Plant Inventory</h1>
          <p className="text-muted-foreground">Manage your plant stock and reservations</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => { resetForm(); setDialogOpen(true); }}
          data-testid="add-plant-btn"
        >
          <Plus className="w-4 h-4" />
          Add Plant
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search plants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white"
            data-testid="search-input"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48 bg-white/5 border-white/10 text-white" data-testid="category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={showLowStock ? "default" : "outline"}
          className={showLowStock ? "bg-warning text-black" : "border-white/20"}
          onClick={() => setShowLowStock(!showLowStock)}
          data-testid="low-stock-filter"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Low Stock
        </Button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="text-muted-foreground">Plant</TableHead>
              <TableHead className="text-muted-foreground">Category</TableHead>
              <TableHead className="text-muted-foreground">Stage</TableHead>
              <TableHead className="text-muted-foreground">Stock</TableHead>
              <TableHead className="text-muted-foreground">Price</TableHead>
              <TableHead className="text-muted-foreground">Location</TableHead>
              <TableHead className="text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                </TableCell>
              </TableRow>
            ) : plants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No plants found. Add your first plant!
                </TableCell>
              </TableRow>
            ) : (
              plants.map((plant) => (
                <TableRow key={plant.id} className="border-white/10" data-testid={`plant-row-${plant.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{plant.name}</p>
                        {plant.scientific_name && (
                          <p className="text-xs text-muted-foreground italic">{plant.scientific_name}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-white/20 text-muted-foreground">
                      {plant.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground capitalize">{plant.growth_stage}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={isLowStock(plant) ? 'text-warning' : 'text-white'}>
                        {available(plant)}
                      </span>
                      {plant.reserved > 0 && (
                        <span className="text-xs text-muted-foreground">({plant.reserved} reserved)</span>
                      )}
                      {isLowStock(plant) && (
                        <AlertTriangle className="w-4 h-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-white">${plant.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {plant.location}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-white/10"
                        onClick={() => handleEdit(plant)}
                        data-testid={`edit-plant-${plant.id}`}
                      >
                        <Edit className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-destructive/20"
                        onClick={() => handleDelete(plant.id)}
                        data-testid={`delete-plant-${plant.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingPlant ? 'Edit Plant' : 'Add New Plant'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="plant-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plant Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="plant-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Scientific Name</Label>
                <Input
                  value={formData.scientific_name}
                  onChange={(e) => setFormData({ ...formData, scientific_name: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10" data-testid="plant-category-select">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Growth Stage</Label>
                <Select 
                  value={formData.growth_stage} 
                  onValueChange={(value) => setFormData({ ...formData, growth_stage: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {growthStages.map((stage) => (
                      <SelectItem key={stage} value={stage} className="capitalize">{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Price ($) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="plant-price-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Cost ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="plant-quantity-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Stock Alert</Label>
                <Input
                  type="number"
                  value={formData.min_stock}
                  onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="bg-white/5 border-white/10"
                  placeholder="main, greenhouse-1, etc."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="save-plant-btn">
                {editingPlant ? 'Update' : 'Add'} Plant
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inventory;
