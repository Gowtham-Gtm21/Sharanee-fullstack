import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../api/endpoints";
import { Icon } from "../components/Icons";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderApi.get(id).then((r) => setOrder(r.data.order)).catch(() => {});
  }, [id]);

  return (
    <div className="page-wrap">
      <div className="container empty">
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--gold-pale)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Icon.Star fill width="40" height="40" style={{ color: "var(--gold)" }} />
        </div>
        <h3>Thank You for Your Order</h3>
        <p>Your order has been placed successfully. A confirmation has been sent to your email.</p>
        {order && (
          <div style={{ margin: "20px auto", maxWidth: 360, textAlign: "left" }} className="order-card">
            <div className="summary-row"><span>Order ID</span><span>#{order._id.slice(-8).toUpperCase()}</span></div>
            <div className="summary-row"><span>Amount</span><span className="price">Rs. {order.totalAmount?.toLocaleString("en-IN")}</span></div>
            <div className="summary-row"><span>Payment</span><span>{order.paymentMethod}</span></div>
            <div className="summary-row"><span>Status</span><span>{order.orderStatus}</span></div>
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
          <Link to="/orders" className="btn btn-gold">View My Orders</Link>
          <Link to="/shop" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}
