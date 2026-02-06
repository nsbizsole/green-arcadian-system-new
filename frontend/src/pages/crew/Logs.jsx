import { useState, useEffect } from 'react';
import axios from 'axios';
import { ClipboardList, Plus, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CrewLogs = () => {
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    project_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '',
    tasks_completed: '',
    notes: ''
  });

  useEffect(() => { 
    fetchData(); 
    fetchProjects();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/crew/me`);
      setData(res.data);
    } catch (e) { 
      toast.error('Failed to fetch logs'); 
    } finally { 
      setLoading(false); 
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await axios.get(`${API}/projects`);
      setProjects(res.data);
    } catch (e) { 
      console.error('Failed to fetch projects');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/crew/log`, {
        ...form,
        crew_member_id: data?.user?.id,
        hours_worked: parseFloat(form.hours_worked)
      });
      toast.success('Work log submitted!');
      setDialogOpen(false);
      setForm({
        project_id: '',
        date: new Date().toISOString().split('T')[0],
        hours_worked: '',
        tasks_completed: '',
        notes: ''
      });
      fetchData();
    } catch (e) {
      toast.error('Failed to submit log');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const logs = data?.recent_logs || [];
  const totalHours = logs.reduce((sum, log) => sum + (log.hours_worked || 0), 0);

  return (
    <div className="space-y-6" data-testid="crew-logs-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">Work Logs</h1>
          <p className="text-primary/60">Track your daily work and hours</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white gap-2" 
          onClick={() => setDialogOpen(true)}
          data-testid="add-log-btn"
        >
          <Plus className="w-4 h-4" /> Submit Work Log
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Total Logs</p>
                <p className="text-2xl font-bold text-primary">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Total Hours Logged</p>
                <p className="text-2xl font-bold text-primary">{totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader>
          <CardTitle className="font-ui text-primary flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Work Log History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.map(log => (
                <div key={log.id} className="p-4 bg-surface/30 rounded-lg border border-primary/5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="font-medium text-primary mb-1">{log.tasks_completed}</h4>
                      {log.notes && (
                        <p className="text-sm text-primary/60">{log.notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-primary/50">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(log.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.hours_worked} hours
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{log.hours_worked}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="font-ui text-lg font-medium text-primary mb-2">No Work Logs Yet</h3>
              <p className="text-primary/60 mb-4">Start tracking your work by submitting your first log.</p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white"
                onClick={() => setDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" /> Submit First Log
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white border-primary/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="font-ui text-primary">Submit Work Log</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Project *</Label>
              <Select 
                value={form.project_id} 
                onValueChange={(v) => setForm({...form, project_id: v})}
              >
                <SelectTrigger className="bg-paper border-primary/10">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map(p => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date *</Label>
                <Input 
                  type="date" 
                  value={form.date} 
                  onChange={e => setForm({...form, date: e.target.value})} 
                  className="bg-paper border-primary/10" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label>Hours Worked *</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0.5" 
                  max="24"
                  value={form.hours_worked} 
                  onChange={e => setForm({...form, hours_worked: e.target.value})} 
                  className="bg-paper border-primary/10" 
                  placeholder="e.g., 8"
                  required 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tasks Completed *</Label>
              <Input 
                value={form.tasks_completed} 
                onChange={e => setForm({...form, tasks_completed: e.target.value})} 
                className="bg-paper border-primary/10" 
                placeholder="Brief description of work done"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea 
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
                className="bg-paper border-primary/10" 
                placeholder="Any additional details..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                Submit Log
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrewLogs;
