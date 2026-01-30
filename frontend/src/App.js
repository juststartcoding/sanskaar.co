import React, { Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import "./i18n/config";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminLayout from "./components/AdminLayout";

// Public Pages
import Home from "./pages/Home";
import Poojas from "./pages/Poojas";
import PoojaDetail from "./pages/PoojaDetail";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Pandits from "./pages/Pandits";
import PanditDetail from "./pages/PanditDetail";
import Temples from "./pages/Temples";
import TempleDetail from "./pages/TempleDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import WasteCollection from "./pages/WasteCollection";
import PanditSignup from "./pages/PanditSignup";
import SanskritLearning from "./pages/SanskritLearning";
import FamilyTree from "./pages/FamilyTree";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import MuhuratCalendarMaster from "./pages/admin/MuhuratCalendarMaster";
// User Dashboard
import UserDashboard from "./pages/UserDashboard";

// Pandit Dashboard
import PanditDashboard from "./pages/PanditDashboard";

// Seller Dashboard
import SellerDashboard from "./pages/SellerDashboard";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import PoojaManagement from "./pages/admin/PoojaManagement";
import AddPooja from "./pages/admin/AddPooja";
import ProductManagement from "./pages/admin/ProductManagement";
import AddProduct from "./pages/admin/AddProduct";
import TempleManagement from "./pages/admin/TempleManagement";
import AddTemple from "./pages/admin/AddTemple";
import PanditManagement from "./pages/admin/PanditManagement";
import WasteManagement from "./pages/admin/WasteManagement";
import PoojaStepsMaster from "./pages/admin/PoojaStepsMaster";
import MantrasMaster from "./pages/admin/MantrasMaster";
import DeitiesMaster from "./pages/admin/DeitiesMaster";
import AartisMaster from "./pages/admin/AartisMaster";
import PoojaTemplates from "./pages/admin/PoojaTemplates";

// Pooja Engine
import PoojaPlayer from "./pages/PoojaPlayer";

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-orange-600 rounded-full border-t-transparent animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🕉️</span>
        </div>
      </div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Protected Route Component - Checks if user is authenticated
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useApp();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if allowedRoles are specified
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect based on user role
    if (user?.role === "admin" || user?.role === "superadmin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user?.role === "pandit") {
      return <Navigate to="/pandit/dashboard" replace />;
    } else if (user?.role === "seller") {
      return <Navigate to="/seller/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
      {children}
    </ProtectedRoute>
  );
};

// Pandit Route Component
const PanditRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["pandit", "admin", "superadmin"]}>
      {children}
    </ProtectedRoute>
  );
};

// Seller Route Component
const SellerRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={["seller", "admin", "superadmin"]}>
      {children}
    </ProtectedRoute>
  );
};

// Public Layout with Navbar and Footer
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
  </>
);

// Coming Soon Page
const ComingSoon = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
    <div className="text-center">
      <span className="text-6xl mb-4 block">🚧</span>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600">This feature is coming soon!</p>
    </div>
  </div>
);

// Main App Component
function AppContent() {
  const { loading } = useApp();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* ============================================ */}
      {/* PUBLIC ROUTES - No Authentication Required */}
      {/* ============================================ */}
      <Route
        path="/"
        element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        }
      />
      <Route
        path="/poojas"
        element={
          <PublicLayout>
            <Poojas />
          </PublicLayout>
        }
      />
      <Route
        path="/poojas/:id"
        element={
          <PublicLayout>
            <PoojaDetail />
          </PublicLayout>
        }
      />
      {/* Alias for /pooja/:id */}
      <Route
        path="/pooja/:id"
        element={
          <PublicLayout>
            <PoojaDetail />
          </PublicLayout>
        }
      />
      {/* Pooja Step-by-Step Player */}
      <Route path="/pooja-player/:id" element={<PoojaPlayer />} />
      <Route
        path="/shop"
        element={
          <PublicLayout>
            <Shop />
          </PublicLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <PublicLayout>
            <ProductDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/pandits"
        element={
          <PublicLayout>
            <Pandits />
          </PublicLayout>
        }
      />
      <Route
        path="/pandits/:id"
        element={
          <PublicLayout>
            <PanditDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/temples"
        element={
          <PublicLayout>
            <Temples />
          </PublicLayout>
        }
      />
      <Route
        path="/temples/:id"
        element={
          <PublicLayout>
            <TempleDetail />
          </PublicLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <PublicLayout>
            <Cart />
          </PublicLayout>
        }
      />
      <Route
        path="/search"
        element={
          <PublicLayout>
            <Search />
          </PublicLayout>
        }
      />
      <Route
        path="/waste-collection"
        element={
          <PublicLayout>
            <WasteCollection />
          </PublicLayout>
        }
      />
      <Route
        path="/pandit-signup"
        element={
          <PublicLayout>
            <PanditSignup />
          </PublicLayout>
        }
      />
      <Route
        path="/sanskrit-learning"
        element={
          <PublicLayout>
            <SanskritLearning />
          </PublicLayout>
        }
      />
      <Route
        path="/family-tree"
        element={
          <PublicLayout>
            <FamilyTree />
          </PublicLayout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ============================================ */}
      {/* PROTECTED ROUTES - User Authentication Required */}
      {/* ============================================ */}
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <Checkout />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <UserDashboard />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <MyOrders />
            </PublicLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success/:orderId"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order-success"
        element={
          <ProtectedRoute>
            <OrderSuccess />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/wishlist"
        element={
          <ProtectedRoute>
            <PublicLayout>
              <ComingSoon title="My Wishlist" />
            </PublicLayout>
          </ProtectedRoute>
        }
      />

      {/* ============================================ */}
      {/* PANDIT DASHBOARD ROUTES */}
      {/* ============================================ */}
      <Route
        path="/pandit/dashboard"
        element={
          <PanditRoute>
            <PublicLayout>
              <PanditDashboard />
            </PublicLayout>
          </PanditRoute>
        }
      />

      {/* ============================================ */}
      {/* SELLER DASHBOARD ROUTES */}
      {/* ============================================ */}
      <Route
        path="/seller/dashboard"
        element={
          <SellerRoute>
            <PublicLayout>
              <SellerDashboard />
            </PublicLayout>
          </SellerRoute>
        }
      />

      {/* ============================================ */}
      {/* ADMIN ROUTES - Admin Authentication Required */}
      {/* ============================================ */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Navigate to="/admin/dashboard" replace />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/poojas"
        element={
          <AdminRoute>
            <AdminLayout>
              <PoojaManagement isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/poojas/add"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddPooja isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/poojas/edit/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddPooja isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminLayout>
              <ProductManagement isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddProduct isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddProduct isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/temples"
        element={
          <AdminRoute>
            <AdminLayout>
              <TempleManagement isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/temples/add"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddTemple isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/temples/edit/:id"
        element={
          <AdminRoute>
            <AdminLayout>
              <AddTemple isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/pandits"
        element={
          <AdminRoute>
            <AdminLayout>
              <PanditManagement isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/waste-requests"
        element={
          <AdminRoute>
            <AdminLayout>
              <WasteManagement isEmbedded={true} />
            </AdminLayout>
          </AdminRoute>
        }
      />
      {/* Master Data Routes */}
      <Route
        path="/admin/master/steps"
        element={
          <AdminRoute>
            <AdminLayout>
              <PoojaStepsMaster />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/master/mantras"
        element={
          <AdminRoute>
            <AdminLayout>
              <MantrasMaster />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/master/deities"
        element={
          <AdminRoute>
            <AdminLayout>
              <DeitiesMaster />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/master/aartis"
        element={
          <AdminRoute>
            <AdminLayout>
              <AartisMaster />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/master/templates"
        element={
          <AdminRoute>
            <AdminLayout>
              <PoojaTemplates />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout>
              <ComingSoon title="Order Management" />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <AdminLayout>
              <ComingSoon title="User Management" />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <AdminRoute>
            <AdminLayout>
              <ComingSoon title="Seller Management" />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminLayout>
              <ComingSoon title="Settings" />
            </AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/master/muhurat-calendar"
        element={<MuhuratCalendarMaster />}
      />

      {/* ============================================ */}
      {/* 404 NOT FOUND */}
      {/* ============================================ */}
      <Route
        path="*"
        element={
          <PublicLayout>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
              <div className="text-center">
                <span className="text-8xl mb-4 block">🕉️</span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                <p className="text-gray-600 mb-4">Page not found</p>
                <a
                  href="/"
                  className="inline-block px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Go Home
                </a>
              </div>
            </div>
          </PublicLayout>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <Suspense fallback={<LoadingSpinner />}>
          <AppContent />
        </Suspense>
      </Router>
    </AppProvider>
  );
}

export default App;
