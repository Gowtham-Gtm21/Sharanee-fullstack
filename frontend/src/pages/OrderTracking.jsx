import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { orderApi } from "../api/endpoints";

const STEPS = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
];

const COMPLETED_COLOR = "#16a34a";

export default function OrderTracking() {
  const { id } = useParams();

  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTracking = useCallback(
    async (showLoader = false) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        const response = await orderApi.tracking(id);

        const trackingData =
          response?.data?.tracking ||
          response?.data?.order ||
          null;

        setTracking(trackingData);
      } catch (err) {
        console.error(
          "Unable to load order tracking:",
          err?.response?.data || err
        );

        setTracking(null);

        setError(
          err?.response?.data?.message ||
            "Unable to load order tracking details"
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    if (!id) {
      setError("Order ID is missing");
      setLoading(false);
      return;
    }

    fetchTracking(true);

    const intervalId = window.setInterval(() => {
      fetchTracking(false);
    }, 10000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [id, fetchTracking]);

  if (loading) {
    return <div className="spinner" />;
  }

  if (!tracking) {
    return (
      <div className="empty">
        <h3>{error || "Tracking unavailable"}</h3>

        <Link className="btn" to="/orders">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStatus =
    tracking.orderStatus ||
    tracking.currentStatus ||
    "Placed";

  const currentIdx = STEPS.indexOf(currentStatus);
  const cancelled = currentStatus === "Cancelled";

  const trackingHistory = Array.isArray(tracking.trackingHistory)
    ? tracking.trackingHistory
    : Array.isArray(tracking.history)
      ? tracking.history
      : [];

  const formatHistoryDate = (date) => {
    if (!date) {
      return "";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleString("en-IN");
  };

  return (
    <div className="page-wrap">
      <div className="container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: "2.4rem" }}>
          Track Order
        </h1>

        <div className="order-card">
          <div className="order-head">
            <div>
              <b>Current Status</b>

              <br />

              <span
                className={`status-pill ${currentStatus
                  .toLowerCase()
                  .replaceAll(" ", "-")}`}
              >
                {currentStatus}
              </span>
            </div>

            {tracking.trackingId && (
              <div style={{ textAlign: "right" }}>
                <small style={{ color: "var(--muted)" }}>
                  Tracking ID
                </small>

                <div>{tracking.trackingId}</div>

                {tracking.courierName && (
                  <small style={{ color: "var(--muted)" }}>
                    {tracking.courierName}
                  </small>
                )}
              </div>
            )}
          </div>

          {cancelled ? (
            <p style={{ color: "var(--danger)" }}>
              This order was cancelled.
            </p>
          ) : (
            <div className="track-timeline">
              {STEPS.map((step, index) => {
                const completed =
                  currentIdx >= 0 && index <= currentIdx;

                const isCurrent = index === currentIdx;

                const connectorCompleted =
                  currentIdx >= 0 &&
                  index < currentIdx;

                return (
                  <div
                    className="track-step"
                    key={step}
                    style={{
                      opacity: completed ? 1 : 0.4,
                      position: "relative",
                    }}
                  >
                    {index < STEPS.length - 1 && (
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          left: "9px",
                          top: "20px",
                          width: "2px",
                          height: "calc(100% - 2px)",
                          background: connectorCompleted
                            ? COMPLETED_COLOR
                            : "var(--line)",
                          zIndex: 0,
                        }}
                      />
                    )}

                    <div
                      className="track-dot"
                      style={{
                        background: completed
                          ? COMPLETED_COLOR
                          : "var(--line)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    />

                    <div>
                      <b style={{ color: "var(--cocoa)" }}>
                        {step}
                      </b>

                      {isCurrent && (
                        <div>
                          <small>
                            Your order is currently here.
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {trackingHistory.length > 0 && (
            <>
              <h4
                style={{
                  marginTop: 20,
                  fontFamily: "var(--display)",
                }}
              >
                History
              </h4>

              {[...trackingHistory]
                .sort(
                  (firstEntry, secondEntry) =>
                    new Date(secondEntry.date).getTime() -
                    new Date(firstEntry.date).getTime()
                )
                .map((historyItem, index) => {
                  const historyMessage =
                    historyItem.note ||
                    historyItem.message ||
                    "";

                  return (
                    <div
                      key={
                        historyItem._id ||
                        `${historyItem.status}-${index}`
                      }
                      style={{
                        borderTop: "1px solid var(--line)",
                        padding: "10px 0",
                      }}
                    >
                      <b style={{ color: "var(--cocoa)" }}>
                        {historyItem.status}
                      </b>

                      {historyMessage && (
                        <div
                          style={{
                            color: "var(--cocoa-soft)",
                            fontSize: "0.9rem",
                          }}
                        >
                          {historyMessage}
                        </div>
                      )}

                      {historyItem.date && (
                        <small style={{ color: "var(--muted)" }}>
                          {formatHistoryDate(historyItem.date)}
                        </small>
                      )}
                    </div>
                  );
                })}
            </>
          )}
        </div>

        <Link to="/orders" className="btn btn-outline">
          Back to Orders
        </Link>
      </div>
    </div>
  );
}