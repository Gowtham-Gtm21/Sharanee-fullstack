import { Routes, Route } from "react-router-dom";
import Layout, { RequireAuth, RequireAdmin } from "./components/Layout";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MyOrders from "./pages/MyOrders";
import OrderTracking from "./pages/OrderTracking";
import Wishlist from "./pages/Wishlist";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";

// Wrap a public page in the storefront layout (header + footer).
const P = (el) => <Layout>{el}</Layout>;
// Wrap an admin page in the admin layout, guarded by admin role.
const A = (el) => <RequireAdmin><AdminLayout>{el}</AdminLayout></RequireAdmin>;

export default function App() {
  return (
    <Routes>
      {/* Public storefront */}
      <Route path="/" element={P(<Home />)} />
      <Route path="/shop" element={P(<Shop />)} />
      <Route path="/product/:id" element={P(<ProductDetail />)} />
      <Route path="/about" element={P(<About />)} />
      <Route path="/contact" element={P(<Contact />)} />
      <Route path="/blog" element={P(<Blog />)} />
      <Route path="/blog/:slug" element={P(<BlogDetail />)} />
      <Route path="/wishlist" element={P(<Wishlist />)} />

      {/* Auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Requires sign-in */}
      <Route path="/cart" element={P(<RequireAuth><Cart /></RequireAuth>)} />
      <Route path="/checkout" element={P(<RequireAuth><Checkout /></RequireAuth>)} />
      <Route path="/order-success/:id" element={P(<RequireAuth><OrderSuccess /></RequireAuth>)} />
      <Route path="/orders" element={P(<RequireAuth><MyOrders /></RequireAuth>)} />
      <Route path="/orders/:id/track" element={P(<RequireAuth><OrderTracking /></RequireAuth>)} />
      <Route path="/account" element={P(<RequireAuth><Account /></RequireAuth>)} />

      {/* Admin */}
      <Route path="/admin" element={A(<AdminDashboard />)} />
      <Route path="/admin/products" element={A(<AdminProducts />)} />
      <Route path="/admin/orders" element={A(<AdminOrders />)} />
      <Route path="/admin/users" element={A(<AdminUsers />)} />
      <Route path="/admin/categories" element={A(<AdminCategories />)} />
      <Route path="/admin/coupons" element={A(<AdminCoupons />)} />

      <Route path="*" element={P(<NotFound />)} />
    </Routes>
  );
}
