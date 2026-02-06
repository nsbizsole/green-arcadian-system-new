import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Building, 
  Globe,
  Bell,
  Shield,
  Palette
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';

const Settings = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    company_name: user?.company_name || ''
  });
  const [notifications, setNotifications] = useState({
    email_alerts: true,
    low_stock: true,
    new_leads: true,
    project_updates: false
  });

  const handleProfileSave = () => {
    toast.success('Profile updated successfully');
  };

  return (
    <div className="space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="profile" className="data-[state=active]:bg-primary">
            <User className="w-4 h-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="business" className="data-[state=active]:bg-primary">
            <Building className="w-4 h-4 mr-2" />
            Business
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-primary">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card className="bg-[#0A0A0A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-primary">
                    {profileData.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <Button variant="outline" className="border-white/20">
                  Change Avatar
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Full Name</Label>
                  <Input
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Email</Label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Role</Label>
                <Input
                  value={user?.role || 'admin'}
                  disabled
                  className="bg-white/5 border-white/10 text-muted-foreground capitalize"
                />
              </div>

              <Button className="bg-primary hover:bg-primary/90" onClick={handleProfileSave}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business">
          <Card className="bg-[#0A0A0A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Business Settings</CardTitle>
              <CardDescription>Configure your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Company Name</Label>
                  <Input
                    value={profileData.company_name}
                    onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Business Type</Label>
                  <Select defaultValue="nursery">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nursery">Plant Nursery</SelectItem>
                      <SelectItem value="landscaping">Landscaping Company</SelectItem>
                      <SelectItem value="maintenance">Maintenance Services</SelectItem>
                      <SelectItem value="export">Export Business</SelectItem>
                      <SelectItem value="retail">Retail Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-white">Currency</Label>
                  <Select defaultValue="USD">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="LKR">LKR (Rs)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Country</Label>
                  <Select defaultValue="US">
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="LK">Sri Lanka</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90" onClick={() => toast.success('Business settings saved')}>
                Save Settings
              </Button>
            </CardContent>
          </Card>

          {/* Tenant Info */}
          <Card className="bg-[#0A0A0A] border-white/10 mt-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tenant ID</p>
                  <p className="font-mono text-white">{user?.tenant_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">User ID</p>
                  <p className="font-mono text-white">{user?.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card className="bg-[#0A0A0A] border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Notification Preferences</CardTitle>
              <CardDescription>Choose what alerts you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Email Alerts</p>
                    <p className="text-sm text-muted-foreground">Receive important updates via email</p>
                  </div>
                  <Switch
                    checked={notifications.email_alerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, email_alerts: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Low Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when inventory is low</p>
                  </div>
                  <Switch
                    checked={notifications.low_stock}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, low_stock: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">New Lead Notifications</p>
                    <p className="text-sm text-muted-foreground">Alert when new leads are added</p>
                  </div>
                  <Switch
                    checked={notifications.new_leads}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, new_leads: checked })}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div>
                    <p className="font-medium text-white">Project Updates</p>
                    <p className="text-sm text-muted-foreground">Receive project milestone notifications</p>
                  </div>
                  <Switch
                    checked={notifications.project_updates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, project_updates: checked })}
                  />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90" onClick={() => toast.success('Notification preferences saved')}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
