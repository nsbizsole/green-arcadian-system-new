import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, FileText, Eye } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  shipped: 'bg-blue-100 text-blue-800'
};

const ExportDocs = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [formData, setFormData] = useState({
    order_id: '', doc_type: 'packing_list', customer_name: '', destination_country: '',
    items: [{ name: '', quantity: 0, weight: 0 }], total_weight: '', total_boxes: ''
  });

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const response = await axios.get(`${API}/admin/exports`);
      setDocs(response.data);
    } catch (error) {
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/admin/exports`, {
        ...formData,
        total_weight: parseFloat(formData.total_weight),
        total_boxes: parseInt(formData.total_boxes)
      });
      toast.success('Document created');
      setDialogOpen(false);
      fetchDocs();
    } catch (error) {
      toast.error('Failed to create document');
    }
  };

  const updateStatus = async (docId, newStatus) => {
    try {
      await axios.put(`${API}/admin/exports/${docId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchDocs();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6" data-testid="exports-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">Export Documents</h1>
          <p className="text-primary/60 font-ui">Manage packing lists and certificates</p>
        </div>
        <Button className="btn-primary gap-2" onClick={() => setDialogOpen(true)} data-testid="create-doc-btn">
          <Plus className="w-4 h-4" /> Create Document
        </Button>
      </div>

      <div className="bg-white border border-primary/5 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10">
              <TableHead className="text-primary/60 font-ui">Document</TableHead>
              <TableHead className="text-primary/60 font-ui">Type</TableHead>
              <TableHead className="text-primary/60 font-ui">Customer</TableHead>
              <TableHead className="text-primary/60 font-ui">Destination</TableHead>
              <TableHead className="text-primary/60 font-ui">Status</TableHead>
              <TableHead className="text-primary/60 font-ui text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
              </TableCell></TableRow>
            ) : docs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-primary/60">No documents found</TableCell></TableRow>
            ) : (
              docs.map((doc) => (
                <TableRow key={doc.id} className="border-primary/10">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-surface flex items-center justify-center rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-primary">{doc.doc_number}</p>
                        <p className="text-xs text-primary/60">{new Date(doc.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline" className="border-primary/20">{doc.doc_type.replace('_', ' ')}</Badge></TableCell>
                  <TableCell className="text-primary">{doc.customer_name}</TableCell>
                  <TableCell className="text-primary">{doc.destination_country}</TableCell>
                  <TableCell>
                    <Select value={doc.status} onValueChange={(v) => updateStatus(doc.id, v)}>
                      <SelectTrigger className={`w-28 ${statusColors[doc.status]}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => setSelectedDoc(doc)}>
                      <Eye className="w-4 h-4 text-primary/60" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-ui text-primary">Create Export Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Document Type</Label>
                <Select value={formData.doc_type} onValueChange={(v) => setFormData({ ...formData, doc_type: v })}>
                  <SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="packing_list">Packing List</SelectItem>
                    <SelectItem value="phytosanitary">Phytosanitary Certificate</SelectItem>
                    <SelectItem value="commercial_invoice">Commercial Invoice</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Order ID</Label>
                <Input value={formData.order_id} onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                  className="bg-paper border-primary/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Customer Name *</Label>
                <Input value={formData.customer_name} onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  className="bg-paper border-primary/10" required />
              </div>
              <div className="space-y-2">
                <Label>Destination Country *</Label>
                <Input value={formData.destination_country} onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                  className="bg-paper border-primary/10" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Weight (kg) *</Label>
                <Input type="number" step="0.1" value={formData.total_weight} onChange={(e) => setFormData({ ...formData, total_weight: e.target.value })}
                  className="bg-paper border-primary/10" required />
              </div>
              <div className="space-y-2">
                <Label>Total Boxes *</Label>
                <Input type="number" value={formData.total_boxes} onChange={(e) => setFormData({ ...formData, total_boxes: e.target.value })}
                  className="bg-paper border-primary/10" required />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="btn-primary">Create</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent className="bg-white border-primary/10 max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-ui text-primary">{selectedDoc?.doc_number}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-primary/60">Type</p><p className="text-primary font-medium">{selectedDoc.doc_type.replace('_', ' ')}</p></div>
                <div><p className="text-primary/60">Status</p><Badge className={statusColors[selectedDoc.status]}>{selectedDoc.status}</Badge></div>
                <div><p className="text-primary/60">Customer</p><p className="text-primary">{selectedDoc.customer_name}</p></div>
                <div><p className="text-primary/60">Destination</p><p className="text-primary">{selectedDoc.destination_country}</p></div>
                <div><p className="text-primary/60">Total Weight</p><p className="text-primary">{selectedDoc.total_weight} kg</p></div>
                <div><p className="text-primary/60">Total Boxes</p><p className="text-primary">{selectedDoc.total_boxes}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExportDocs;
