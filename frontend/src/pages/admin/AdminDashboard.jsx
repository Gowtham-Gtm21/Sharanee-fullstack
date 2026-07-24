import { useEffect, useState, useRef } from "react";
import { adminApi } from "../../api/endpoints";

import {
  FaUsers,
  FaBoxOpen,
  FaTags,
  FaShoppingCart,
  FaRupeeSign
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotificationPopup from "../../components/NotificationPopup";


export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    products: [],
    categories: [],
    users: [],
    orders: [],
    coupons: [],
  });

  useEffect(() => {
    adminApi.dashboard().then((r) => setStats(r.data.dashboard)).catch(() => { });
    adminApi.analytics().then((r) => setAnalytics(r.data.analytics)).catch(() => { });
  }, []);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setSearchResults({
        products: [],
        categories: [],
        users: [],
        orders: [],
        coupons: [],
      });
      return;
    }

    try {
      const res = await adminApi.search(value);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };
  const popupRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <>
      <div className="dashboard-header">
        <div>
          <h1>Welcome Back, Admin 👋</h1>
          <p>Manage your Sharanee Saree Store from one place.</p>
        </div>
        <div className="dashboard-header-right">

          <div className="search-container">

            <input
              type="text"
              className="dashboard-search"
              placeholder="Search..."
              value={query}
              onChange={handleSearch}
            />


            {query && (
              <div className="search-dropdown">

                {searchResults.products.map((p) => (
                  <div
                    key={p._id}
                    className="search-item"
                    onClick={() => navigate("/admin/products")}
                  >
                    🛍️ {p.productName}
                  </div>
                ))}

                {searchResults.categories.map((c) => (
                  <div
                    key={c._id}
                    className="search-item"
                    onClick={() => navigate("/admin/categories")}
                  >
                    📂 {c.categoryName}
                  </div>
                ))}

                {searchResults.users.map((u) => (
                  <div
                    key={u._id}
                    className="search-item"
                    onClick={() => navigate("/admin/users")}
                  >
                    👤 {u.fullName}
                  </div>
                ))}

                {searchResults.orders.map((o) => (
                  <div
                    key={o._id}
                    className="search-item"
                    onClick={() => navigate("/admin/orders")}
                  >
                    📦 {o.trackingId || o._id}
                  </div>
                ))}

                {searchResults.coupons.map((c) => (
                  <div
                    key={c._id}
                    className="search-item"
                    onClick={() => navigate("/admin/coupons")}
                  >
                    🏷️ {c.code}
                  </div>
                ))}

              </div>
            )}
          </div>
          <div className="notification-wrapper" ref={popupRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              🔔
            </button>

            {showNotifications && (
              <NotificationPopup
                onClose={() => setShowNotifications(false)}
              />
            )}
          </div>
          <div className="admin-profile">
            <img src="/logo.png" alt="Admin" />
            <div>
              <strong>Admin</strong>
              <small>Administrator</small>
            </div>
          </div>
        </div>
      </div>

      <div className="stat-grid">

        <div className="stat">
          <FaUsers className="stat-icon" />
          <div className="l">Customers</div>
          <div className="n">{stats?.totalUsers ?? "—"}</div>
          <div className="d">
            {(stats?.customerGrowth ?? 0) >= 0
              ? `↑ ${stats?.customerGrowth ?? 0}% compared to last week`
              : `↓ ${Math.abs(stats?.customerGrowth ?? 0)}% compared to last week`}
          </div>
        </div>

        <div className="stat">
          <FaBoxOpen className="stat-icon" />
          <div className="l">Products</div>
          <div className="n">{stats?.totalProducts ?? "—"}</div>
          <div className="d">Active Products</div>
        </div>

        <div className="stat">
          <FaTags className="stat-icon" />
          <div className="l">Categories</div>
          <div className="n">{stats?.totalCategories ?? "—"}</div>
          <div className="d">Available Categories</div>
        </div>

        <div className="stat">
          <FaShoppingCart className="stat-icon" />
          <div className="l">Orders</div>
          <div className="n">{stats?.totalOrders ?? "—"}</div>
          <div className="d">Total Orders</div>
        </div>

        <div className="stat">
          <FaRupeeSign className="stat-icon" />
          <div className="l">Revenue</div>
          <div className="n">
            ₹ {(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}
          </div>
          <div className="d">
            {(stats?.revenueGrowth ?? 0) >= 0
              ? `↑ ${stats?.revenueGrowth ?? 0}% compared to last month`
              : `↓ ${Math.abs(stats?.revenueGrowth ?? 0)}% compared to last month`}
          </div>
        </div>

      </div>

      <div className="dash-2col">
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Recent Orders</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recentOrders?.map((o) => (
                <tr key={o._id}>
                  <td>{o.user?.fullName || "—"}</td>
                  <td>₹ {o.totalAmount?.toLocaleString("en-IN")}</td>
                  <td><span className="tag">{o.orderStatus}</span></td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!analytics?.recentOrders?.length && <tr><td colSpan="4" style={{ color: "var(--muted)" }}>No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={{ fontSize: "1.4rem" }}>New Customers</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.recentUsers?.map((u) => (
                <tr key={u._id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!analytics?.recentUsers?.length && <tr><td colSpan="3" style={{ color: "var(--muted)" }}>No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
