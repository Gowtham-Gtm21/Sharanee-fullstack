import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  orderApi,
  invoiceApi,
  returnApi,
} from "../api/endpoints";
import { imageUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function MyOrders() {
  const { user } = useAuth();
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningItem, setReturningItem] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [myReturns, setMyReturns] = useState([]);

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


  const loadReturns = async () => {
    if (!user?.id) {
      setMyReturns([]);
      return;
    }

    try {
      const response = await returnApi.myReturns();
      setMyReturns(response.data.returns || []);
    } catch (error) {
      console.error("Could not load returns:", error);
      setMyReturns([]);
    }
  };

  useEffect(() => {
    load();
    loadReturns();

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

  const submitReturn = async () => {
    if (!returningItem) return;

    if (!returnReason.trim()) {
      toast.error("Please enter a reason for return.");
      return;
    }

    try {
      setSubmittingReturn(true);

      await returnApi.create({
        order: returningItem.orderId,
        product: returningItem.productId,
        reason: returnReason.trim(),
      });


      toast.success("Return request submitted successfully.");

      setReturningItem(null);
      setReturnReason("");

      await loadReturns();

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Could not submit return request."
      );
    } finally {
      setSubmittingReturn(false);
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

                    <div className="price" style={{ marginTop: 6 }}>
                      Total: ₹{order.finalAmount?.toLocaleString("en-IN")}
                    </div>

                    {order.couponCode && (
                      <>
                        <div style={{ fontSize: "0.85rem", color: "green", marginTop: 4 }}>
                          Coupon: {order.couponCode}
                        </div>

                        <div style={{ fontSize: "0.85rem", color: "green" }}>
                          Discount: -₹{order.discount?.toLocaleString("en-IN")}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {order.items?.map((item, index) => {
                  if (!item.product) return null;

                  const returnRequest = myReturns.find((r) => {
                    const returnOrderId =
                      typeof r.order === "object" ? r.order?._id : r.order;

                    const returnProductId =
                      typeof r.product === "object" ? r.product?._id : r.product;

                    return (
                      String(returnOrderId) === String(order._id) &&
                      String(returnProductId) === String(item.product._id)
                    );
                  });

                  return (
                    <div
                      className="order-item"
                      key={item._id || index}
                    >
                      <img
                        src={
                          item.product.colorVariants?.find(
                            (variant) =>
                              variant.colorName?.toLowerCase() ===
                              item.selectedColor?.toLowerCase()
                          )?.images?.[0]
                            ? imageUrl(
                              item.product.colorVariants.find(
                                (variant) =>
                                  variant.colorName?.toLowerCase() ===
                                  item.selectedColor?.toLowerCase()
                              ).images[0]
                            )
                            : item.product.colorVariants?.[0]?.images?.[0]
                              ? imageUrl(item.product.colorVariants[0].images[0])
                              : "https://placehold.co/56x70/efe6d5/3f2317?text=S"
                        }
                        alt={item.product.productName || "Product"}
                      />
                      <div style={{ flex: 1 }}>
                        <div>{item.product.productName}</div>

                        <div
                          style={{
                            color: "var(--muted)",
                            marginTop: 4,
                          }}
                        >
                          <small>
                            Qty: {item.quantity} · Rs.{" "}
                            {item.price?.toLocaleString("en-IN")}
                          </small>

                          {item.selectedColor && (
                            <div
                              style={{
                                marginTop: 6,
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                              }}
                            >
                              <span>Color:</span>

                              <span
                                style={{
                                  width: 14,
                                  height: 14,
                                  borderRadius: "50%",
                                  background:
                                    item.product.colorVariants?.find(
                                      (variant) =>
                                        variant.colorName?.toLowerCase() ===
                                        item.selectedColor?.toLowerCase()
                                    )?.colorCode || "#ddd",
                                  border: "1px solid #ccc",
                                  display: "inline-block",
                                }}
                              />

                              <span>{item.selectedColor}</span>
                            </div>
                          )}

                          {item.selectedSize && (
                            <div
                              style={{
                                marginTop: 6,
                              }}
                            >
                              <span>Size: </span>
                              <strong>{item.selectedSize}</strong>
                            </div>
                          )}
                        </div>

                        {isDelivered && (
                          <div style={{ marginTop: 10 }}>

                            {!returnRequest ? (
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => {
                                  setReturningItem({
                                    orderId: order._id,
                                    productId: item.product._id,
                                    productName: item.product.productName,
                                  });

                                  setReturnReason("");
                                }}
                              >
                                Return Product
                              </button>
                            ) : (
                              <div className="customer-return-status">
                                <span>
                                  Return: <strong>{returnRequest.status}</strong>
                                </span>

                                {returnRequest.refundStatus &&
                                  returnRequest.refundStatus !== "Not Started" && (
                                    <span>
                                      Refund: <strong>{returnRequest.refundStatus}</strong>
                                    </span>
                                  )}

                                {returnRequest.refundAmount > 0 && (
                                  <span>
                                    Refund Amount:{" "}
                                    <strong>
                                      ₹{returnRequest.refundAmount.toLocaleString("en-IN")}
                                    </strong>
                                  </span>
                                )}
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

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

      {/* RETURN PRODUCT MODAL */}
      {returningItem && (
        <div className="return-modal-overlay">
          <div className="return-modal">

            <div className="return-modal-header">
              <div>
                <h2>Return Product</h2>
                <p>{returningItem.productName}</p>
              </div>

              <button
                type="button"
                className="return-modal-close"
                onClick={() => {
                  setReturningItem(null);
                  setReturnReason("");
                }}
              >
                ×
              </button>
            </div>

            <div className="return-form-group">
              <label>Reason for Return</label>

              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                <option value="Product damaged">
                  Product damaged
                </option>
                <option value="Wrong product received">
                  Wrong product received
                </option>
                <option value="Quality issue">
                  Quality issue
                </option>
                <option value="Colour different from expected">
                  Colour different from expected
                </option>
                <option value="Product not as expected">
                  Product not as expected
                </option>
                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div className="return-modal-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={submittingReturn}
                onClick={() => {
                  setReturningItem(null);
                  setReturnReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-gold"
                disabled={submittingReturn}
                onClick={submitReturn}
              >
                {submittingReturn
                  ? "Submitting..."
                  : "Submit Return"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}