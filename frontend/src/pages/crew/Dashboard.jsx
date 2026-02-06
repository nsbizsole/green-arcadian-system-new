import { Card, CardContent } from '../../components/ui/card';
import { CheckSquare } from 'lucide-react';
const CrewDashboard = () => (
  <div className="space-y-6">
    <div><h1 className="font-ui text-2xl font-bold text-primary">Crew Dashboard</h1><p className="text-primary/60">Your tasks and schedules</p></div>
    <Card className="bg-white border-primary/5"><CardContent className="p-12 text-center"><CheckSquare className="w-16 h-16 text-primary/20 mx-auto mb-4" /><p className="text-primary/60">No tasks assigned yet.</p></CardContent></Card>
  </div>
);
export default CrewDashboard;
