import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then((r) => setStats(r.data.dashboard)).catch(() => {});
    adminApi.analytics().then((r) => setAnalytics(r.data.analytics)).catch(() => {});
  }, []);

  return (
    <>
      <h1>Dashboard</h1>
      <div className="stat-grid">
        <div className="stat"><div className="l">Customers</div><div className="n">{stats?.totalUsers ?? "—"}</div></div>
        <div className="stat"><div className="l">Products</div><div className="n">{stats?.totalProducts ?? "—"}</div></div>
        <div className="stat"><div className="l">Categories</div><div className="n">{stats?.totalCategories ?? "—"}</div></div>
        <div className="stat"><div className="l">Orders</div><div className="n">{stats?.totalOrders ?? "—"}</div></div>
        <div className="stat"><div className="l">Revenue</div><div className="n">Rs. {(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}</div></div>
      </div>

      <div className="dash-2col">
        <div>
          <h2 style={{ fontSize: "1.4rem" }}>Recent Orders</h2>
          <table className="admin-table">
            <thead><tr><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {analytics?.recentOrders?.map((o) => (
                <tr key={o._id}>
                  <td>{o.user?.fullName || "—"}</td>
                  <td>Rs. {o.totalAmount?.toLocaleString("en-IN")}</td>
                  <td><span className="tag">{o.orderStatus}</span></td>
                </tr>
              ))}
              {!analytics?.recentOrders?.length && <tr><td colSpan="3" style={{ color: "var(--muted)" }}>No orders yet.</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <h2 style={{ fontSize: "1.4rem" }}>New Customers</h2>
          <table className="admin-table">
            <thead><tr><th>Name</th><th>Email</th></tr></thead>
            <tbody>
              {analytics?.recentUsers?.map((u) => (
                <tr key={u._id}><td>{u.fullName}</td><td>{u.email}</td></tr>
              ))}
              {!analytics?.recentUsers?.length && <tr><td colSpan="2" style={{ color: "var(--muted)" }}>No customers yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
