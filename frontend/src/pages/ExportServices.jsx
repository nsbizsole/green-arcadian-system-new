import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Plane, FileCheck, Package, Clock, Shield, Globe } from 'lucide-react';

const ExportServices = () => {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-28" data-testid="export-page">
        {/* Hero */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">
                  Global Export Services
                </p>
                <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-primary mb-8">
                  Premium Flowers
                  <br />
                  <span className="italic">Worldwide</span>
                </h1>
                <p className="text-lg text-primary/60 leading-relaxed mb-8">
                  We export premium flowers and plants to over 50 countries. With our 
                  state-of-the-art cold chain logistics and comprehensive documentation, 
                  your orders arrive fresh and compliant.
                </p>
                <Link to="/contact">
                  <button className="btn-primary flex items-center gap-2">
                    Request Export Quote
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1624137308635-96d0a1e9ff4c?w=800&h=600&fit=crop"
                  alt="Export Logistics"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="py-24 bg-surface/30">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
                What We Offer
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-normal tracking-tight text-primary">
                Export Services
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: Package, title: 'Bulk Orders', desc: 'Large volume orders for wholesalers, florists, and event companies. Competitive pricing for bulk purchases.' },
                { icon: FileCheck, title: 'Documentation', desc: 'Complete export documentation including phytosanitary certificates, packing lists, and customs clearance.' },
                { icon: Plane, title: 'Air Freight', desc: 'Temperature-controlled air freight to ensure your flowers arrive fresh at their destination.' },
                { icon: Clock, title: 'Fast Processing', desc: 'Quick turnaround from order to shipment. Same-day processing for urgent orders.' },
                { icon: Shield, title: 'Quality Assurance', desc: 'Rigorous quality checks at every stage. Only export-grade products leave our facility.' },
                { icon: Globe, title: 'Global Network', desc: 'Established partnerships with freight forwarders and agents in 50+ countries.' }
              ].map((service) => (
                <div key={service.title} className="p-8 bg-white border border-primary/5 hover:border-primary/20 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                    <service.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-4">{service.title}</h3>
                  <p className="text-primary/60">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Export Products */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
                Export Catalog
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-normal tracking-tight text-primary">
                What We Export
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Cut Flowers', desc: 'Roses, orchids, anthuriums, lilies', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=400&h=400&fit=crop' },
                { name: 'Foliage', desc: 'Tropical greens and fillers', image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop' },
                { name: 'Potted Plants', desc: 'Orchids, succulents, tropicals', image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop' },
                { name: 'Dried Flowers', desc: 'Preserved and dried arrangements', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=400&h=400&fit=crop' }
              ].map((item) => (
                <div key={item.name} className="bg-white border border-primary/5 overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
                  <div className="p-5">
                    <h3 className="font-heading text-xl text-primary mb-2">{item.name}</h3>
                    <p className="text-sm text-primary/60">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Destinations */}
        <section className="py-24 bg-primary text-white">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40 mb-4">
                Our Reach
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-light tracking-tight">
                Export Destinations
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
              {['Europe', 'Middle East', 'Japan', 'Australia', 'USA', 'Singapore', 'Hong Kong', 'Maldives', 'UK', 'Netherlands', 'Germany', 'UAE'].map((dest) => (
                <div key={dest} className="p-4 bg-white/5 border border-white/10">
                  <p className="font-medium">{dest}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight text-primary mb-6">
              Ready to Place an Export Order?
            </h2>
            <p className="text-primary/60 max-w-lg mx-auto mb-10">
              Contact our export team for pricing, minimum order quantities, and shipping options to your country.
            </p>
            <Link to="/contact">
              <button className="btn-accent">
                Contact Export Team
              </button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ExportServices;
