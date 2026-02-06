import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Leaf,
  Gift,
  Star,
  ArrowRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const categories = ['All', 'Indoor Plants', 'Outdoor Plants', 'Succulents', 'Terrariums', 'Gift Sets', 'Tools'];

// Sample products for the store (since we don't have seed data)
const sampleProducts = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    category: 'Indoor Plants',
    price: 45.99,
    description: 'The iconic Swiss Cheese Plant with stunning split leaves.',
    image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&h=400&fit=crop',
    is_featured: true,
    is_gift: false
  },
  {
    id: '2',
    name: 'Snake Plant',
    category: 'Indoor Plants',
    price: 29.99,
    description: 'Low maintenance air-purifying plant perfect for beginners.',
    image_url: 'https://images.unsplash.com/photo-1593482892540-60f1b4a35b44?w=400&h=400&fit=crop',
    is_featured: true,
    is_gift: false
  },
  {
    id: '3',
    name: 'Corporate Gift Box',
    category: 'Gift Sets',
    price: 89.99,
    description: 'Curated plant gift box perfect for corporate gifting.',
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    is_featured: true,
    is_gift: true
  },
  {
    id: '4',
    name: 'Succulent Collection',
    category: 'Succulents',
    price: 34.99,
    description: 'Set of 5 assorted succulents in decorative pots.',
    image_url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400&h=400&fit=crop',
    is_featured: false,
    is_gift: false
  },
  {
    id: '5',
    name: 'Forest Terrarium',
    category: 'Terrariums',
    price: 65.00,
    description: 'Self-sustaining glass terrarium with moss and ferns.',
    image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=400&fit=crop',
    is_featured: true,
    is_gift: true
  },
  {
    id: '6',
    name: 'Fiddle Leaf Fig',
    category: 'Indoor Plants',
    price: 79.99,
    description: 'Statement plant with large, violin-shaped leaves.',
    image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=400&fit=crop',
    is_featured: false,
    is_gift: false
  }
];

const Store = () => {
  const [products, setProducts] = useState(sampleProducts);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Try to fetch products from API, fallback to sample data
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/store/products`);
        if (response.data.length > 0) {
          setProducts(response.data);
        }
      } catch (error) {
        // Use sample products
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <span className="font-heading font-bold text-xl text-white">GreenForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-muted-foreground hover:text-white transition-colors">Home</Link>
            <Link to="/courses" className="text-muted-foreground hover:text-white transition-colors">Courses</Link>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" className="relative">
              <ShoppingCart className="w-5 h-5 text-white" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-xs flex items-center justify-center text-white">
                  {cart.length}
                </span>
              )}
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="text-white">Sign In</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 pb-16" data-testid="store-page">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4">
              Plant Shop
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Premium plants, terrariums, and garden supplies. Corporate gifting available.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 text-white"
                data-testid="store-search"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={selectedCategory === cat ? "bg-primary" : "border-white/20 text-white hover:bg-white/5"}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Featured Banner */}
          <div className="glass-card p-8 mb-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <Badge className="bg-primary/20 text-primary mb-4">
                  <Gift className="w-3 h-3 mr-1" />
                  Corporate Gifting
                </Badge>
                <h2 className="font-heading text-2xl font-bold text-white mb-2">
                  Bulk Orders & Custom Gifting
                </h2>
                <p className="text-muted-foreground">
                  Perfect for corporate events, client appreciation, and team celebrations.
                </p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 gap-2">
                Request Quote
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div 
                key={product.id}
                className="glass-card overflow-hidden group hover:border-primary/30 transition-all duration-300"
                data-testid={`product-card-${product.id}`}
              >
                <div className="relative h-48 bg-white/5">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.is_featured && (
                    <Badge className="absolute top-3 left-3 bg-primary/90">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {product.is_gift && (
                    <Badge className="absolute top-3 right-3 bg-pink-500/90">
                      <Gift className="w-3 h-3 mr-1" />
                      Gift
                    </Badge>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-heading font-semibold text-white">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <p className="font-heading text-xl font-bold text-primary">
                      ${product.price}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {product.description}
                  </p>
                  <Button 
                    className="w-full bg-white/5 hover:bg-primary text-white"
                    onClick={() => addToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <Leaf className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 GreenForge OS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Store;
