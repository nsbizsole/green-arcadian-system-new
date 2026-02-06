import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Leaf, Truck, Award, Globe } from 'lucide-react';

const featuredProducts = [
  {
    id: '1',
    name: 'Royal Rose Bouquet',
    price: 89,
    image: 'https://images.unsplash.com/photo-1739918064833-5933c5b73070?w=600&h=600&fit=crop',
    category: 'Bouquets'
  },
  {
    id: '2',
    name: 'Tropical Orchid Collection',
    price: 120,
    image: 'https://images.unsplash.com/photo-1677607787276-b1ddee608127?w=600&h=600&fit=crop',
    category: 'Orchids'
  },
  {
    id: '3',
    name: 'Garden Rose Mix',
    price: 65,
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop',
    category: 'Roses'
  },
  {
    id: '4',
    name: 'Exotic Anthurium',
    price: 45,
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop',
    category: 'Plants'
  }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1920&h=1080&fit=crop"
            alt="Plantation"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-paper via-paper/90 to-paper/40" />
        </div>

        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6 animate-slide-up">
              Premium Plantation & Export
            </p>
            <h1 className="font-heading text-6xl md:text-8xl font-light tracking-tight leading-[0.9] text-primary mb-8 animate-slide-up delay-100">
              Nature&apos;s
              <br />
              <span className="italic">Finest</span>
              <br />
              Blooms
            </h1>
            <p className="text-lg text-primary/60 leading-relaxed mb-10 max-w-lg animate-slide-up delay-200">
              From our sustainable plantation to your doorstep. Premium flowers and plants, 
              cultivated with care and exported worldwide.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up delay-300">
              <Link to="/shop">
                <button className="btn-primary flex items-center gap-2" data-testid="shop-now-btn">
                  Shop Collection
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/export">
                <button className="btn-secondary">
                  Export Services
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-surface/30">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Leaf, title: 'Sustainable', desc: 'Eco-friendly cultivation practices' },
              { icon: Award, title: 'Premium Quality', desc: 'Hand-picked, export-grade blooms' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Fresh flowers delivered quickly' },
              { icon: Globe, title: 'Global Export', desc: 'Shipping to 50+ countries' }
            ].map((feature, i) => (
              <div 
                key={feature.title}
                className="flex items-start gap-4 p-6 bg-white/50 border border-primary/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-heading text-xl text-primary mb-1">{feature.title}</h3>
                  <p className="text-sm text-primary/60">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24" data-testid="featured-products">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-3">
                Our Collection
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-normal tracking-tight text-primary">
                Featured Blooms
              </h2>
            </div>
            <Link to="/shop">
              <button className="btn-secondary flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/shop/${product.id}`}
                className="product-card group bg-white/50 border border-primary/5 overflow-hidden"
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image w-full h-full object-cover transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-heading text-xl text-primary mb-2">{product.name}</h3>
                  <p className="font-ui text-lg font-semibold text-primary">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-24 bg-primary text-white">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-6">
                Our Story
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-light tracking-tight mb-8">
                Cultivating Beauty
                <br />
                <span className="italic">Since 2010</span>
              </h2>
              <p className="text-white/60 leading-relaxed mb-8 max-w-lg">
                Green Arcadian began as a small family plantation in the hills of Sri Lanka. 
                Today, we export premium flowers and plants to over 50 countries, 
                while maintaining our commitment to sustainable practices and exceptional quality.
              </p>
              <Link to="/about">
                <button className="rounded-full px-8 py-4 border border-white/20 text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-2">
                  Learn More
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1759514789269-fdbf15059d9e?w=800&h=600&fit=crop"
                alt="Our Greenhouse"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-8 -left-8 bg-accent text-primary p-8">
                <p className="font-heading text-5xl font-bold">15+</p>
                <p className="text-sm font-bold uppercase tracking-widest">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
          <h2 className="font-heading text-4xl md:text-6xl font-light tracking-tight text-primary mb-6">
            Ready to Experience
            <br />
            <span className="italic">Natural Beauty?</span>
          </h2>
          <p className="text-primary/60 max-w-lg mx-auto mb-10">
            Whether you are looking for a beautiful bouquet or bulk export orders, 
            we are here to serve your floral needs.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/shop">
              <button className="btn-primary flex items-center gap-2">
                Browse Shop
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/contact">
              <button className="btn-accent">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
