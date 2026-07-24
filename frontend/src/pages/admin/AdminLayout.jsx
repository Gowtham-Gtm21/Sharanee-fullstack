import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Icon } from "../../components/Icons";

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const nav = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/coupons", label: "Coupons" },
    { to: "/admin/reports", label: "Reports" },
    { to: "/admin/settings", label: "Settings" },
  ];
  // Close the drawer whenever the route changes (mobile).
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="admin">
      {/* Mobile top bar with hamburger (hidden on desktop) */}
      <div className="admin-mobilebar">
        <button className="admin-burger" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon.Menu />
        </button>
        <span className="admin-mobilebar-title">ADMIN</span>
      </div>

      {/* Backdrop for the off-canvas drawer */}
      {open && <div className="admin-backdrop" onClick={() => setOpen(false)} />}

      <aside className={`admin-side ${open ? "open" : ""}`}>
        <button className="admin-side-close" onClick={() => setOpen(false)} aria-label="Close menu">
          <Icon.Close />
        </button>

        <div className="logo">
          <img src="/logo.png" alt="Sharanee" className="admin-logo" />
        </div>

        <nav className="admin-nav">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}>{n.label}</NavLink>
          ))}
          <NavLink to="/">← View Store</NavLink>
        </nav>

        <button className="out" onClick={() => { logout(); navigate("/login"); }}>Logout</button>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  );
}
