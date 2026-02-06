import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Clock, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PartnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ client_name: '', client_email: '', deal_value: '', description: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/partners/me`);
      setData(res.data);
    } catch (e) { toast.error('Failed to fetch data'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/partners/deals`, { ...form, deal_value: parseFloat(form.deal_value) });
      toast.success('Deal registered and locked!');
      setDialogOpen(false);
      setForm({ client_name: '', client_email: '', deal_value: '', description: '' });
      fetchData();
    } catch (e) { toast.error('Failed to register deal'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  const stats = data?.stats || {};

  return (
    <div className="space-y-8" data-testid="partner-dashboard">
      <div className="flex items-center justify-between">
        <div><h1 className="font-ui text-2xl font-bold text-primary">Partner Dashboard</h1><p className="text-primary/60">Track your deals and commissions</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" />Register Deal</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"><TrendingUp className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-primary/60">Total Deals</p><p className="text-2xl font-bold text-primary">{stats.total_deals || 0}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center"><DollarSign className="w-6 h-6 text-primary" /></div><div><p className="text-sm text-primary/60">Total Sales</p><p className="text-2xl font-bold text-primary">${(stats.total_sales || 0).toLocaleString()}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center"><DollarSign className="w-6 h-6 text-green-600" /></div><div><p className="text-sm text-primary/60">Earned</p><p className="text-2xl font-bold text-green-600">${(stats.total_commission || 0).toLocaleString()}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-6"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600" /></div><div><p className="text-sm text-primary/60">Pending</p><p className="text-2xl font-bold text-yellow-600">${(stats.pending_commission || 0).toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader><CardTitle className="font-ui text-primary">Recent Deals</CardTitle></CardHeader>
        <CardContent>
          {data?.deals?.length > 0 ? (
            <div className="space-y-3">
              {data.deals.slice(0, 10).map(deal => (
                <div key={deal.id} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg">
                  <div><p className="font-medium text-primary">{deal.client_name}</p><p className="text-sm text-primary/60">{deal.description || 'No description'}</p></div>
                  <div className="text-right"><p className="font-bold text-primary">${deal.deal_value.toLocaleString()}</p><p className="text-sm text-green-600">${deal.commission.toLocaleString()} commission</p><Badge className={deal.status === 'paid' ? 'bg-green-100 text-green-800' : deal.status === 'approved' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}>{deal.status}</Badge></div>
                </div>
              ))}
            </div>
          ) : <p className="text-center text-primary/60 py-8">No deals yet. Register your first deal!</p>}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-md">
          <DialogHeader><DialogTitle className="font-ui text-primary">Register New Deal</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2"><Label>Client Name *</Label><Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="bg-paper border-primary/10" required /></div>
            <div className="space-y-2"><Label>Client Email</Label><Input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} className="bg-paper border-primary/10" /></div>
            <div className="space-y-2"><Label>Deal Value ($) *</Label><Input type="number" value={form.deal_value} onChange={e => setForm({...form, deal_value: e.target.value})} className="bg-paper border-primary/10" required /></div>
            <div className="space-y-2"><Label>Description</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-paper border-primary/10" /></div>
            <div className="bg-accent/10 p-3 rounded-lg"><p className="text-sm text-primary">Your commission: <strong>${((parseFloat(form.deal_value) || 0) * 0.1).toFixed(2)}</strong> (10%)</p></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Register & Lock Deal</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PartnerDashboard;
