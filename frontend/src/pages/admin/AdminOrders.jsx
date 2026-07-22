import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";

const STATUSES = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);

  const load = () => adminApi.orders().then((r) => setOrders((r.data.orders || []).reverse())).catch(() => {});
  useEffect(() => { load(); }, []);

  const changeStatus = async (id, status) => {
    try { await adminApi.updateOrderStatus(id, status); toast.success("Status updated."); load(); }
    catch { toast.error("Could not update status."); }
  };

  return (
    <>
      <h1>Orders</h1>
      <table className="admin-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-8).toUpperCase()}<br /><small style={{ color: "var(--muted)" }}>{new Date(o.createdAt).toLocaleDateString("en-IN")}</small></td>
              <td>{o.user?.fullName || "—"}<br /><small style={{ color: "var(--muted)" }}>{o.user?.email}</small></td>
              <td>{o.items?.length}</td>
              <td>Rs. {o.totalAmount?.toLocaleString("en-IN")}</td>
              <td>{o.paymentMethod}</td>
              <td>
                <select value={o.orderStatus} onChange={(e) => changeStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="6" style={{ color: "var(--muted)" }}>No orders yet.</td></tr>}
        </tbody>
      </table>
    </>
  );
}
