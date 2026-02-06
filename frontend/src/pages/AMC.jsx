import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  CalendarClock,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  FileText,
  RefreshCw
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
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const serviceTypes = ['lawn_maintenance', 'garden_care', 'irrigation', 'pest_control', 'tree_trimming', 'full_service'];
const frequencies = ['weekly', 'bi_weekly', 'monthly', 'quarterly', 'yearly'];

const AMC = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    service_type: 'lawn_maintenance',
    frequency: 'monthly',
    amount: '',
    start_date: '',
    property_address: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [subsRes, invRes] = await Promise.all([
        axios.get(`${API}/amc/subscriptions`),
        axios.get(`${API}/amc/invoices`)
      ]);
      setSubscriptions(subsRes.data);
      setInvoices(invRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/amc/subscriptions`, {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      toast.success('Subscription created');
      setDialogOpen(false);
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        service_type: 'lawn_maintenance',
        frequency: 'monthly',
        amount: '',
        start_date: '',
        property_address: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create subscription');
    }
  };

  const generateInvoice = async (subId) => {
    try {
      await axios.post(`${API}/amc/subscriptions/${subId}/invoice`);
      toast.success('Invoice generated');
      fetchData();
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  const totalMRR = subscriptions
    .filter(s => s.status === 'active')
    .reduce((sum, s) => {
      if (s.frequency === 'monthly') return sum + s.amount;
      if (s.frequency === 'quarterly') return sum + (s.amount / 3);
      if (s.frequency === 'yearly') return sum + (s.amount / 12);
      return sum + s.amount;
    }, 0);

  const getNextBilling = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    if (diff < 0) return 'Overdue';
    if (diff === 0) return 'Today';
    return `${diff} days`;
  };

  return (
    <div className="space-y-6" data-testid="amc-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">AMC Billing</h1>
          <p className="text-muted-foreground">Manage maintenance subscriptions and invoices</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => setDialogOpen(true)}
          data-testid="add-subscription-btn"
        >
          <Plus className="w-4 h-4" />
          New Subscription
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CalendarClock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">
                  {subscriptions.filter(s => s.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">
                  ${totalMRR.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Monthly Recurring</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-heading font-bold text-white">
                  {invoices.filter(i => i.status === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending Invoices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="subscriptions" className="data-[state=active]:bg-primary">Subscriptions</TabsTrigger>
          <TabsTrigger value="invoices" className="data-[state=active]:bg-primary">Invoices</TabsTrigger>
        </TabsList>

        {/* Subscriptions Tab */}
        <TabsContent value="subscriptions" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : subscriptions.length === 0 ? (
            <Card className="bg-[#0A0A0A] border-white/10">
              <CardContent className="p-12 text-center">
                <CalendarClock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subscriptions yet. Create your first AMC contract!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {subscriptions.map((sub) => (
                <Card 
                  key={sub.id} 
                  className="bg-[#0A0A0A] border-white/10"
                  data-testid={`subscription-card-${sub.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-lg font-bold text-white">{sub.client_name}</h3>
                          <Badge className={sub.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                            {sub.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {sub.client_email}
                          </div>
                          {sub.client_phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              {sub.client_phone}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <RefreshCw className="w-4 h-4" />
                            {sub.frequency.replace('_', '-')}
                          </div>
                          {sub.property_address && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {sub.property_address}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-heading text-2xl font-bold text-primary">${sub.amount}</p>
                          <p className="text-xs text-muted-foreground">
                            Next: {getNextBilling(sub.next_billing_date)}
                          </p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="border-white/20"
                          onClick={() => generateInvoice(sub.id)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Invoice
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          {invoices.length === 0 ? (
            <Card className="bg-[#0A0A0A] border-white/10">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="glass-card divide-y divide-white/10">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.client_name} • {invoice.service_type?.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-heading font-bold text-white">${invoice.amount}</p>
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={
                      invoice.status === 'paid' 
                        ? 'bg-green-500/20 text-green-400'
                        : invoice.status === 'overdue'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }>
                      {invoice.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Subscription Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">New AMC Subscription</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="subscription-form">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                  data-testid="client-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Select value={formData.service_type} onValueChange={(v) => setFormData({ ...formData, service_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((freq) => (
                      <SelectItem key={freq} value={freq} className="capitalize">
                        {freq.replace('_', '-')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Amount ($) *</Label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-white/5 border-white/10"
                required
                min="0"
                data-testid="amount-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Property Address</Label>
              <Input
                value={formData.property_address}
                onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
                className="bg-white/5 border-white/10"
                placeholder="Service location"
              />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-white/5 border-white/10"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="save-subscription-btn">
                Create Subscription
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AMC;
