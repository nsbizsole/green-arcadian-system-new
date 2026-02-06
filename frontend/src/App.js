import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

// Public Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import About from "./pages/About";
import ExportServices from "./pages/ExportServices";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PendingApproval from "./pages/auth/PendingApproval";

// Admin Portal
import AdminLayout from "./components/portals/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminInventory from "./pages/admin/Inventory";
import AdminProjects from "./pages/admin/Projects";
import AdminAMC from "./pages/admin/AMC";
import AdminPartners from "./pages/admin/Partners";
import AdminOrders from "./pages/admin/Orders";
import AdminRFQ from "./pages/admin/RFQ";
import AdminExports from "./pages/admin/Exports";
import AdminProduction from "./pages/admin/Production";
import AdminInquiries from "./pages/admin/Inquiries";
import AdminSettings from "./pages/admin/Settings";

// Partner Portal
import PartnerLayout from "./components/portals/PartnerLayout";
import PartnerDashboard from "./pages/partner/Dashboard";
import PartnerDeals from "./pages/partner/Deals";
import PartnerProfile from "./pages/partner/Profile";

// Crew Portal
import CrewLayout from "./components/portals/CrewLayout";
import CrewDashboard from "./pages/crew/Dashboard";
import CrewTasks from "./pages/crew/Tasks";
import CrewLogs from "./pages/crew/Logs";
import CrewProfile from "./pages/crew/Profile";

// Customer Portal
import CustomerLayout from "./components/portals/CustomerLayout";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerOrders from "./pages/customer/Orders";
import CustomerProfile from "./pages/customer/Profile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.status === "pending") {
    return <Navigate to="/pending" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate portal based on role
    const portalRoutes = {
      admin: "/admin",
      manager: "/admin",
      partner: "/partner",
      crew: "/crew",
      customer: "/customer",
      vendor: "/vendor"
    };
    return <Navigate to={portalRoutes[user.role] || "/"} replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:productId" element={<ProductDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/export" element={<ExportServices />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      
      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending" element={<PendingApproval />} />
      
      {/* Admin Portal */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin", "manager"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="amc" element={<AdminAMC />} />
        <Route path="partners" element={<AdminPartners />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="rfq" element={<AdminRFQ />} />
        <Route path="exports" element={<AdminExports />} />
        <Route path="production" element={<AdminProduction />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>
      
      {/* Partner Portal */}
      <Route path="/partner" element={<ProtectedRoute allowedRoles={["partner"]}><PartnerLayout /></ProtectedRoute>}>
        <Route index element={<PartnerDashboard />} />
        <Route path="deals" element={<PartnerDeals />} />
        <Route path="profile" element={<PartnerProfile />} />
      </Route>
      
      {/* Crew Portal */}
      <Route path="/crew" element={<ProtectedRoute allowedRoles={["crew"]}><CrewLayout /></ProtectedRoute>}>
        <Route index element={<CrewDashboard />} />
        <Route path="tasks" element={<CrewTasks />} />
        <Route path="logs" element={<CrewLogs />} />
        <Route path="profile" element={<CrewProfile />} />
      </Route>
      
      {/* Customer Portal */}
      <Route path="/customer" element={<ProtectedRoute allowedRoles={["customer"]}><CustomerLayout /></ProtectedRoute>}>
        <Route index element={<CustomerDashboard />} />
        <Route path="orders" element={<CustomerOrders />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
