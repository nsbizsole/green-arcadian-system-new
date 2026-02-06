import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Award, Leaf, Globe } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-28" data-testid="about-page">
        {/* Hero */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-6">
                  Our Story
                </p>
                <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-primary mb-8">
                  Growing Beauty
                  <br />
                  <span className="italic">Since 2010</span>
                </h1>
                <p className="text-lg text-primary/60 leading-relaxed mb-6">
                  Green Arcadian started as a small family plantation in the lush hills of Sri Lanka. 
                  What began as a passion for cultivating beautiful flowers has grown into a 
                  world-class export operation serving clients across 50+ countries.
                </p>
                <p className="text-lg text-primary/60 leading-relaxed">
                  Our commitment to sustainable practices, exceptional quality, and customer 
                  satisfaction remains at the heart of everything we do.
                </p>
              </div>
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1759514789269-fdbf15059d9e?w=800&h=600&fit=crop"
                  alt="Our Greenhouse"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-24 bg-primary text-white">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { value: '15+', label: 'Years Experience' },
                { value: '50+', label: 'Export Countries' },
                { value: '100K+', label: 'Happy Customers' },
                { value: '500+', label: 'Flower Varieties' }
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-heading text-5xl md:text-6xl font-light mb-2">{stat.value}</p>
                  <p className="text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
                What We Stand For
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-normal tracking-tight text-primary">
                Our Values
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: Leaf, title: 'Sustainability', desc: 'Eco-friendly farming practices that protect our environment for future generations.' },
                { icon: Award, title: 'Quality', desc: 'Only the finest blooms make it from our plantation to your hands.' },
                { icon: Users, title: 'Community', desc: 'Supporting local farmers and providing fair employment opportunities.' },
                { icon: Globe, title: 'Global Reach', desc: 'Delivering natural beauty to customers around the world.' }
              ].map((value) => (
                <div key={value.title} className="p-8 bg-surface/30 border border-primary/5 hover:border-primary/20 transition-all duration-300">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                    <value.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-heading text-2xl text-primary mb-4">{value.title}</h3>
                  <p className="text-primary/60">{value.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 bg-surface/30">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
            <div className="text-center mb-16">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
                The People Behind The Blooms
              </p>
              <h2 className="font-heading text-4xl md:text-6xl font-normal tracking-tight text-primary">
                Our Team
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { name: 'Sarah Fernando', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop' },
                { name: 'David Perera', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
                { name: 'Priya Silva', role: 'Export Manager', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop' }
              ].map((member) => (
                <div key={member.name} className="text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-48 h-48 rounded-full object-cover mx-auto mb-6"
                  />
                  <h3 className="font-heading text-xl text-primary">{member.name}</h3>
                  <p className="text-primary/60">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
            <h2 className="font-heading text-4xl md:text-5xl font-light tracking-tight text-primary mb-8">
              Want to Work With Us?
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <button className="btn-primary flex items-center gap-2">
                  Get in Touch
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
