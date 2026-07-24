import { useEffect, useState } from "react";
import { adminApi } from "../../api/endpoints";
import { useToast } from "../../context/ToastContext";
import { FaEye } from "react-icons/fa";

const STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const PAYMENT_STATUSES = [
  "Pending",
  "Paid",
  "Failed",
];

const ONLINE_PAYMENT_METHODS = [
  "Card",
  "UPI",
  "NetBanking",
];

const ORDERS_PER_PAGE = 5;

export default function AdminOrders() {
  const toast = useToast();

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /**
   * Load all orders from backend.
   */
  const loadOrders = async () => {
    try {
      setLoading(true);

      const response = await adminApi.orders();

      const receivedOrders = Array.isArray(response?.data?.orders)
        ? response.data.orders
        : [];

      /*
       * Avoid reverse() directly because it mutates the original array.
       */
      const sortedOrders = [...receivedOrders].sort(
        (firstOrder, secondOrder) =>
          new Date(secondOrder.createdAt).getTime() -
          new Date(firstOrder.createdAt).getTime()
      );

      setOrders(sortedOrders);
    } catch (error) {
      console.error(
        "Unable to load orders:",
        error?.response?.data || error
      );

      setOrders([]);

      toast.error(
        error?.response?.data?.message ||
          "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  /**
   * Open selected order modal using a copy,
   * so table data is not directly mutated.
   */
  const openOrder = (order) => {
    setSelectedOrder({
      ...order,
      paymentStatus: order.paymentStatus || "Pending",
      deliveryDate: order.deliveryDate || "",
      orderStatus: order.orderStatus || "Placed",
    });

    setShowModal(true);
  };

  const closeOrder = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setSelectedOrder(null);
  };

  /**
   * Update modal field safely.
   */
  const updateSelectedOrderField = (field, value) => {
    setSelectedOrder((currentOrder) => {
      if (!currentOrder) {
        return currentOrder;
      }

      return {
        ...currentOrder,
        [field]: value,
      };
    });
  };

  /**
   * Save admin order changes.
   *
   * Backend endpoint:
   * PUT /api/orders/tracking/:id
   */
  const saveOrderChanges = async () => {
    if (!selectedOrder?._id) {
      toast.error("Order details are unavailable.");
      return;
    }

    try {
      setSaving(true);

      const requestBody = {
        status: selectedOrder.orderStatus,
        paymentStatus: selectedOrder.paymentStatus,
        deliveryDate: selectedOrder.deliveryDate || null,
      };

      const response = await adminApi.updateTracking(
        selectedOrder._id,
        requestBody
      );

      const updatedOrder =
        response?.data?.order ||
        response?.data?.tracking ||
        {
          ...selectedOrder,
        };

      /*
       * Immediately update the current table without waiting for reload.
       */
      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === selectedOrder._id
            ? {
                ...order,
                ...updatedOrder,
              }
            : order
        )
      );

      toast.success("Order updated successfully");

      setShowModal(false);
      setSelectedOrder(null);

      /*
       * Re-fetch to guarantee frontend matches latest MongoDB data.
       */
      await loadOrders();
    } catch (error) {
      console.error(
        "Unable to update order:",
        error?.response?.data || error
      );

      toast.error(
        error?.response?.data?.message ||
          "Could not update order."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Apply all filters.
   */
  let filteredOrders = [...orders];

  const normalizedSearch = search.trim().toLowerCase();

  if (normalizedSearch) {
    filteredOrders = filteredOrders.filter((order) => {
      const customerName =
        order.user?.fullName?.toLowerCase() || "";

      const customerEmail =
        order.user?.email?.toLowerCase() || "";

      const orderId =
        order._id?.toLowerCase() || "";

      return (
        customerName.includes(normalizedSearch) ||
        customerEmail.includes(normalizedSearch) ||
        orderId.includes(normalizedSearch)
      );
    });
  }

  if (statusFilter) {
    filteredOrders = filteredOrders.filter(
      (order) => order.orderStatus === statusFilter
    );
  }

  if (paymentFilter === "COD") {
    filteredOrders = filteredOrders.filter(
      (order) => order.paymentMethod === "COD"
    );
  }

  if (paymentFilter === "Online") {
    filteredOrders = filteredOrders.filter((order) =>
      ONLINE_PAYMENT_METHODS.includes(order.paymentMethod)
    );
  }

  if (dateFilter === "today") {
    const today = new Date().toDateString();

    filteredOrders = filteredOrders.filter(
      (order) =>
        new Date(order.createdAt).toDateString() === today
    );
  }

  if (dateFilter === "week") {
    const currentDate = new Date();
    const sevenDaysAgo = new Date();

    sevenDaysAgo.setDate(currentDate.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    filteredOrders = filteredOrders.filter(
      (order) =>
        new Date(order.createdAt).getTime() >=
        sevenDaysAgo.getTime()
    );
  }

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / ORDERS_PER_PAGE)
  );

  /*
   * Prevent current page from remaining above available pages
   * after search/filter changes.
   */
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const lastIndex = safeCurrentPage * ORDERS_PER_PAGE;
  const firstIndex = lastIndex - ORDERS_PER_PAGE;

  const currentOrders = filteredOrders.slice(
    firstIndex,
    lastIndex
  );

  const getOrderBadgeClass = (orderStatus) => {
    switch (orderStatus) {
      case "Placed":
        return "placed";

      case "Confirmed":
        return "confirmed";

      case "Packed":
        return "packed";

      case "Shipped":
        return "shipped";

      case "Out for Delivery":
        return "delivery";

      case "Delivered":
        return "delivered";

      default:
        return "cancelled";
    }
  };

  return (
    <>
      <div className="admin-toolbar">
        <h1>Orders</h1>

        <div className="product-toolbar orders-toolbar">
          <input
            className="toolbar-input"
            placeholder="Search Orders"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            className="toolbar-select"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Date</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
          </select>

          <select
            className="toolbar-select"
            value={paymentFilter}
            onChange={(event) => {
              setPaymentFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Payment</option>
            <option value="COD">COD</option>
            <option value="Online">Online</option>
          </select>

          <select
            className="toolbar-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Status</option>

            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan="7"
                style={{ color: "var(--muted)" }}
              >
                Loading orders...
              </td>
            </tr>
          ) : currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  #{order._id.slice(-8).toUpperCase()}

                  <br />

                  <small style={{ color: "var(--muted)" }}>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString("en-IN")}
                  </small>
                </td>

                <td>
                  {order.user?.fullName || "—"}

                  <br />

                  <small style={{ color: "var(--muted)" }}>
                    {order.user?.email || ""}
                  </small>
                </td>

                <td>{order.items?.length || 0}</td>

                <td>
                  Rs.{" "}
                  {Number(
                    order.finalAmount ??
                      order.totalAmount ??
                      0
                  ).toLocaleString("en-IN")}
                </td>

                <td>{order.paymentMethod || "—"}</td>

                <td>
                  <span
                    className={`order-badge ${getOrderBadgeClass(
                      order.orderStatus
                    )}`}
                    onClick={() => openOrder(order)}
                    style={{ cursor: "pointer" }}
                  >
                    {order.orderStatus || "Placed"}
                  </span>
                </td>

                <td>
                  <button
                    type="button"
                    className="icon-btn view"
                    title="View"
                    onClick={() => openOrder(order)}
                  >
                    <FaEye size={15} />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="7"
                style={{ color: "var(--muted)" }}
              >
                No orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {!loading && filteredOrders.length > 0 && (
        <div className="pagination">
          <button
            type="button"
            disabled={safeCurrentPage === 1}
            onClick={() =>
              setCurrentPage((page) =>
                Math.max(1, page - 1)
              )
            }
          >
            Previous
          </button>

          {Array.from(
            { length: totalPages },
            (_, index) => (
              <button
                type="button"
                key={index + 1}
                className={
                  safeCurrentPage === index + 1
                    ? "active-page"
                    : ""
                }
                onClick={() =>
                  setCurrentPage(index + 1)
                }
              >
                {index + 1}
              </button>
            )
          )}

          <button
            type="button"
            disabled={safeCurrentPage === totalPages}
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(totalPages, page + 1)
              )
            }
          >
            Next
          </button>
        </div>
      )}

      {showModal && selectedOrder && (
        <div className="modal-back">
          <div className="modal">
            <h2>Order Details</h2>

            <p className="order-number">
              Order #{" "}
              {selectedOrder._id
                .slice(-8)
                .toUpperCase()}
            </p>

            <div className="order-details-grid">
              <div>
                <label>Order ID</label>

                <input
                  readOnly
                  value={`#${selectedOrder._id
                    .slice(-8)
                    .toUpperCase()}`}
                />
              </div>

              <div>
                <label>Customer</label>

                <input
                  readOnly
                  value={
                    selectedOrder.user?.fullName || ""
                  }
                />
              </div>

              <div>
                <label>Email</label>

                <input
                  readOnly
                  value={
                    selectedOrder.user?.email || ""
                  }
                />
              </div>

              <div>
                <label>Order Date</label>

                <input
                  readOnly
                  value={new Date(
                    selectedOrder.createdAt
                  ).toLocaleDateString("en-IN")}
                />
              </div>

              <div>
                <label>Order Type</label>

                <input
                  readOnly
                  value={
                    selectedOrder.paymentMethod || ""
                  }
                />
              </div>

              <div>
                <label>Payment Status</label>

                <select
                  value={
                    selectedOrder.paymentStatus ||
                    "Pending"
                  }
                  onChange={(event) =>
                    updateSelectedOrderField(
                      "paymentStatus",
                      event.target.value
                    )
                  }
                >
                  {PAYMENT_STATUSES.map(
                    (paymentStatus) => (
                      <option
                        key={paymentStatus}
                        value={paymentStatus}
                      >
                        {paymentStatus}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label>Delivery Date</label>

                <input
                  type="date"
                  value={
                    selectedOrder.deliveryDate
                      ? String(
                          selectedOrder.deliveryDate
                        ).substring(0, 10)
                      : ""
                  }
                  onChange={(event) =>
                    updateSelectedOrderField(
                      "deliveryDate",
                      event.target.value
                    )
                  }
                />
              </div>

              <div>
                <label>Total Amount</label>

                <input
                  readOnly
                  value={`₹ ${Number(
                    selectedOrder.finalAmount ??
                      selectedOrder.totalAmount ??
                      0
                  ).toLocaleString("en-IN")}`}
                />
              </div>

              <div>
                <label>Status</label>

                <select
                  value={
                    selectedOrder.orderStatus ||
                    "Placed"
                  }
                  onChange={(event) =>
                    updateSelectedOrderField(
                      "orderStatus",
                      event.target.value
                    )
                  }
                >
                  {STATUSES.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                disabled={saving}
                onClick={saveOrderChanges}
              >
                {saving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                className="mini-btn"
                disabled={saving}
                onClick={closeOrder}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}