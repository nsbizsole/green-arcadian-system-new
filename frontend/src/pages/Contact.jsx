import { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiry_type: 'general',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/inquiries`, formData);
      toast.success('Thank you! We will get back to you soon.');
      setFormData({ name: '', email: '', phone: '', company: '', inquiry_type: 'general', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-28 pb-24" data-testid="contact-page">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
              Get In Touch
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-primary">
              Contact Us
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="font-heading text-3xl text-primary mb-8">
                We would love to hear from you
              </h2>
              <p className="text-primary/60 leading-relaxed mb-10">
                Whether you have a question about our products, export services, or just want 
                to say hello, we are here to help. Reach out to us through any of the channels below.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-primary mb-1">Address</h3>
                    <p className="text-primary/60">123 Plantation Road, Colombo 07, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-primary mb-1">Phone</h3>
                    <p className="text-primary/60">+94 11 234 5678</p>
                    <p className="text-primary/60">+94 77 123 4567 (WhatsApp)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-primary mb-1">Email</h3>
                    <p className="text-primary/60">hello@greenarcadian.com</p>
                    <p className="text-primary/60">export@greenarcadian.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg text-primary mb-1">Business Hours</h3>
                    <p className="text-primary/60">Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-primary/60">Saturday: 8:00 AM - 2:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 lg:p-10 border border-primary/5">
              <h2 className="font-heading text-2xl text-primary mb-6">Send us a message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="contact-form">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-primary">Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-12 bg-paper border-primary/10 rounded-none"
                      required
                      data-testid="name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary">Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-12 bg-paper border-primary/10 rounded-none"
                      required
                      data-testid="email-input"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-primary">Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="h-12 bg-paper border-primary/10 rounded-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary">Company</Label>
                    <Input
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="h-12 bg-paper border-primary/10 rounded-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Inquiry Type</Label>
                  <Select 
                    value={formData.inquiry_type} 
                    onValueChange={(value) => setFormData({ ...formData, inquiry_type: value })}
                  >
                    <SelectTrigger className="h-12 bg-paper border-primary/10 rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="order">Product Order</SelectItem>
                      <SelectItem value="export">Export Quote</SelectItem>
                      <SelectItem value="wholesale">Wholesale Inquiry</SelectItem>
                      <SelectItem value="corporate">Corporate/Events</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Message *</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="min-h-[150px] bg-paper border-primary/10 rounded-none"
                    required
                    data-testid="message-input"
                  />
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
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
