import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Basic styles
import './styles/index.css';

// Layout (To be fully implemented)
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

// Pages
import Login from './components/Login';
import Signup from './components/Signup';
import ForgotPassword from './components/ForgotPassword';
import Home from './pages/public/Home';
import ProductCatalog from './pages/public/ProductCatalog';
import ProductDetail from './pages/public/ProductDetail';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';

// User
import UserProfile from './pages/user/UserProfile';

// Vendor
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorProducts from './pages/vendor/VendorProducts';
import VendorOrders from './pages/vendor/VendorOrders';
import AddProduct from './pages/vendor/AddProduct';
import ProductComparison from './pages/public/ProductComparison';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOrders from './pages/admin/AdminOrders';
import { CartProvider } from './context/CartContext';
import PaymentSuccess from './pages/public/PaymentSuccess';
import SmartAssistant from './components/common/SmartAssistant';

const Layout = ({ children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Navbar />
    <main style={{ flexGrow: 1 }}>{children}</main>
    <Footer />
  </div>
);


function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Public Authentication */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Public Routes with Navbar/Footer */}
            <Route element={<Layout><Home /></Layout>} path="/" />
            <Route element={<Layout><ProductCatalog /></Layout>} path="/catalog" />
            <Route element={<Layout><ProductDetail /></Layout>} path="/product/:id" />
            <Route element={<Layout><ProductComparison /></Layout>} path="/compare" />

            {/* Protected Routes - Logged In Customers */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']} />}>
              <Route element={<Layout><Cart /></Layout>} path="/cart" />
              <Route element={<Layout><Checkout /></Layout>} path="/checkout" />
              <Route element={<Layout><PaymentSuccess /></Layout>} path="/payment-success" />
              <Route element={<Layout><UserProfile /></Layout>} path="/profile" />
            </Route>


            {/* Protected Routes - Vendors */}
            <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
              <Route element={<Layout><VendorDashboard /></Layout>} path="/vendor/dashboard" />
              <Route element={<Layout><VendorProducts /></Layout>} path="/vendor/products" />
              <Route element={<Layout><VendorOrders /></Layout>} path="/vendor/orders" />
              <Route element={<Layout><AddProduct /></Layout>} path="/vendor/add-product" />
            </Route>

            {/* Protected Routes - Admins */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'ASTADMIN']} />}>
              <Route element={<Layout><AdminDashboard /></Layout>} path="/admin/dashboard" />
              <Route element={<Layout><AdminOrders /></Layout>} path="/admin/orders" />
            </Route>

            {/* Unauthorized Page redirecting to home */}
            <Route path="/unauthorized" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <SmartAssistant />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}


export default App;
