import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Checkout = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_address: '',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        ...formData,
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        subtotal: total,
        shipping: 0,
        total: total,
        order_type: 'retail'
      };

      const response = await axios.post(`${API}/orders/public`, orderData);
      setOrderNumber(response.data.order_number);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="pt-32 pb-24" data-testid="checkout-success">
          <div className="max-w-lg mx-auto px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-heading text-4xl text-primary mb-4">Order Placed!</h1>
            <p className="text-primary/60 mb-2">Thank you for your order.</p>
            <p className="font-ui font-semibold text-primary mb-8">Order Number: {orderNumber}</p>
            <p className="text-primary/60 mb-8">
              We will contact you shortly to confirm your order and arrange delivery.
            </p>
            <Button onClick={() => navigate('/shop')} className="btn-primary">
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-32 pb-24" data-testid="checkout-page">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight text-primary mb-12">
            Checkout
          </h1>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Form */}
            <div>
              <h2 className="font-heading text-2xl text-primary mb-6">Delivery Information</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6" data-testid="checkout-form">
                <div className="space-y-2">
                  <Label className="text-primary">Full Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    className="h-12 bg-white border-primary/10 rounded-none"
                    required
                    data-testid="name-input"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-primary">Email *</Label>
                    <Input
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      className="h-12 bg-white border-primary/10 rounded-none"
                      required
                      data-testid="email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-primary">Phone *</Label>
                    <Input
                      value={formData.customer_phone}
                      onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                      className="h-12 bg-white border-primary/10 rounded-none"
                      required
                      data-testid="phone-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Delivery Address *</Label>
                  <Textarea
                    value={formData.customer_address}
                    onChange={(e) => setFormData({ ...formData, customer_address: e.target.value })}
                    className="min-h-[100px] bg-white border-primary/10 rounded-none"
                    required
                    data-testid="address-input"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-primary">Order Notes (Optional)</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="min-h-[80px] bg-white border-primary/10 rounded-none"
                    placeholder="Special instructions for delivery..."
                  />
                </div>

                <Button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading}
                  data-testid="place-order-btn"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    `Place Order - $${total.toFixed(2)}`
                  )}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-surface/30 p-8 sticky top-28">
                <h2 className="font-heading text-2xl text-primary mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-primary">{item.name}</p>
                        <p className="text-sm text-primary/60">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-ui font-semibold text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-primary/10 pt-4 space-y-2">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-primary/10">
                    <span className="font-heading text-xl text-primary">Total</span>
                    <span className="font-heading text-2xl text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
