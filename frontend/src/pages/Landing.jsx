import { Link } from 'react-router-dom';
import { 
  Leaf, 
  BarChart3, 
  Users, 
  FolderKanban, 
  Handshake, 
  ShoppingCart,
  CalendarClock,
  GraduationCap,
  ArrowRight,
  Check,
  Globe,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '../components/ui/button';

const features = [
  {
    icon: Leaf,
    title: 'Plant Inventory',
    description: 'Real-time stock tracking with batch management, growth stages, and multi-location support.'
  },
  {
    icon: Users,
    title: 'CRM Pipeline',
    description: 'Dynamic quote builder with lead tracking, deal stages, and automated follow-ups.'
  },
  {
    icon: FolderKanban,
    title: 'Project Management',
    description: 'Gantt charts, work orders, crew logs, and client signoff workflows.'
  },
  {
    icon: CalendarClock,
    title: 'AMC Billing',
    description: 'Auto-scheduling maintenance visits with recurring invoice generation.'
  },
  {
    icon: Handshake,
    title: 'Partner Portal',
    description: 'Commission calculator with deal locking and automated payout tracking.'
  },
  {
    icon: ShoppingCart,
    title: 'E-Commerce',
    description: 'B2B/B2C storefront with corporate gifting and bulk RFQ capabilities.'
  }
];

const stats = [
  { value: '1000+', label: 'Green Businesses' },
  { value: '50M+', label: 'Plants Tracked' },
  { value: '99.9%', label: 'Uptime' },
  { value: '24/7', label: 'Support' }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden">
      {/* Noise Overlay */}
      <div className="fixed inset-0 noise-overlay pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl">GreenForge OS</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/store" className="text-muted-foreground hover:text-white transition-colors">Store</Link>
            <Link to="/courses" className="text-muted-foreground hover:text-white transition-colors">Courses</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-white" data-testid="login-btn">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary hover:bg-primary/90 glow-green" data-testid="get-started-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary">World's Best Green Business Platform</span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Transform Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Green Business
                </span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg">
                Unified platform for plantation, nursery, landscaping, and maintenance businesses. 
                Replace Excel chaos with intelligent automation.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 glow-green gap-2" data-testid="hero-cta-btn">
                    Start Free Trial
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/store">
                  <Button size="lg" variant="outline" className="border-white/20 hover:bg-white/5">
                    Browse Store
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-4">
                {[
                  'Multi-tenant ready',
                  'Multi-currency',
                  'White-label'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl opacity-30" />
              <div className="relative glass-card p-8 rounded-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1760661829532-4822e399abed?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzV8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBncmVlbmhvdXNlJTIwaW50ZXJpb3IlMjBuaWdodCUyMGxpZ2h0c3xlbnwwfHx8fDE3NzA0MTIyMzJ8MA&ixlib=rb-4.1.0&q=85"
                  alt="Modern greenhouse"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <BarChart3 className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Real-time Analytics</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <Globe className="w-8 h-8 text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Global Scale</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 border-y border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-heading text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Scale
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From seedling to enterprise. All modules work seamlessly together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="group glass-card p-6 hover:border-primary/50 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses & Store Preview */}
      <section className="py-20 px-6 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Courses */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-8 h-8 text-primary" />
                <h3 className="font-heading text-2xl font-bold">Learn & Grow</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Expert-led courses on plant care, business management, and landscaping techniques.
              </p>
              <Link to="/courses">
                <Button variant="outline" className="border-white/20 hover:bg-white/5 gap-2">
                  Browse Courses
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Store */}
            <div className="glass-card p-8">
              <div className="flex items-center gap-3 mb-6">
                <ShoppingCart className="w-8 h-8 text-primary" />
                <h3 className="font-heading text-2xl font-bold">Online Store</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Premium plants, terrariums, and garden supplies. Corporate gifting available.
              </p>
              <Link to="/store">
                <Button variant="outline" className="border-white/20 hover:bg-white/5 gap-2">
                  Shop Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10" />
            <div className="relative">
              <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">
                Ready to Transform Your Business?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Join thousands of green businesses already using GreenForge OS to streamline operations and scale globally.
              </p>
              <Link to="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 glow-green gap-2">
                  Start Your Free Trial
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading font-bold">GreenForge OS</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 GreenForge OS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
