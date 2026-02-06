import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  FolderKanban,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertCircle
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const statusConfig = {
  planning: { color: 'bg-blue-500/20 text-blue-400', icon: Clock },
  in_progress: { color: 'bg-yellow-500/20 text-yellow-400', icon: AlertCircle },
  completed: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
  on_hold: { color: 'bg-gray-500/20 text-gray-400', icon: Clock }
};

const projectTypes = ['landscaping', 'maintenance', 'installation', 'design', 'consultation'];

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedProject, setExpandedProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client_name: '',
    client_email: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    project_type: 'landscaping'
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    priority: 'medium'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API}/projects`);
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`${API}/projects/${projectId}/tasks`);
      setTasks(prev => ({ ...prev, [projectId]: response.data }));
    } catch (error) {
      console.error('Failed to fetch tasks');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        budget: parseFloat(formData.budget) || 0
      };
      
      if (selectedProject) {
        await axios.put(`${API}/projects/${selectedProject.id}`, payload);
        toast.success('Project updated');
      } else {
        await axios.post(`${API}/projects`, payload);
        toast.success('Project created');
      }
      setDialogOpen(false);
      resetForm();
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save project');
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!expandedProject) return;
    
    try {
      await axios.post(`${API}/projects/tasks`, {
        ...taskForm,
        project_id: expandedProject
      });
      toast.success('Task added');
      setTaskDialogOpen(false);
      setTaskForm({ title: '', description: '', start_date: '', end_date: '', priority: 'medium' });
      fetchTasks(expandedProject);
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const handleStatusChange = async (projectId, newStatus) => {
    try {
      await axios.put(`${API}/projects/${projectId}`, { status: newStatus });
      toast.success('Status updated');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleTaskStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`${API}/projects/tasks/${taskId}?status=${newStatus}`);
      toast.success('Task updated');
      if (expandedProject) fetchTasks(expandedProject);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (projectId) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await axios.delete(`${API}/projects/${projectId}`);
      toast.success('Project deleted');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const editProject = (project) => {
    setSelectedProject(project);
    setFormData({
      name: project.name,
      client_name: project.client_name,
      client_email: project.client_email || '',
      description: project.description || '',
      start_date: project.start_date.split('T')[0],
      end_date: project.end_date.split('T')[0],
      budget: project.budget.toString(),
      project_type: project.project_type
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setSelectedProject(null);
    setFormData({
      name: '',
      client_name: '',
      client_email: '',
      description: '',
      start_date: '',
      end_date: '',
      budget: '',
      project_type: 'landscaping'
    });
  };

  const toggleProject = (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      if (!tasks[projectId]) fetchTasks(projectId);
    }
  };

  const getProgress = (project) => {
    const projectTasks = tasks[project.id] || [];
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getDaysRemaining = (endDate) => {
    const diff = new Date(endDate) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6" data-testid="projects-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Projects</h1>
          <p className="text-muted-foreground">Manage landscaping projects and work orders</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 gap-2"
          onClick={() => { resetForm(); setDialogOpen(true); }}
          data-testid="add-project-btn"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-[#0A0A0A] border-white/10">
          <CardContent className="p-12 text-center">
            <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No projects yet. Create your first project!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="bg-[#0A0A0A] border-white/10 hover:border-primary/30 transition-colors"
              data-testid={`project-card-${project.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => toggleProject(project.id)}>
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-white">{project.name}</CardTitle>
                      <Badge className={statusConfig[project.status]?.color}>
                        {project.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {project.client_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {getDaysRemaining(project.end_date)} days left
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => editProject(project)}>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'in_progress')}>Mark In Progress</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(project.id, 'completed')}>Mark Complete</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(project.id)} className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-white">{getProgress(project)}%</span>
                  </div>
                  <Progress value={getProgress(project)} className="h-2" />
                </div>

                {/* Expanded Tasks */}
                {expandedProject === project.id && (
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-white">Tasks</h4>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-white/20"
                        onClick={() => setTaskDialogOpen(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Task
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {(tasks[project.id] || []).length === 0 ? (
                        <p className="text-sm text-muted-foreground">No tasks yet</p>
                      ) : (
                        (tasks[project.id] || []).map((task) => (
                          <div 
                            key={task.id} 
                            className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleTaskStatusChange(task.id, task.status === 'completed' ? 'pending' : 'completed')}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  task.status === 'completed' 
                                    ? 'bg-primary border-primary' 
                                    : 'border-white/30 hover:border-primary'
                                }`}
                              >
                                {task.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </button>
                              <span className={task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-white'}>
                                {task.title}
                              </span>
                            </div>
                            <Badge variant="outline" className="border-white/20 text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {selectedProject ? 'Edit Project' : 'New Project'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4" data-testid="project-form">
            <div className="space-y-2">
              <Label>Project Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10"
                required
                data-testid="project-name-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Client Email</Label>
                <Input
                  type="email"
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Budget ($)</Label>
                <Input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Project Type</Label>
                <Select value={formData.project_type} onValueChange={(v) => setFormData({ ...formData, project_type: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {projectTypes.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-white/5 border-white/10"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90" data-testid="save-project-btn">
                {selectedProject ? 'Update' : 'Create'} Project
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent className="bg-[#0A0A0A] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTaskSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Task Title *</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Input
                  type="date"
                  value={taskForm.start_date}
                  onChange={(e) => setTaskForm({ ...taskForm, start_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Input
                  type="date"
                  value={taskForm.end_date}
                  onChange={(e) => setTaskForm({ ...taskForm, end_date: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Add Task</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
