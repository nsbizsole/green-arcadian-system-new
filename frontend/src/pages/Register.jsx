import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Register = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary" />
              </div>
              <span className="font-heading font-bold text-xl text-white">GreenForge OS</span>
            </Link>
          </div>

          <div className="mb-8">
            <h2 className="font-heading text-2xl font-bold text-white mb-2">Create your account</h2>
            <p className="text-muted-foreground">Start your 14-day free trial</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-white">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                  required
                  data-testid="fullname-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name" className="text-white">Company Name</Label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="company_name"
                  name="company_name"
                  type="text"
                  placeholder="Green Gardens Inc."
                  value={formData.company_name}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                  data-testid="company-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground"
                  required
                  minLength={6}
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 glow-green gap-2"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline" data-testid="login-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-primary/10 via-transparent to-transparent" />
        
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-xl text-white">GreenForge OS</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <h1 className="font-heading text-4xl font-bold text-white">
            Join the Future of
            <br />
            <span className="text-primary">Green Business</span>
          </h1>
          
          <div className="space-y-4">
            {[
              'Unlimited plant inventory tracking',
              'CRM & quote builder included',
              'Project management with Gantt charts',
              'Partner commission automation',
              'E-commerce storefront ready'
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <img 
            src="https://images.unsplash.com/photo-1699297871906-b118f68e9c8e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjY2NzZ8MHwxfHNlYXJjaHwxfHxsYW5kc2NhcGUlMjBhcmNoaXRlY3QlMjB3b3JraW5nJTIwdGFibGV0JTIwc2l0ZXxlbnwwfHx8fDE3NzA0MTIyMzN8MA&ixlib=rb-4.1.0&q=85"
            alt="Plants"
            className="w-full h-48 object-cover rounded-xl opacity-60"
          />
        </div>
      </div>
    </div>
  );
};

export default Register;
