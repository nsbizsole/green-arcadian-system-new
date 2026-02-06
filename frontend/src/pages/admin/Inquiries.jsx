import { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Mail, Phone, Building } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800'
};

const typeColors = {
  general: 'bg-gray-100 text-gray-800',
  order: 'bg-purple-100 text-purple-800',
  export: 'bg-orange-100 text-orange-800',
  wholesale: 'bg-cyan-100 text-cyan-800',
  corporate: 'bg-pink-100 text-pink-800'
};

const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchInquiries(); }, [statusFilter]);

  const fetchInquiries = async () => {
    try {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await axios.get(`${API}/admin/inquiries${params}`);
      setInquiries(response.data);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (inquiryId, newStatus) => {
    try {
      await axios.put(`${API}/admin/inquiries/${inquiryId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6" data-testid="inquiries-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">Inquiries</h1>
          <p className="text-primary/60 font-ui">Manage customer inquiries</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-white border-primary/10">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Inquiries</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">Contact</TableHead>
              <TableHead className="text-primary/60 font-ui">Type</TableHead>
              <TableHead className="text-primary/60 font-ui">Message</TableHead>
              <TableHead className="text-primary/60 font-ui">Date</TableHead>
              <TableHead className="text-primary/60 font-ui">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </TableCell></TableRow>
            ) : inquiries.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-primary/60">No inquiries found</TableCell></TableRow>
            ) : (
              inquiries.map((inquiry) => (
                <TableRow key={inquiry.id} className="border-primary/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{inquiry.name}</p>
                        <div className="flex items-center gap-3 text-xs text-primary/60">
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inquiry.email}</span>
                          {inquiry.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inquiry.phone}</span>}
                        </div>
                        {inquiry.company && <p className="text-xs text-primary/60 flex items-center gap-1 mt-1"><Building className="w-3 h-3" />{inquiry.company}</p>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge className={typeColors[inquiry.inquiry_type]}>{inquiry.inquiry_type}</Badge></TableCell>
                  <TableCell className="max-w-xs">
                    <p className="text-primary/80 truncate">{inquiry.message}</p>
                  </TableCell>
                  <TableCell className="text-primary/60 text-sm">{new Date(inquiry.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Select value={inquiry.status} onValueChange={(v) => updateStatus(inquiry.id, v)}>
                      <SelectTrigger className={`w-28 ${statusColors[inquiry.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Inquiries;
