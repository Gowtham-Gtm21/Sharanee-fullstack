import { Navigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}

// Requires any signed-in user
export function RequireAuth({ children }) {
  const { user, ready } = useAuth();
  const loc = useLocation();
  if (!ready) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}

// Requires admin role
export function RequireAdmin({ children }) {
  const { user, ready } = useAuth();
  if (!ready) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}
