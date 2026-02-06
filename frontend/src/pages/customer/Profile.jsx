import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Building, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Profile = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    address: user?.address || ''
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/auth/profile`, form);
      toast.success('Profile updated');
    } catch (e) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6" data-testid="profile-page">
      <div><h1 className="font-ui text-2xl font-bold text-primary">My Profile</h1><p className="text-primary/60">Manage your account information</p></div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="bg-white border-primary/5">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4"><span className="text-4xl font-bold text-primary">{user?.full_name?.charAt(0)}</span></div>
            <h2 className="font-ui text-xl font-bold text-primary">{user?.full_name}</h2>
            <p className="text-primary/60">{user?.email}</p>
            <Badge className="mt-3 capitalize">{user?.role}</Badge>
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/5 lg:col-span-2">
          <CardHeader><CardTitle className="font-ui text-primary">Edit Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" /><Input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} className="pl-10 bg-paper border-primary/10" /></div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" /><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="pl-10 bg-paper border-primary/10" /></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" /><Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="pl-10 bg-paper border-primary/10" /></div>
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="bg-paper border-primary/10" rows={3} />
            </div>
            <Button onClick={handleSave} className="bg-primary hover:bg-primary/90 text-white gap-2" disabled={saving}>
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4" />Save Changes</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-primary/5">
        <CardHeader><CardTitle className="font-ui text-primary">Account Details</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div><p className="text-primary/60">Email</p><p className="font-medium text-primary">{user?.email}</p></div>
            <div><p className="text-primary/60">Role</p><p className="font-medium text-primary capitalize">{user?.role}</p></div>
            <div><p className="text-primary/60">Status</p><Badge className="bg-green-100 text-green-800">{user?.status}</Badge></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
