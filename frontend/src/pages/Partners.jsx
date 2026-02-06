import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Handshake,
  Mail,
  Phone,
  Building,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [deals, setDeals] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dealDialogOpen, setDealDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    commission_rate: '10'
  });
  const [dealForm, setDealForm] = useState({
    client_name: '',
    amount: ''
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API}/partners`);
      setPartners(response.data);
    } catch (error) {
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeals = async (partnerId) => {
    try {
      const response = await axios.get(`${API}/partners/${partnerId}/deals`);
      setDeals(prev => ({ ...prev, [partnerId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch deals');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/partners`, {
        ...formData,
        commission_rate: parseFloat(formData.commission_rate)
      });
      toast.success('Partner added');
      setDialogOpen(false);
      setFormData({ name: '', email: '', phone: '', company: '', commission_rate: '10' });
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add partner');
    }
  };

  const handleDealSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    try {
      await axios.post(`${API}/partners/${selectedPartner.id}/deals`, {
        client_name: dealForm.client_name,
        amount: parseFloat(dealForm.amount)
      });
      toast.success('Deal created and locked!');
      setDealDialogOpen(false);
      setDealForm({ client_name: '', amount: '' });
      fetchPartners();
      fetchDeals(selectedPartner.id);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create deal');
    }
  };

  const handleCompleteDeal = async (dealId) => {
    try {
      await axios.post(`${API}/partners/deals/${dealId}/complete`);
      toast.success('Deal completed, commission released!');
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete deal');
    }
  };

  const openDealDialog = (partner) => {
    setSelectedPartner(partner);
    fetchDeals(partner.id);
    setDealDialogOpen(true);
  };

  return (
    <div className="space-y-6" data-testid="partners-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Sales Partners</h1>
          <p className="text-muted-foreground">Manage partner commissions and deals</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => setDialogOpen(true)}
          data-testid="add-partner-btn"
        >
          <Plus className="w-4 h-4" />
          Add Partner
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Handshake className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">{partners.length}</p>
                <p className="text-sm text-muted-foreground">Active Partners</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">
                  ${partners.reduce((sum, p) => sum + (p.total_sales || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">
                  ${partners.reduce((sum, p) => sum + (p.pending_commission || 0), 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Pending Payouts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : partners.length === 0 ? (
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-12 text-center">
            <Handshake className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No partners yet. Add your first sales partner!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.map((partner) => (
            <Card 
              key={partner.id} 
              className="bg-[#0A0A0A] border-white/10 hover:border-primary/30 transition-colors"
              data-testid={`partner-card-${partner.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">
                        {partner.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-white text-lg">{partner.name}</CardTitle>
                      {partner.company && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {partner.company}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">
                    {partner.commission_rate}% rate
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  {partner.email && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {partner.email}
                    </p>
                  )}
                  {partner.phone && (
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {partner.phone}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Sales</p>
                    <p className="font-heading font-bold text-white">
                      ${(partner.total_sales || 0).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earned</p>
                    <p className="font-heading font-bold text-green-500">
                      ${(partner.total_commission || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {partner.pending_commission > 0 && (
                  <div className="p-3 bg-yellow-500/10 rounded-lg">
                    <p className="text-xs text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending: ${partner.pending_commission.toLocaleString()}
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full bg-white/5 hover:bg-white/10 text-white"
                  onClick={() => openDealDialog(partner)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register Deal
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Partner Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Sales Partner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="partner-form">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10"
                required
                data-testid="partner-name-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white/5 border-white/10"
                required
                data-testid="partner-email-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Commission Rate (%)</Label>
                <Input
                  type="number"
                  value={formData.commission_rate}
                  onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                  className="bg-white/5 border-white/10"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="save-partner-btn">
                Add Partner
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deal Dialog */}
      <Dialog open={dealDialogOpen} onOpenChange={setDealDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Register Deal for {selectedPartner?.name}</DialogTitle>
          </DialogHeader>
          
          {/* Existing Deals */}
          {selectedPartner && deals[selectedPartner.id]?.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Recent Deals</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {deals[selectedPartner.id].map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm text-white">{deal.client_name}</p>
                      <p className="text-xs text-muted-foreground">${deal.amount.toLocaleString()} • ${deal.commission.toLocaleString()} commission</p>
                    </div>
                    {deal.status === 'pending' ? (
                      <Button 
                        size="sm" 
                        className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        onClick={() => handleCompleteDeal(deal.id)}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Complete
                      </Button>
                    ) : (
                      <Badge className="bg-green-500/20 text-green-400">Paid</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleDealSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Client Name *</Label>
              <Input
                value={dealForm.client_name}
                onChange={(e) => setDealForm({ ...dealForm, client_name: e.target.value })}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Deal Amount ($) *</Label>
              <Input
                type="number"
                value={dealForm.amount}
                onChange={(e) => setDealForm({ ...dealForm, amount: e.target.value })}
                className="bg-white/5 border-white/10"
                required
                min="0"
              />
            </div>
            {dealForm.amount && selectedPartner && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  Commission: ${(parseFloat(dealForm.amount) * (selectedPartner.commission_rate / 100)).toFixed(2)}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDealDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Lock Deal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partners;
