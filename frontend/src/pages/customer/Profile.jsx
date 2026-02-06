import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, MapPin, Save, Lock, ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const CustomerProfile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    fetchOrderCount();
  }, [user]);

  const fetchOrderCount = async () => {
    try {
      const res = await axios.get(`${API}/orders/my/all`);
      setOrderCount(res.data.length);
    } catch (e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/auth/profile`, form);
      toast.success('Profile updated successfully!');
    } catch (e) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await axios.put(`${API}/auth/change-password?old_password=${encodeURIComponent(passwordForm.old_password)}&new_password=${encodeURIComponent(passwordForm.new_password)}`);
      toast.success('Password changed successfully!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="customer-profile-page">
      <div>
        <h1 className="font-ui text-2xl font-bold text-primary">My Profile</h1>
        <p className="text-primary/60">Manage your account settings</p>
      </div>

      <Card className="bg-accent/10 border-accent/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-white">{user?.full_name?.charAt(0) || 'C'}</span>
            </div>
            <div className="flex-1">
              <h3 className="font-ui font-bold text-primary text-xl">{user?.full_name}</h3>
              <p className="text-primary/60">{user?.email}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-primary">
                <ShoppingBag className="w-5 h-5" />
                <span className="font-bold text-lg">{orderCount}</span>
              </div>
              <p className="text-sm text-primary/50">orders placed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-white border-primary/5">
          <CardHeader>
            <CardTitle className="font-ui text-primary flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="pl-10 bg-paper border-primary/10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={user?.email || ''}
                    className="pl-10 bg-paper border-primary/10"
                    disabled
                  />
                </div>
                <p className="text-xs text-primary/50">Email cannot be changed</p>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-10 bg-paper border-primary/10"
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Delivery Address</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="bg-paper border-primary/10"
                  rows={3}
                  placeholder="Your default delivery address"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white border-primary/5">
          <CardHeader>
            <CardTitle className="font-ui text-primary flex items-center gap-2">
              <Lock className="w-5 h-5" /> Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="bg-paper border-primary/10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="bg-paper border-primary/10"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="bg-paper border-primary/10"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-white"
                disabled={passwordLoading}
              >
                {passwordLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" /> Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-surface/30 border-primary/5">
        <CardContent className="p-6">
          <h3 className="font-ui font-medium text-primary mb-2">Account Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-primary/50">Account Type</p>
              <p className="font-medium text-primary capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-primary/50">Status</p>
              <p className="font-medium text-primary capitalize">{user?.status}</p>
            </div>
            <div>
              <p className="text-primary/50">Member Since</p>
              <p className="font-medium text-primary">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-primary/50">Total Orders</p>
              <p className="font-medium text-primary">{orderCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
