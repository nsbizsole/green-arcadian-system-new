import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { ArrowLeft, Minus, Plus, ShoppingBag, Truck, Shield, Leaf } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const sampleProducts = {
  '1': { id: '1', name: 'Royal Rose Bouquet', price: 89, category: 'Bouquets', image_url: 'https://images.unsplash.com/photo-1739918064833-5933c5b73070?w=800&h=800&fit=crop', description: 'A stunning arrangement of premium long-stem roses in rich red and soft pink hues. Perfect for anniversaries, romantic occasions, or as a luxurious gift.', care_info: 'Keep in fresh water, change every 2 days. Trim stems at an angle. Display away from direct sunlight and heat sources.' },
  '2': { id: '2', name: 'Tropical Orchid Collection', price: 120, category: 'Orchids', image_url: 'https://images.unsplash.com/photo-1677607787276-b1ddee608127?w=800&h=800&fit=crop', description: 'Exotic phalaenopsis orchids from our greenhouse, featuring multiple blooms in pristine white with delicate purple centers.', care_info: 'Water weekly, allow roots to dry between watering. Indirect light. Orchid fertilizer monthly.' },
  '3': { id: '3', name: 'Garden Rose Mix', price: 65, category: 'Roses', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&h=800&fit=crop', description: 'A charming mix of garden roses in seasonal colors. Each bouquet is unique, featuring a variety of rose varieties.', care_info: 'Fresh water daily, cool location. Lasts 7-10 days with proper care.' },
  '4': { id: '4', name: 'Exotic Anthurium', price: 45, category: 'Plants', image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=800&h=800&fit=crop', description: 'Striking red anthurium with glossy heart-shaped flowers. A popular choice for modern interiors.', care_info: 'Indirect light, water when top inch of soil is dry. Mist leaves regularly for humidity.' }
};

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      // Use sample product
      setProduct(sampleProducts[productId] || sampleProducts['1']);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-paper">
        <Navbar />
        <div className="pt-32 text-center">
          <p className="text-primary/60">Product not found</p>
          <Link to="/shop" className="text-primary underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-28 pb-24" data-testid="product-detail-page">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Breadcrumb */}
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-2 text-primary/60 hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Image */}
            <div className="aspect-square bg-surface/30 overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details */}
            <div className="py-8">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-4">
                {product.category}
              </p>
              <h1 className="font-heading text-4xl md:text-5xl font-normal tracking-tight text-primary mb-6">
                {product.name}
              </h1>
              <p className="font-ui text-3xl font-bold text-primary mb-8">
                ${product.price}
              </p>

              <p className="text-primary/60 leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center border border-primary/20 rounded-full">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-primary/5 transition-colors rounded-l-full"
                    data-testid="decrease-qty"
                  >
                    <Minus className="w-4 h-4 text-primary" />
                  </button>
                  <span className="w-16 text-center font-ui font-semibold text-primary">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-primary/5 transition-colors rounded-r-full"
                    data-testid="increase-qty"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="btn-primary flex items-center gap-2 flex-1 md:flex-none"
                  data-testid="add-to-cart-btn"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </Button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-8 border-t border-primary/10">
                <div className="text-center">
                  <Truck className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-primary/60">Fast Delivery</p>
                </div>
                <div className="text-center">
                  <Shield className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-primary/60">Quality Guarantee</p>
                </div>
                <div className="text-center">
                  <Leaf className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-xs text-primary/60">Fresh & Natural</p>
                </div>
              </div>

              {/* Care Info */}
              {product.care_info && (
                <div className="bg-surface/30 p-6 mt-6">
                  <h3 className="font-heading text-lg text-primary mb-3">Care Instructions</h3>
                  <p className="text-sm text-primary/60 leading-relaxed">{product.care_info}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
