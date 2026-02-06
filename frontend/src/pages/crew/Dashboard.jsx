import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { CheckSquare, ClipboardList, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CrewDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/crew/me`);
      setData(res.data);
    } catch (e) { 
      toast.error('Failed to fetch data'); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );

  const tasks = data?.assigned_tasks || [];
  const visits = data?.scheduled_visits || [];
  const logs = data?.recent_logs || [];

  const priorityColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800'
  };

  return (
    <div className="space-y-6" data-testid="crew-dashboard">
      <div>
        <h1 className="font-ui text-2xl font-bold text-primary">Welcome, {data?.user?.full_name}</h1>
        <p className="text-primary/60">Your tasks and schedules for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Assigned Tasks</p>
                <p className="text-2xl font-bold text-primary">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Scheduled Visits</p>
                <p className="text-2xl font-bold text-primary">{visits.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-primary/60">Logs This Week</p>
                <p className="text-2xl font-bold text-primary">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-ui text-primary flex items-center gap-2">
              <CheckSquare className="w-5 h-5" /> Assigned Tasks
            </CardTitle>
            <Link to="/crew/tasks">
              <Button variant="ghost" size="sm" className="text-primary/60">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tasks.length > 0 ? (
              <div className="space-y-3">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="p-4 bg-surface/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-primary">{task.title}</h4>
                      <Badge className={priorityColors[task.priority] || priorityColors.medium}>
                        {task.priority}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-primary/60 mb-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-primary/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due: {new Date(task.end_date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline" className="capitalize">{task.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-primary/20 mx-auto mb-3" />
                <p className="text-primary/60">No tasks assigned yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-ui text-primary flex items-center gap-2">
              <Calendar className="w-5 h-5" /> Scheduled Visits
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length > 0 ? (
              <div className="space-y-3">
                {visits.slice(0, 5).map(visit => (
                  <div key={visit.id} className="p-4 bg-surface/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-primary">AMC Visit</h4>
                      <Badge className="bg-blue-100 text-blue-800">{visit.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-primary/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(visit.scheduled_date).toLocaleDateString()}
                      </span>
                    </div>
                    {visit.notes && (
                      <p className="text-sm text-primary/50 mt-2">{visit.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-primary/20 mx-auto mb-3" />
                <p className="text-primary/60">No scheduled visits</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-ui text-primary flex items-center gap-2">
            <ClipboardList className="w-5 h-5" /> Recent Work Logs
          </CardTitle>
          <Link to="/crew/logs">
            <Button variant="ghost" size="sm" className="text-primary/60">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 5).map(log => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-surface/30 rounded-lg">
                  <div>
                    <p className="font-medium text-primary">{log.tasks_completed}</p>
                    <p className="text-sm text-primary/60">{new Date(log.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{log.hours_worked}h</p>
                    <p className="text-xs text-primary/50">hours logged</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ClipboardList className="w-12 h-12 text-primary/20 mx-auto mb-3" />
              <p className="text-primary/60">No work logs yet</p>
              <Link to="/crew/logs">
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-white">
                  Submit Your First Log
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CrewDashboard;
