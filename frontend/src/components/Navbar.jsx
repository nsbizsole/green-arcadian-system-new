import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingBag, Menu, X, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/export', label: 'Export' },
    { path: '/contact', label: 'Contact' },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'partner': return '/partner';
      case 'crew': return '/crew';
      case 'customer': return '/customer';
      default: return '/customer';
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" data-testid="logo">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-white font-heading text-xl">G</span>
            </div>
            <span className="font-heading text-2xl text-primary tracking-tight">
              Green Arcadian
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-primary/70 hover:text-primary transition-colors font-medium"
                data-testid={`nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side - Cart, Auth, Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative p-2 hover:bg-primary/5 rounded-full transition-colors"
              data-testid="cart-btn"
            >
              <ShoppingBag className="w-6 h-6 text-primary" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-terracotta text-white text-xs rounded-full flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth - Desktop */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 hover:bg-primary/10 transition-colors"
                    data-testid="user-menu-btn"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {user?.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-primary font-medium max-w-[120px] truncate">
                      {user?.full_name?.split(' ')[0] || 'User'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-primary/60 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-primary/10 rounded-xl shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-primary/10">
                        <p className="font-medium text-primary">{user?.full_name}</p>
                        <p className="text-sm text-primary/60 truncate">{user?.email}</p>
                        <p className="text-xs text-primary/40 capitalize mt-1">{user?.role} Account</p>
                      </div>
                      <Link
                        to={getDashboardPath()}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                        data-testid="dashboard-link"
                      >
                        <LayoutDashboard className="w-5 h-5 text-primary/60" />
                        <span className="text-primary">Dashboard</span>
                      </Link>
                      <Link
                        to={`${getDashboardPath()}/profile`}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors"
                      >
                        <User className="w-5 h-5 text-primary/60" />
                        <span className="text-primary">Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left"
                        data-testid="logout-btn"
                      >
                        <LogOut className="w-5 h-5 text-red-500" />
                        <span className="text-red-600">Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login">
                    <button 
                      className="px-5 py-2 text-primary font-medium hover:bg-primary/5 rounded-full transition-colors"
                      data-testid="login-btn"
                    >
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register">
                    <button 
                      className="px-5 py-2 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
                      data-testid="register-btn"
                    >
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-primary/5 rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="mobile-menu-btn"
            >
              {mobileOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-primary" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden py-6 border-t border-primary/10">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-primary/70 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="border-t border-primary/10 my-4" />
              
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-primary/5 rounded-lg mb-2">
                    <p className="font-medium text-primary">{user?.full_name}</p>
                    <p className="text-sm text-primary/60 capitalize">{user?.role} Account</p>
                  </div>
                  <Link
                    to={getDashboardPath()}
                    className="flex items-center gap-3 text-primary hover:bg-primary/5 py-3 px-4 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to={`${getDashboardPath()}/profile`}
                    className="flex items-center gap-3 text-primary hover:bg-primary/5 py-3 px-4 rounded-lg"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 text-red-600 hover:bg-red-50 py-3 px-4 rounded-lg w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-3 px-4">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 text-primary font-medium border border-primary/20 rounded-full hover:bg-primary/5 transition-colors">
                      Sign In
                    </button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    <button className="w-full py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
