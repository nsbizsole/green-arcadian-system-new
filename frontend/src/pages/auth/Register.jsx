import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Leaf, Mail, Lock, User, Phone, Building, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Textarea } from '../../components/ui/textarea';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    company: '',
    address: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await register(formData);
      if (result.status === 'pending') {
        toast.success('Account created! Waiting for admin approval.');
        navigate('/pending');
      } else {
        toast.success('Account created successfully!');
        const portalRoutes = {
          admin: '/admin',
          manager: '/admin',
          partner: '/partner',
          crew: '/crew',
          customer: '/customer',
          vendor: '/vendor'
        };
        navigate(portalRoutes[formData.role] || '/');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'customer', label: 'Customer', desc: 'Shop and order products' },
    { value: 'partner', label: 'Sales Partner', desc: 'Earn commissions on referrals' },
    { value: 'vendor', label: 'Vendor/Supplier', desc: 'Supply products' },
    { value: 'crew', label: 'Crew Member', desc: 'Work on projects and maintenance' }
  ];

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6" data-testid="register-page">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-heading text-3xl text-primary mb-2">Green Arcadian</h1>
          </Link>
          <p className="text-primary/60">Create your account</p>
        </div>

        <div className="bg-white p-8 border border-primary/10 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div className="space-y-2">
              <Label className="text-primary">Account Type</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger className="h-12 bg-paper border-primary/10" data-testid="role-select">
                  <SelectValue placeholder="Select account type" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div>
                        <span className="font-medium">{role.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">- {role.desc}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-primary">Full Name *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="pl-10 h-11 bg-paper border-primary/10"
                    required
                    data-testid="name-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-primary">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10 h-11 bg-paper border-primary/10"
                    data-testid="phone-input"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 h-11 bg-paper border-primary/10"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary">Password *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 h-11 bg-paper border-primary/10"
                  required
                  minLength={6}
                  data-testid="password-input"
                />
              </div>
            </div>

            {(formData.role === 'partner' || formData.role === 'vendor') && (
              <div className="space-y-2">
                <Label className="text-primary">Company Name</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="pl-10 h-11 bg-paper border-primary/10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-primary">Address</Label>
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="bg-paper border-primary/10 min-h-[80px]"
                placeholder="Your address..."
              />
            </div>

            <div className="bg-accent/10 p-4 rounded-lg">
              <p className="text-sm text-primary/80">
                <strong>Note:</strong> Your account will be reviewed by our team. 
                You will receive access once approved.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white rounded-full"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-primary/60">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
