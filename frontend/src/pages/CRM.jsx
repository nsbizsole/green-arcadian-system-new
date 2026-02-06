import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Users,
  Phone,
  Mail,
  Building,
  MoreVertical,
  FileText,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  proposal: 'bg-orange-500/20 text-orange-400',
  won: 'bg-green-500/20 text-green-400',
  lost: 'bg-red-500/20 text-red-400'
};

const sources = ['website', 'referral', 'social_media', 'cold_call', 'trade_show', 'other'];

const CRM = () => {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadDialogOpen, setLeadDialogOpen] = useState(false);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: 'website',
    notes: ''
  });
  const [quoteItems, setQuoteItems] = useState([{ description: '', quantity: 1, price: 0 }]);

  useEffect(() => {
    fetchData();
  }, [searchQuery, statusFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const [leadsRes, quotesRes] = await Promise.all([
        axios.get(`${API}/crm/leads?${params}`),
        axios.get(`${API}/crm/quotes`)
      ]);
      
      let filteredLeads = leadsRes.data;
      if (searchQuery) {
        filteredLeads = filteredLeads.filter(lead => 
          lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          lead.company?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setLeads(filteredLeads);
      setQuotes(quotesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedLead) {
        await axios.put(`${API}/crm/leads/${selectedLead.id}`, formData);
        toast.success('Lead updated');
      } else {
        await axios.post(`${API}/crm/leads`, formData);
        toast.success('Lead added');
      }
      setLeadDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save lead');
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await axios.put(`${API}/crm/leads/${leadId}`, { status: newStatus });
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axios.delete(`${API}/crm/leads/${leadId}`);
      toast.success('Lead deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete lead');
    }
  };

  const handleCreateQuote = async () => {
    if (!selectedLead) return;
    
    const subtotal = quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    try {
      await axios.post(`${API}/crm/quotes`, {
        lead_id: selectedLead.id,
        items: quoteItems,
        subtotal,
        tax,
        total,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
      toast.success('Quote created');
      setQuoteDialogOpen(false);
      setQuoteItems([{ description: '', quantity: 1, price: 0 }]);
      fetchData();
    } catch (error) {
      toast.error('Failed to create quote');
    }
  };

  const editLead = (lead) => {
    setSelectedLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source,
      notes: lead.notes || ''
    });
    setLeadDialogOpen(true);
  };

  const openQuoteDialog = (lead) => {
    setSelectedLead(lead);
    setQuoteDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedLead(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: 'website',
      notes: ''
    });
  };

  const addQuoteItem = () => {
    setQuoteItems([...quoteItems, { description: '', quantity: 1, price: 0 }]);
  };

  const updateQuoteItem = (index, field, value) => {
    const updated = [...quoteItems];
    updated[index][field] = field === 'quantity' || field === 'price' ? parseFloat(value) || 0 : value;
    setQuoteItems(updated);
  };

  const getLeadsByStatus = (status) => leads.filter(l => l.status === status);

  return (
    <div className="space-y-6" data-testid="crm-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">CRM Pipeline</h1>
          <p className="text-muted-foreground">Manage leads and create quotes</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => { resetForm(); setLeadDialogOpen(true); }}
          data-testid="add-lead-btn"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </Button>
      </div>

      <Tabs defaultValue="pipeline" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-primary">Pipeline</TabsTrigger>
          <TabsTrigger value="list" className="data-[state=active]:bg-primary">List View</TabsTrigger>
          <TabsTrigger value="quotes" className="data-[state=active]:bg-primary">Quotes</TabsTrigger>
        </TabsList>

        {/* Pipeline View */}
        <TabsContent value="pipeline" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
            {['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'].map((status) => (
              <div key={status} className="min-w-[250px]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-white capitalize">{status}</h3>
                  <Badge variant="outline" className="border-white/20">
                    {getLeadsByStatus(status).length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {getLeadsByStatus(status).map((lead) => (
                    <div 
                      key={lead.id}
                      className="glass-card p-4 hover:border-primary/30 transition-colors cursor-pointer"
                      data-testid={`lead-card-${lead.id}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-white">{lead.name}</p>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-6 w-6">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => editLead(lead)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openQuoteDialog(lead)}>Create Quote</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)} className="text-destructive">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {lead.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {lead.company}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className={`${statusColors[lead.status]} text-xs`}>
                          {lead.source}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {Object.keys(statusColors).map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="glass-card divide-y divide-white/10">
            {loading ? (
              <div className="p-8 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </div>
            ) : leads.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No leads found
              </div>
            ) : (
              leads.map((lead) => (
                <div key={lead.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{lead.name}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Select value={lead.status} onValueChange={(value) => handleStatusChange(lead.id, value)}>
                      <SelectTrigger className={`w-32 ${statusColors[lead.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map((s) => (
                          <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="border-white/20" onClick={() => openQuoteDialog(lead)}>
                      <FileText className="w-4 h-4 mr-1" />
                      Quote
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        {/* Quotes View */}
        <TabsContent value="quotes" className="space-y-4">
          <div className="glass-card divide-y divide-white/10">
            {quotes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No quotes yet. Create one from a lead.
              </div>
            ) : (
              quotes.map((quote) => (
                <div key={quote.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{quote.quote_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {quote.items.length} items • Valid until {new Date(quote.valid_until).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-heading text-xl font-bold text-primary">${quote.total.toFixed(2)}</p>
                    <Badge className={statusColors[quote.status] || 'bg-gray-500/20'}>{quote.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Dialog */}
      <Dialog open={leadDialogOpen} onOpenChange={setLeadDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedLead ? 'Edit Lead' : 'Add New Lead'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLeadSubmit} className="space-y-4" data-testid="lead-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="lead-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Company</Label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Source</Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setLeadDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="save-lead-btn">
                {selectedLead ? 'Update' : 'Add'} Lead
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Quote Dialog */}
      <Dialog open={quoteDialogOpen} onOpenChange={setQuoteDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Create Quote for {selectedLead?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {quoteItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3">
                  <div className="col-span-6">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateQuoteItem(index, 'description', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateQuoteItem(index, 'quantity', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateQuoteItem(index, 'price', e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center text-muted-foreground">
                    ${(item.quantity * item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="border-white/20 w-full" onClick={addQuoteItem}>
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>${quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Tax (10%)</span>
                <span>${(quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0) * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-heading text-xl font-bold text-white">
                <span>Total</span>
                <span className="text-primary">
                  ${(quoteItems.reduce((sum, item) => sum + (item.quantity * item.price), 0) * 1.1).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setQuoteDialogOpen(false)}>Cancel</Button>
              <Button className="bg-primary hover:bg-primary/90" onClick={handleCreateQuote} data-testid="create-quote-btn">
                Create Quote
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRM;
