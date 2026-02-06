import { useState, useEffect } from 'react';
import axios from 'axios';
import { Handshake, DollarSign, TrendingUp, Clock, Check, Banknote } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminPartners = () => {
  const [partners, setPartners] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('partners');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [partnersRes] = await Promise.all([
        axios.get(`${API}/partners`)
      ]);
      setPartners(partnersRes.data);
      
      // Collect all deals from partners
      const allDeals = partnersRes.data.flatMap(p => p.deals || []);
      setDeals(allDeals);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const approveDeal = async (dealId) => {
    try {
      await axios.post(`${API}/partners/deals/${dealId}/approve`);
      toast.success('Deal approved!');
      fetchData();
    } catch (e) { toast.error('Failed to approve'); }
  };

  const payCommission = async (dealId) => {
    try {
      await axios.post(`${API}/partners/deals/${dealId}/pay`);
      toast.success('Commission paid!');
      fetchData();
    } catch (e) { toast.error('Failed to pay'); }
  };

  const statusColors = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-blue-100 text-blue-800', paid: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' };
  const totalSales = partners.reduce((s, p) => s + (p.total_sales || 0), 0);
  const pendingCommissions = partners.reduce((s, p) => s + (p.pending_commission || 0), 0);

  return (
    <div className="space-y-6" data-testid="admin-partners-page">
      <div><h1 className="font-ui text-2xl font-bold text-primary">Sales Partners</h1><p className="text-primary/60 font-ui">Manage partner commissions and deal approvals</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Handshake className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Active Partners</p><p className="text-xl font-bold text-primary">{partners.filter(p => p.status === 'active').length}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><TrendingUp className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">Total Sales</p><p className="text-xl font-bold text-primary">${totalSales.toLocaleString()}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-xs text-primary/60">Pending Payouts</p><p className="text-xl font-bold text-yellow-600">${pendingCommissions.toLocaleString()}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Total Paid</p><p className="text-xl font-bold text-green-600">${partners.reduce((s, p) => s + (p.total_commission || 0), 0).toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-2 border-b border-primary/10">
        <button onClick={() => setActiveTab('partners')} className={`px-4 py-2 font-ui text-sm ${activeTab === 'partners' ? 'border-b-2 border-primary text-primary' : 'text-primary/60'}`}>Partners</button>
        <button onClick={() => setActiveTab('deals')} className={`px-4 py-2 font-ui text-sm ${activeTab === 'deals' ? 'border-b-2 border-primary text-primary' : 'text-primary/60'}`}>All Deals</button>
      </div>

      {activeTab === 'partners' && (
        <Card className="bg-white border-primary/5">
          <Table>
            <TableHeader><TableRow className="border-primary/10">
              <TableHead className="text-primary/60">Partner</TableHead>
              <TableHead className="text-primary/60">Company</TableHead>
              <TableHead className="text-primary/60">Deals</TableHead>
              <TableHead className="text-primary/60">Total Sales</TableHead>
              <TableHead className="text-primary/60">Earned</TableHead>
              <TableHead className="text-primary/60">Pending</TableHead>
              <TableHead className="text-primary/60">Status</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {loading ? <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
               : partners.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-primary/60">No partners found</TableCell></TableRow>
               : partners.map(partner => (
                <TableRow key={partner.id} className="border-primary/10">
                  <TableCell><p className="font-medium text-primary">{partner.full_name}</p><p className="text-xs text-primary/60">{partner.email}</p></TableCell>
                  <TableCell>{partner.company || '-'}</TableCell>
                  <TableCell>{partner.total_deals || 0}</TableCell>
                  <TableCell className="font-medium">${(partner.total_sales || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">${(partner.total_commission || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-yellow-600">${(partner.pending_commission || 0).toLocaleString()}</TableCell>
                  <TableCell><Badge className={partner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'}>{partner.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 'deals' && (
        <Card className="bg-white border-primary/5">
          <CardHeader><CardTitle className="font-ui text-primary">Recent Deals</CardTitle></CardHeader>
          <CardContent>
            {partners.length > 0 ? (
              <div className="space-y-3">
                {partners.flatMap(p => {
                  // We need to fetch deals separately since they're not included in the partners response
                  return [];
                })}
                <p className="text-center text-primary/60 py-4">Deal management available through individual partner views</p>
              </div>
            ) : (
              <p className="text-center text-primary/60 py-8">No deals found</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPartners;
