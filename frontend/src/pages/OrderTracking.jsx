import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../api/endpoints";

const STEPS = ["Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

export default function OrderTracking() {
  const { id } = useParams();
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.tracking(id)
      .then((r) => setTracking(r.data.tracking))
      .catch(() => setTracking(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="spinner" />;
  if (!tracking) return <div className="empty"><h3>Tracking unavailable</h3><Link className="btn" to="/orders">Back to Orders</Link></div>;

  const currentIdx = STEPS.indexOf(tracking.currentStatus);
  const cancelled = tracking.currentStatus === "Cancelled";

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: "2.4rem" }}>Track Order</h1>
        <div className="order-card">
          <div className="order-head">
            <div>
              <b>Current Status</b>
              <br /><span className={`status-pill ${tracking.currentStatus}`}>{tracking.currentStatus}</span>
            </div>
            {tracking.trackingId && (
              <div style={{ textAlign: "right" }}>
                <small style={{ color: "var(--muted)" }}>Tracking ID</small>
                <div>{tracking.trackingId}</div>
                {tracking.courierName && <small style={{ color: "var(--muted)" }}>{tracking.courierName}</small>}
              </div>
            )}
          </div>

          {cancelled ? (
            <p style={{ color: "var(--danger)" }}>This order was cancelled.</p>
          ) : (
            <div className="track-timeline">
              {STEPS.map((s, i) => (
                <div className="track-step" key={s} style={{ opacity: i <= currentIdx ? 1 : 0.4 }}>
                  <div className="track-dot" style={{ background: i <= currentIdx ? "var(--gold)" : "var(--line)" }} />
                  <div>
                    <b style={{ color: "var(--cocoa)" }}>{s}</b>
                    {i === currentIdx && <div><small>Your order is currently here.</small></div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tracking.history?.length > 0 && (
            <>
              <h4 style={{ marginTop: 20, fontFamily: "var(--display)" }}>History</h4>
              {tracking.history.slice().reverse().map((h, i) => (
                <div key={i} style={{ borderTop: "1px solid var(--line)", padding: "10px 0" }}>
                  <b style={{ color: "var(--cocoa)" }}>{h.status}</b>
                  {h.message && <div style={{ color: "var(--cocoa-soft)", fontSize: "0.9rem" }}>{h.message}</div>}
                  <small style={{ color: "var(--muted)" }}>{new Date(h.date).toLocaleString("en-IN")}</small>
                </div>
              ))}
            </>
          )}
        </div>
        <Link to="/orders" className="btn btn-outline">Back to Orders</Link>
      </div>
    </div>
  );
}
