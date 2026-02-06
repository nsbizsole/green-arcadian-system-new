import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, Clock, FileCheck, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const PartnerDeals = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/partners/me`);
      setData(res.data);
    } catch (e) { 
      toast.error('Failed to fetch deals'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const deals = data?.deals || [];
  const pendingDeals = deals.filter(d => d.status === 'pending');
  const approvedDeals = deals.filter(d => d.status === 'approved');
  const paidDeals = deals.filter(d => d.status === 'paid');

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    paid: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="space-y-6" data-testid="partner-deals-page">
      <div>
        <h1 className="font-ui text-2xl font-bold text-primary">My Deals</h1>
        <p className="text-primary/60">Track all your registered deals and commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Total Deals</p>
                <p className="text-2xl font-bold text-primary">{deals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Approved</p>
                <p className="text-2xl font-bold text-blue-600">{approvedDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Paid Out</p>
                <p className="text-2xl font-bold text-green-600">{paidDeals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader>
          <CardTitle className="font-ui text-primary">All Deals</CardTitle>
        </CardHeader>
        <CardContent>
          {deals.length > 0 ? (
            <div className="space-y-4">
              {deals.map(deal => (
                <div key={deal.id} className="p-4 bg-surface/30 rounded-lg border border-primary/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-primary text-lg">{deal.client_name}</h4>
                        <Badge className={statusColors[deal.status]}>{deal.status}</Badge>
                      </div>
                      {deal.client_email && (
                        <p className="text-sm text-primary/60">{deal.client_email}</p>
                      )}
                      {deal.description && (
                        <p className="text-sm text-primary/60 mt-1">{deal.description}</p>
                      )}
                      <p className="text-xs text-primary/50 mt-2">
                        Registered: {new Date(deal.created_at).toLocaleDateString()}
                        {deal.locked && <span className="ml-2 text-green-600">Locked</span>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">${deal.deal_value?.toLocaleString()}</p>
                      <p className="text-sm text-green-600 font-medium">
                        ${deal.commission?.toLocaleString()} commission ({deal.commission_rate}%)
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="font-ui text-lg font-medium text-primary mb-2">No Deals Yet</h3>
              <p className="text-primary/60">Start registering deals to earn commissions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDeals;
