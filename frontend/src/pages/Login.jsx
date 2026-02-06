import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Leaf, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-3xl text-primary mb-2">Green Arcadian</h1>
          <p className="text-primary/60">Admin Portal</p>
        </div>

        <div className="bg-white p-8 border border-primary/5">
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label className="text-primary">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <Input
                  type="email"
                  placeholder="admin@greenarcadian.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-12 bg-paper border-primary/10 rounded-none"
                  required
                  data-testid="email-input"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-primary">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 h-12 bg-paper border-primary/10 rounded-none"
                  required
                  data-testid="password-input"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="btn-primary w-full flex items-center justify-center gap-2"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
