import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../contexts/CartContext';
import { Search, Filter, ShoppingBag } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = ['All', 'Bouquets', 'Roses', 'Orchids', 'Plants', 'Arrangements', 'Corporate'];

// Sample products
const sampleProducts = [
  { id: '1', name: 'Royal Rose Bouquet', price: 89, category: 'Bouquets', image_url: 'https://images.unsplash.com/photo-1739918064833-5933c5b73070?w=600&h=600&fit=crop', description: 'Elegant arrangement of premium roses', is_featured: true },
  { id: '2', name: 'Tropical Orchid Collection', price: 120, category: 'Orchids', image_url: 'https://images.unsplash.com/photo-1677607787276-b1ddee608127?w=600&h=600&fit=crop', description: 'Exotic orchids from our greenhouse', is_featured: true },
  { id: '3', name: 'Garden Rose Mix', price: 65, category: 'Roses', image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=600&h=600&fit=crop', description: 'Mixed garden roses in seasonal colors', is_featured: false },
  { id: '4', name: 'Exotic Anthurium', price: 45, category: 'Plants', image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop', description: 'Striking red anthurium plant', is_featured: true },
  { id: '5', name: 'White Lily Arrangement', price: 78, category: 'Arrangements', image_url: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&h=600&fit=crop', description: 'Pure white lilies in elegant vase', is_featured: false },
  { id: '6', name: 'Corporate Gift Box', price: 150, category: 'Corporate', image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600&h=600&fit=crop', description: 'Premium gift box for corporate clients', is_featured: true },
  { id: '7', name: 'Sunflower Bundle', price: 55, category: 'Bouquets', image_url: 'https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=600&h=600&fit=crop', description: 'Bright sunflowers to brighten any day', is_featured: false },
  { id: '8', name: 'Monstera Deliciosa', price: 85, category: 'Plants', image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=600&h=600&fit=crop', description: 'Popular tropical houseplant', is_featured: false }
];

const Shop = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      if (response.data.length > 0) {
        setProducts(response.data);
      }
    } catch (error) {
      // Use sample products
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Navbar />

      <main className="pt-32 pb-24" data-testid="shop-page">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-primary/60 mb-4">
              Our Collection
            </p>
            <h1 className="font-heading text-5xl md:text-7xl font-light tracking-tight text-primary">
              Shop Flowers & Plants
            </h1>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-white border-primary/10 text-primary rounded-full"
                data-testid="search-input"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={`rounded-full ${
                    selectedCategory === cat 
                      ? 'bg-primary text-white' 
                      : 'border-primary/20 text-primary hover:bg-primary/5'
                  }`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                to={`/shop/${product.id}`}
                className="product-card group bg-white/50 border border-primary/5 overflow-hidden"
                data-testid={`product-card-${product.id}`}
              >
                <div className="aspect-square overflow-hidden relative">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image w-full h-full object-cover transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    className="absolute bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary-light"
                    data-testid={`add-to-cart-${product.id}`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-primary/40 mb-2">
                    {product.category}
                  </p>
                  <h3 className="font-heading text-xl text-primary mb-2">{product.name}</h3>
                  <p className="text-sm text-primary/60 mb-3 line-clamp-2">{product.description}</p>
                  <p className="font-ui text-xl font-semibold text-primary">${product.price}</p>
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-primary/60">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
