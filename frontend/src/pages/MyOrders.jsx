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
    if (!user?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    orderApi
      .myOrders(user.id)
      .then((response) => {
        const orderList = response.data.orders || [];
        setOrders([...orderList].reverse());
      })
      .catch(() => {
        setOrders([]);
        toast.error("Could not load your orders.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const cancel = async (id) => {
    try {
      await orderApi.cancel(id);
      toast.success("Order cancelled.");
      load();
    } catch {
      toast.error("Could not cancel order.");
    }
  };

  const downloadInvoice = async (id) => {
    try {
      await invoiceApi.download(id);
    } catch {
      toast.error("Could not download invoice.");
    }
  };

  if (loading) {
    return <div className="spinner" />;
  }

  return (
    <div className="page-wrap">
      <div className="container">
        <h1 style={{ fontSize: "2.4rem" }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty">
            <h3>No orders yet</h3>

            <Link className="btn btn-gold" to="/shop">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((order) => {
            const isDelivered = order.orderStatus === "Delivered";

            const canCancel = ![
              "Delivered",
              "Cancelled",
              "Shipped",
              "Out for Delivery",
            ].includes(order.orderStatus);

            return (
              <div className="order-card" key={order._id}>
                <div className="order-head">
                  <div>
                    <b>
                      Order #{order._id.slice(-8).toUpperCase()}
                    </b>

                    <br />

                    <small>
                      Placed on{" "}
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </small>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      className={`status-pill ${order.orderStatus}`}
                    >
                      {order.orderStatus}
                    </span>

                    <div
                      className="price"
                      style={{ marginTop: 6 }}
                    >
                      Rs.{" "}
                      {order.totalAmount?.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                {order.items?.map(
                  (item, index) =>
                    item.product && (
                      <div
                        className="order-item"
                        key={item._id || index}
                      >
                        <img
                          src={
                            item.product.images?.[0]
                              ? imageUrl(item.product.images[0])
                              : "https://placehold.co/56x70/efe6d5/3f2317?text=S"
                          }
                          alt={item.product.productName || "Product"}
                        />

                        <div style={{ flex: 1 }}>
                          <div>{item.product.productName}</div>

                          <small
                            style={{ color: "var(--muted)" }}
                          >
                            Qty: {item.quantity} · Rs.{" "}
                            {item.price?.toLocaleString("en-IN")}
                          </small>
                        </div>
                      </div>
                    )
                )}

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginTop: 12,
                  }}
                >
                  <Link
                    to={`/orders/${order._id}/track`}
                    className="btn btn-outline"
                  >
                    Track Order
                  </Link>

                  {isDelivered && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        downloadInvoice(order._id)
                      }
                    >
                      Download Invoice
                    </button>
                  )}

                  {canCancel && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{
                        color: "var(--danger)",
                        borderColor: "var(--danger)",
                      }}
                      onClick={() => cancel(order._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}