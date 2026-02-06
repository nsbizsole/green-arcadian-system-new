import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';

const Cart = () => {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <main className="pt-32 pb-24" data-testid="cart-page">
          <div className="max-w-[1600px] mx-auto px-6 lg:px-12 text-center">
            <ShoppingBag className="w-20 h-20 text-primary/20 mx-auto mb-6" />
            <h1 className="font-heading text-4xl text-primary mb-4">Your Cart is Empty</h1>
            <p className="text-primary/60 mb-8">Looks like you have not added anything yet.</p>
            <Link to="/shop">
              <button className="btn-primary flex items-center gap-2 mx-auto">
                <ArrowLeft className="w-5 h-5" />
                Continue Shopping
              </button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-32 pb-24" data-testid="cart-page">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          <h1 className="font-heading text-5xl md:text-6xl font-light tracking-tight text-primary mb-12">
            Shopping Cart
          </h1>

          <div className="grid lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex gap-6 p-6 bg-white border border-primary/5"
                  data-testid={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-xl text-primary mb-1">{item.name}</h3>
                    <p className="text-primary/60 text-sm mb-4">${item.price} each</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-primary/20">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-primary/5 transition-colors"
                        >
                          <Minus className="w-4 h-4 text-primary" />
                        </button>
                        <span className="w-12 text-center font-ui font-semibold text-primary">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center hover:bg-primary/5 transition-colors"
                        >
                          <Plus className="w-4 h-4 text-primary" />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <p className="font-ui text-lg font-semibold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-primary/40 hover:text-terracotta transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <Link to="/shop" className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-surface/30 p-8 sticky top-28">
                <h2 className="font-heading text-2xl text-primary mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-primary/60">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-primary/60">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                </div>

                <div className="border-t border-primary/10 pt-4 mb-8">
                  <div className="flex justify-between">
                    <span className="font-heading text-xl text-primary">Total</span>
                    <span className="font-heading text-2xl text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                <Link to="/checkout">
                  <Button className="btn-primary w-full flex items-center justify-center gap-2" data-testid="checkout-btn">
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
