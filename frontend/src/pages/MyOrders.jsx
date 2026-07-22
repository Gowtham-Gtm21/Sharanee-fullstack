import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { orderApi, invoiceApi } from "../api/endpoints";
import { imageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MyOrders() {
  const { user } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    orderApi.myOrders(user.id)
      .then((r) => setOrders((r.data.orders || []).reverse()))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const cancel = async (id) => {
    try { await orderApi.cancel(id); toast.success("Order cancelled."); load(); }
    catch { toast.error("Could not cancel order."); }
  };

  const downloadInvoice = async (id) => {
    try { await invoiceApi.download(id); }
    catch { toast.error("Could not download invoice."); }
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty"><h3>No orders yet</h3><Link className="btn btn-gold" to="/shop">Start Shopping</Link></div>
        ) : orders.map((o) => (
          <div className="order-card" key={o._id}>
            <div className="order-head">
              <div>
                <b>Order #{o._id.slice(-8).toUpperCase()}</b>
                <br /><small>Placed on {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</small>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className={`status-pill ${o.orderStatus}`}>{o.orderStatus}</span>
                <div className="price" style={{ marginTop: 6 }}>Rs. {o.totalAmount?.toLocaleString("en-IN")}</div>
              </div>
            </div>
            {o.items?.map((it, idx) => it.product && (
              <div className="order-item" key={idx}>
                <img src={it.product.images?.[0] ? imageUrl(it.product.images[0]) : "https://placehold.co/56x70/efe6d5/3f2317?text=S"} alt="" />
                <div style={{ flex: 1 }}>
                  <div>{it.product.productName}</div>
                  <small style={{ color: "var(--muted)" }}>Qty: {it.quantity} · Rs. {it.price?.toLocaleString("en-IN")}</small>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
              <Link to={`/orders/${o._id}/track`} className="btn btn-outline">Track Order</Link>
              <button type="button" className="btn btn-outline" onClick={() => downloadInvoice(o._id)}>Download Invoice</button>
              {!["Delivered", "Cancelled", "Shipped", "Out for Delivery"].includes(o.orderStatus) && (
                <button className="btn btn-outline" style={{ color: "var(--danger)", borderColor: "var(--danger)" }} onClick={() => cancel(o._id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
