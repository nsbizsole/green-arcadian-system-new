import { Link } from 'react-router-dom';
import { Clock, Leaf, Mail } from 'lucide-react';
import { Button } from '../../components/ui/button';

const PendingApproval = () => {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-6" data-testid="pending-page">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-primary" />
        </div>
        
        <h1 className="font-heading text-3xl text-primary mb-4">Account Pending Approval</h1>
        
        <p className="text-primary/60 mb-8">
          Your account has been created and is waiting for admin approval. 
          You will receive an email notification once your account is activated.
        </p>

        <div className="bg-white p-6 rounded-lg border border-primary/10 mb-8">
          <div className="flex items-center justify-center gap-3 text-primary/80">
            <Mail className="w-5 h-5" />
            <span>Check your email for updates</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link to="/login">
            <Button variant="outline" className="w-full border-primary/20 text-primary">
              Try Signing In
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full text-primary/60">
              ← Back to Website
            </Button>
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-primary/40">
          <Leaf className="w-4 h-4" />
          <span className="text-sm">Green Arcadian</span>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
