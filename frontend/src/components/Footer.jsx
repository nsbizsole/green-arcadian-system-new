import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* Large Typography Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="text-[20vw] font-heading font-light whitespace-nowrap">
          Green Arcadian
        </span>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-white font-heading text-2xl">G</span>
              </div>
              <span className="font-heading text-3xl">Green Arcadian</span>
            </div>
            <p className="text-white/60 max-w-md leading-relaxed mb-8">
              Premium flowers and plants from our sustainable plantation. 
              Exporting natural beauty worldwide since 2010.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl mb-6">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link to="/shop" className="text-white/60 hover:text-white transition-colors">Shop</Link>
              <Link to="/about" className="text-white/60 hover:text-white transition-colors">About Us</Link>
              <Link to="/export" className="text-white/60 hover:text-white transition-colors">Export Services</Link>
              <Link to="/contact" className="text-white/60 hover:text-white transition-colors">Contact</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-xl mb-6">Contact</h4>
            <div className="flex flex-col gap-4 text-white/60">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>123 Plantation Road, Colombo, Sri Lanka</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 flex-shrink-0" />
                <span>hello@greenarcadian.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/40 text-sm">
            © 2026 Green Arcadian. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
