import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckSquare, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CrewTasks = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/crew/me`);
      setData(res.data);
    } catch (e) { 
      toast.error('Failed to fetch tasks'); 
    } finally { 
      setLoading(false); 
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await axios.put(`${API}/projects/tasks/${taskId}?status=${status}`);
      toast.success('Task status updated');
      fetchData();
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const allTasks = data?.assigned_tasks || [];
  const filteredTasks = filter === 'all' 
    ? allTasks 
    : allTasks.filter(t => t.status === filter);

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    pending: Clock,
    in_progress: AlertCircle,
    completed: CheckCircle2
  };

  return (
    <div className="space-y-6" data-testid="crew-tasks-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-ui text-2xl font-bold text-primary">My Tasks</h1>
          <p className="text-primary/60">Manage and track your assigned tasks</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 bg-white border-primary/10">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tasks</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => {
            const StatusIcon = statusIcons[task.status] || Clock;
            return (
              <Card key={task.id} className={`bg-white border-l-4 ${priorityColors[task.priority]?.split(' ')[2] || 'border-primary/20'}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-2">
                        <StatusIcon className={`w-5 h-5 mt-0.5 ${task.status === 'completed' ? 'text-green-600' : task.status === 'in_progress' ? 'text-blue-600' : 'text-gray-400'}`} />
                        <div>
                          <h3 className="font-ui font-semibold text-primary text-lg">{task.title}</h3>
                          {task.description && (
                            <p className="text-primary/60 mt-1">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-4 ml-8">
                        <Badge className={priorityColors[task.priority] || priorityColors.medium}>
                          {task.priority} priority
                        </Badge>
                        <Badge className={statusColors[task.status] || statusColors.pending}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-primary/50 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Due: {new Date(task.end_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-8 lg:ml-0">
                      {task.status === 'pending' && (
                        <Button 
                          onClick={() => updateTaskStatus(task.id, 'in_progress')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Start Task
                        </Button>
                      )}
                      {task.status === 'in_progress' && (
                        <Button 
                          onClick={() => updateTaskStatus(task.id, 'completed')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Mark Complete
                        </Button>
                      )}
                      {task.status === 'completed' && (
                        <Badge className="bg-green-100 text-green-800 px-4 py-2">
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Done
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="bg-white border-primary/5">
            <CardContent className="p-12 text-center">
              <CheckSquare className="w-16 h-16 text-primary/20 mx-auto mb-4" />
              <h3 className="font-ui text-lg font-medium text-primary mb-2">No Tasks Found</h3>
              <p className="text-primary/60">
                {filter === 'all' 
                  ? "You don't have any tasks assigned yet."
                  : `No tasks with status "${filter.replace('_', ' ')}".`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CrewTasks;
