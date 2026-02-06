import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Mail, Phone, Building, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => { fetchInquiries(); }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await axios.get(`${API}/inquiries${params}`);
      setInquiries(res.data);
    } catch (e) { toast.error('Failed to fetch'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/inquiries/${id}/status?status=${status}`);
      toast.success('Status updated');
      fetchInquiries();
      if (selectedInquiry?.id === id) {
        setSelectedInquiry({ ...selectedInquiry, status });
      }
    } catch (e) { toast.error('Failed to update'); }
  };

  const statusColors = { new: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800', responded: 'bg-green-100 text-green-800', closed: 'bg-gray-100 text-gray-800' };
  const typeColors = { general: 'bg-gray-100', quote: 'bg-purple-100 text-purple-800', export: 'bg-cyan-100 text-cyan-800', wholesale: 'bg-orange-100 text-orange-800', complaint: 'bg-red-100 text-red-800' };

  const stats = { total: inquiries.length, new: inquiries.filter(i => i.status === 'new').length, inProgress: inquiries.filter(i => i.status === 'in_progress').length };

  return (
    <div className="space-y-6" data-testid="admin-inquiries-page">
      <div><h1 className="font-ui text-2xl font-bold text-primary">Inquiries</h1><p className="text-primary/60 font-ui">Manage customer inquiries and leads</p></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><MessageSquare className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total Inquiries</p><p className="text-xl font-bold text-primary">{stats.total}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Mail className="w-8 h-8 text-blue-500" /><div><p className="text-xs text-primary/60">New</p><p className="text-xl font-bold text-blue-600">{stats.new}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Clock className="w-8 h-8 text-yellow-500" /><div><p className="text-xs text-primary/60">In Progress</p><p className="text-xl font-bold text-yellow-600">{stats.inProgress}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Responded</p><p className="text-xl font-bold text-green-600">{inquiries.filter(i => i.status === 'responded').length}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="new">New</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="responded">Responded</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
        </Select>
      </div>

      <Card className="bg-white border-primary/5">
        <Table>
          <TableHeader><TableRow className="border-primary/10">
            <TableHead className="text-primary/60">Contact</TableHead>
            <TableHead className="text-primary/60">Type</TableHead>
            <TableHead className="text-primary/60">Message</TableHead>
            <TableHead className="text-primary/60">Date</TableHead>
            <TableHead className="text-primary/60">Status</TableHead>
            <TableHead className="text-primary/60 text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={6} className="text-center py-8"><div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" /></TableCell></TableRow>
             : inquiries.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-primary/60">No inquiries found</TableCell></TableRow>
             : inquiries.map(inquiry => (
              <TableRow key={inquiry.id} className="border-primary/10">
                <TableCell>
                  <p className="font-medium text-primary">{inquiry.name}</p>
                  <p className="text-xs text-primary/60">{inquiry.email}</p>
                  {inquiry.company && <p className="text-xs text-primary/50">{inquiry.company}</p>}
                </TableCell>
                <TableCell><Badge className={typeColors[inquiry.inquiry_type] || typeColors.general}>{inquiry.inquiry_type}</Badge></TableCell>
                <TableCell className="max-w-xs truncate text-sm text-primary/70">{inquiry.message}</TableCell>
                <TableCell className="text-sm text-primary/60">{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                <TableCell><Badge className={statusColors[inquiry.status]}>{inquiry.status?.replace('_', ' ')}</Badge></TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setSelectedInquiry(inquiry); setDetailOpen(true); }}>View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader><DialogTitle className="font-ui text-primary">Inquiry Details</DialogTitle></DialogHeader>
          {selectedInquiry && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Badge className={statusColors[selectedInquiry.status]}>{selectedInquiry.status?.replace('_', ' ')}</Badge>
                <Badge className={typeColors[selectedInquiry.inquiry_type] || typeColors.general}>{selectedInquiry.inquiry_type}</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary"><Mail className="w-4 h-4 text-primary/40" /><span>{selectedInquiry.email}</span></div>
                {selectedInquiry.phone && <div className="flex items-center gap-2 text-primary"><Phone className="w-4 h-4 text-primary/40" /><span>{selectedInquiry.phone}</span></div>}
                {selectedInquiry.company && <div className="flex items-center gap-2 text-primary"><Building className="w-4 h-4 text-primary/40" /><span>{selectedInquiry.company}</span></div>}
              </div>
              <div className="bg-surface/30 p-4 rounded-lg">
                <h4 className="font-medium text-primary mb-2">Message</h4>
                <p className="text-primary/80 whitespace-pre-wrap">{selectedInquiry.message}</p>
              </div>
              <p className="text-xs text-primary/50">Received: {new Date(selectedInquiry.created_at).toLocaleString()}</p>
              <div>
                <h4 className="font-medium text-primary mb-2">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {['new', 'in_progress', 'responded', 'closed'].map(s => (
                    <Button key={s} size="sm" variant={selectedInquiry.status === s ? 'default' : 'outline'} className={selectedInquiry.status === s ? 'bg-primary text-white' : ''} onClick={() => updateStatus(selectedInquiry.id, s)}>{s.replace('_', ' ')}</Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminInquiries;
