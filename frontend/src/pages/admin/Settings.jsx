import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, User, Bell, Shield, Palette, Save, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AdminSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    company: user?.company || ''
  });
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [notifications, setNotifications] = useState({
    email_orders: true,
    email_inquiries: true,
    email_users: true,
    email_low_stock: true
  });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API}/auth/profile`, profileForm);
      toast.success('Profile updated!');
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
      toast.success('Password changed!');
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-settings-page">
      <div>
        <h1 className="font-ui text-2xl font-bold text-primary">Settings</h1>
        <p className="text-primary/60 font-ui">Manage your account and system preferences</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-surface/50 border border-primary/10">
          <TabsTrigger value="profile" className="data-[state=active]:bg-white">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-white">
            <Shield className="w-4 h-4 mr-2" /> Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-white">
            <Bell className="w-4 h-4 mr-2" /> Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card className="bg-white border-primary/5">
            <CardHeader>
              <CardTitle className="font-ui text-primary">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    className="bg-paper border-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="bg-paper border-primary/10"
                  />
                  <p className="text-xs text-primary/50">Email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="bg-paper border-primary/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={profileForm.company}
                    onChange={(e) => setProfileForm({ ...profileForm, company: e.target.value })}
                    className="bg-paper border-primary/10"
                  />
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                  {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card className="bg-white border-primary/5">
            <CardHeader>
              <CardTitle className="font-ui text-primary">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={passwordLoading}>
                  {passwordLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Lock className="w-4 h-4 mr-2" /> Change Password</>}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-white border-primary/5 mt-6">
            <CardHeader>
              <CardTitle className="font-ui text-primary">Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-primary/50">Role</p>
                  <p className="font-medium text-primary capitalize">{user?.role}</p>
                </div>
                <div>
                  <p className="text-primary/50">Status</p>
                  <p className="font-medium text-primary capitalize">{user?.status}</p>
                </div>
                <div>
                  <p className="text-primary/50">Member Since</p>
                  <p className="font-medium text-primary">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-primary/50">User ID</p>
                  <p className="font-medium text-primary text-xs truncate">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="bg-white border-primary/5">
            <CardHeader>
              <CardTitle className="font-ui text-primary">Email Notifications</CardTitle>
              <CardDescription>Configure when you receive email alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">New Orders</p>
                    <p className="text-sm text-primary/60">Get notified when a new order is placed</p>
                  </div>
                  <Switch checked={notifications.email_orders} onCheckedChange={(v) => setNotifications({ ...notifications, email_orders: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">New Inquiries</p>
                    <p className="text-sm text-primary/60">Get notified when a new inquiry is submitted</p>
                  </div>
                  <Switch checked={notifications.email_inquiries} onCheckedChange={(v) => setNotifications({ ...notifications, email_inquiries: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">User Registrations</p>
                    <p className="text-sm text-primary/60">Get notified when new users sign up</p>
                  </div>
                  <Switch checked={notifications.email_users} onCheckedChange={(v) => setNotifications({ ...notifications, email_users: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Low Stock Alerts</p>
                    <p className="text-sm text-primary/60">Get notified when inventory is low</p>
                  </div>
                  <Switch checked={notifications.email_low_stock} onCheckedChange={(v) => setNotifications({ ...notifications, email_low_stock: v })} />
                </div>
                <p className="text-xs text-primary/50 pt-4">Note: Email notifications require email integration to be configured.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
