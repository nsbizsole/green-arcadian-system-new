import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, Edit, Eye, FolderKanban, Calendar, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const projectTypes = ['landscaping', 'hardscaping', 'garden_design', 'irrigation', 'maintenance', 'restoration'];
const projectStatuses = ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'];

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [form, setForm] = useState({
    name: '', client_name: '', client_email: '', client_phone: '', project_type: 'landscaping',
    description: '', site_address: '', start_date: '', end_date: '', budget: ''
  });

  useEffect(() => { fetchProjects(); }, [statusFilter]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      const res = await axios.get(`${API}/projects?${params}`);
      setProjects(res.data);
    } catch (e) { toast.error('Failed to fetch projects'); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/projects`, { ...form, budget: parseFloat(form.budget || 0) });
      toast.success('Project created!');
      setDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (e) { toast.error('Failed to create project'); }
  };

  const openDetail = async (project) => {
    try {
      const res = await axios.get(`${API}/projects/${project.id}`);
      setSelectedProject(res.data);
      setDetailOpen(true);
    } catch (e) { toast.error('Failed to load project'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API}/projects/${id}`, { status });
      toast.success('Status updated');
      fetchProjects();
      if (selectedProject?.id === id) openDetail({ id });
    } catch (e) { toast.error('Failed to update'); }
  };

  const resetForm = () => setForm({ name: '', client_name: '', client_email: '', client_phone: '', project_type: 'landscaping', description: '', site_address: '', start_date: '', end_date: '', budget: '' });

  const statusColors = { planning: 'bg-blue-100 text-blue-800', in_progress: 'bg-yellow-100 text-yellow-800', on_hold: 'bg-gray-100 text-gray-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' };

  const stats = { total: projects.length, active: projects.filter(p => ['planning', 'in_progress'].includes(p.status)).length, completed: projects.filter(p => p.status === 'completed').length, totalBudget: projects.reduce((s, p) => s + (p.budget || 0), 0) };

  return (
    <div className="space-y-6" data-testid="admin-projects-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-ui text-2xl font-bold text-primary">Landscaping Projects</h1><p className="text-primary/60 font-ui">Manage projects, BOQ, timelines, and crew logs</p></div>
        <Button className="bg-primary hover:bg-primary/90 text-white gap-2" onClick={() => { resetForm(); setDialogOpen(true); }}><Plus className="w-4 h-4" />New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><FolderKanban className="w-8 h-8 text-primary/40" /><div><p className="text-xs text-primary/60">Total Projects</p><p className="text-xl font-bold text-primary">{stats.total}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><Calendar className="w-8 h-8 text-yellow-500" /><div><p className="text-xs text-primary/60">Active</p><p className="text-xl font-bold text-primary">{stats.active}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><CheckCircle2 className="w-8 h-8 text-green-500" /><div><p className="text-xs text-primary/60">Completed</p><p className="text-xl font-bold text-primary">{stats.completed}</p></div></div></CardContent></Card>
        <Card className="bg-white border-primary/5"><CardContent className="p-4"><div className="flex items-center gap-3"><DollarSign className="w-8 h-8 text-accent" /><div><p className="text-xs text-primary/60">Total Budget</p><p className="text-xl font-bold text-primary">${stats.totalBudget.toLocaleString()}</p></div></div></CardContent></Card>
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{projectStatuses.map(s => <SelectItem key={s} value={s} className="capitalize">{s.replace('_', ' ')}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {loading ? <div className="text-center py-12"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" /></div>
         : projects.length === 0 ? <Card className="bg-white"><CardContent className="p-12 text-center"><FolderKanban className="w-16 h-16 text-primary/20 mx-auto mb-4" /><p className="text-primary/60">No projects found</p></CardContent></Card>
         : projects.map(project => (
          <Card key={project.id} className="bg-white border-primary/5 hover:border-primary/20 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-ui font-semibold text-primary text-lg">{project.name}</h3>
                    <Badge className={statusColors[project.status]}>{project.status.replace('_', ' ')}</Badge>
                    <Badge variant="outline" className="capitalize">{project.project_type.replace('_', ' ')}</Badge>
                  </div>
                  <p className="text-sm text-primary/60 mb-2">Client: {project.client_name}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-primary/50">
                    <span>#{project.project_number}</span>
                    <span>Budget: ${project.budget?.toLocaleString()}</span>
                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                  {project.progress > 0 && <div className="mt-3"><Progress value={project.progress} className="h-2" /></div>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(project)}><Eye className="w-4 h-4 mr-1" />View</Button>
                  {project.status === 'planning' && <Button size="sm" className="bg-primary text-white" onClick={() => updateStatus(project.id, 'in_progress')}>Start</Button>}
                  {project.status === 'in_progress' && <Button size="sm" className="bg-green-600 text-white" onClick={() => updateStatus(project.id, 'completed')}>Complete</Button>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">New Project</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Project Name *</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Project Type</Label><Select value={form.project_type} onValueChange={v => setForm({...form, project_type: v})}><SelectTrigger className="bg-paper border-primary/10"><SelectValue /></SelectTrigger><SelectContent>{projectTypes.map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Client Name *</Label><Input value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Client Email</Label><Input type="email" value={form.client_email} onChange={e => setForm({...form, client_email: e.target.value})} className="bg-paper border-primary/10" /></div>
              <div className="space-y-2"><Label>Client Phone</Label><Input value={form.client_phone} onChange={e => setForm({...form, client_phone: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2"><Label>Site Address *</Label><Input value={form.site_address} onChange={e => setForm({...form, site_address: e.target.value})} className="bg-paper border-primary/10" required /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Start Date *</Label><Input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>End Date *</Label><Input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="bg-paper border-primary/10" required /></div>
              <div className="space-y-2"><Label>Budget ($)</Label><Input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="bg-paper border-primary/10" rows={3} /></div>
            <div className="flex justify-end gap-3 pt-4"><Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Create Project</Button></div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-ui text-primary">{selectedProject?.name}</DialogTitle></DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              <div className="flex items-center gap-3"><Badge className={statusColors[selectedProject.status]}>{selectedProject.status.replace('_', ' ')}</Badge><Badge variant="outline">#{selectedProject.project_number}</Badge></div>
              <div className="grid grid-cols-2 gap-6">
                <div><h4 className="font-medium text-primary mb-2">Client Information</h4><p className="text-primary/80">{selectedProject.client_name}</p>{selectedProject.client_email && <p className="text-sm text-primary/60">{selectedProject.client_email}</p>}{selectedProject.client_phone && <p className="text-sm text-primary/60">{selectedProject.client_phone}</p>}</div>
                <div><h4 className="font-medium text-primary mb-2">Project Details</h4><p className="text-sm text-primary/60">Site: {selectedProject.site_address}</p><p className="text-sm text-primary/60">Budget: ${selectedProject.budget?.toLocaleString()}</p><p className="text-sm text-primary/60">Duration: {selectedProject.start_date} - {selectedProject.end_date}</p></div>
              </div>
              {selectedProject.tasks?.length > 0 && (<div><h4 className="font-medium text-primary mb-3">Tasks ({selectedProject.tasks.length})</h4><div className="space-y-2">{selectedProject.tasks.map(t => (<div key={t.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg"><span className="text-primary">{t.title}</span><Badge variant="outline">{t.status}</Badge></div>))}</div></div>)}
              {selectedProject.crew_logs?.length > 0 && (<div><h4 className="font-medium text-primary mb-3">Crew Logs ({selectedProject.crew_logs.length})</h4><div className="space-y-2">{selectedProject.crew_logs.slice(0, 5).map(l => (<div key={l.id} className="flex items-center justify-between p-3 bg-surface/30 rounded-lg"><div><span className="text-primary">{l.tasks_completed}</span><p className="text-xs text-primary/50">{l.date}</p></div><span className="text-primary font-medium">{l.hours_worked}h</span></div>))}</div></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProjects;
