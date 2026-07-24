import api from "./client";

// ---------- Auth ----------
export const authApi = {
  register: (data) => api.post("/auth/register", data),

  login: (data) => api.post("/auth/login", data),

  forgotPassword: (email) =>
    api.post("/auth/forgot-password", { email }),

  resetPassword: (token, password) =>
    api.put(`/auth/reset-password/${token}`, {
      password,
    }),

  profile: () => api.get("/auth/profile"),
};

// ---------- Categories ----------
export const categoryApi = {
  list: () => api.get("/categories"),

  create: (formData) =>
    api.post("/categories", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    api.put(`/categories/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  remove: (id) => api.delete(`/categories/${id}`),
};

// ---------- Products ----------
export const productApi = {
  // Supported params:
  // search, category, fabric, color, occasion,
  // featured, minPrice, maxPrice, sort
  list: (params = {}) =>
    api.get("/products", {
      params,
    }),

  get: (id) => api.get(`/products/${id}`),

  create: (formData) =>
    api.post("/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  remove: (id) => api.delete(`/products/${id}`),

  lowStock: () => api.get("/products/low-stock"),

  outOfStock: () => api.get("/products/out-of-stock"),
};

// ---------- Cart ----------
export const cartApi = {
  add: (user, product, quantity = 1) =>
    api.post("/cart", {
      user,
      product,
      quantity,
    }),

  get: (userId) => api.get(`/cart/${userId}`),

  updateQty: (id, quantity) =>
    api.put(`/cart/${id}`, {
      quantity,
    }),

  remove: (id) => api.delete(`/cart/${id}`),
};

// ---------- Wishlist ----------
export const wishlistApi = {
  add: (user, product) =>
    api.post("/wishlist", {
      user,
      product,
    }),

  get: (userId) => api.get(`/wishlist/${userId}`),

  remove: (id) => api.delete(`/wishlist/${id}`),
};

// ---------- Address ----------
export const addressApi = {
  add: (data) => api.post("/address", data),

  get: (userId) => api.get(`/address/${userId}`),

  update: (id, data) =>
    api.put(`/address/${id}`, data),

  remove: (id) => api.delete(`/address/${id}`),
};

// ---------- Orders ----------
export const orderApi = {
  // Customer places a new order
  place: (data) => api.post("/orders", data),

  // Customer's complete order list
  myOrders: (userId) =>
    api.get(`/orders/user/${userId}`),

  // Complete details for one order
  get: (id) => api.get(`/orders/${id}`),

  // Customer cancels an order
  cancel: (id) =>
    api.put(`/orders/cancel/${id}`),

  // Customer fetches latest order tracking details
  tracking: (id) =>
    api.get(`/orders/tracking/${id}`),

  // Kept for places where an admin order action imports orderApi
  updateTracking: (id, data) =>
    api.put(`/orders/tracking/${id}`, data),
};

// ---------- Reviews ----------
export const reviewApi = {
  add: (data) => api.post("/reviews", data),

  forProduct: (productId) =>
    api.get(`/reviews/${productId}`),

  update: (id, data) =>
    api.put(`/reviews/${id}`, data),

  remove: (id) => api.delete(`/reviews/${id}`),
};

// ---------- Coupons ----------
export const couponApi = {
  create: (data) => api.post("/coupons", data),

  list: () => api.get("/coupons"),

  apply: (code, totalAmount) =>
    api.post("/coupons/apply", {
      code,
      totalAmount,
    }),

  update: (id, data) =>
    api.put(`/coupons/${id}`, data),

  remove: (id) => api.delete(`/coupons/${id}`),
};

// ---------- Returns ----------
export const returnApi = {
  create: (data) => api.post("/returns", data),

  mine: (userId) => api.get(`/returns/${userId}`),

  all: () => api.get("/returns"),

  updateStatus: (id, data) =>
    api.put(`/returns/${id}`, data),
};

// ---------- Invoice ----------
export const invoiceApi = {
  /*
   * Invoice endpoint requires authentication.
   * Axios fetches the PDF as a blob so the Bearer token is included.
   */
  download: async (orderId) => {
    const response = await api.get(
      `/invoice/${orderId}`,
      {
        responseType: "blob",
      }
    );

    const contentType =
      response.headers?.["content-type"] ||
      "application/pdf";

    const blob = new Blob([response.data], {
      type: contentType,
    });

    const blobUrl =
      window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;
    link.download = `invoice-${orderId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  },
};

// ---------- Settings ----------
export const settingApi = {
  get: () => api.get("/settings"),

  update: (data) =>
    api.put("/settings", data),
};

// ---------- Offers ----------
export const offerApi = {
  active: () => api.get("/offers/active"),

  all: () => api.get("/offers"),

  create: (data) => api.post("/offers", data),

  update: (id, data) =>
    api.put(`/offers/${id}`, data),

  remove: (id) => api.delete(`/offers/${id}`),
};

// ---------- Notifications ----------
export const notificationApi = {
  add: (data) =>
    api.post("/notifications", data),

  list: () => api.get("/notifications"),

  markRead: (id) =>
    api.put(`/notifications/${id}/read`),

  remove: (id) =>
    api.delete(`/notifications/${id}`),
};

// ---------- Admin ----------
export const adminApi = {
  dashboard: () =>
    api.get("/admin/dashboard"),

  users: () =>
    api.get("/admin/users"),

  user: (id) =>
    api.get(`/admin/users/${id}`),

  updateUser: (id, data) =>
    api.put(`/admin/users/${id}`, data),

  deleteUser: (id) =>
    api.delete(`/admin/users/${id}`),

  // Admin orders listing
  orders: () =>
    api.get("/admin/orders"),

  /*
   * Existing admin order endpoint.
   * Kept for compatibility with any other admin page.
   */
  updateOrderStatus: (id, orderStatus) =>
    api.put(`/admin/orders/${id}`, {
      orderStatus,
    }),

  /*
   * Main admin tracking update endpoint.
   *
   * Supported data:
   * {
   *   status,
   *   note,
   *   trackingId,
   *   courierName,
   *   paymentStatus,
   *   deliveryDate
   * }
   */
  updateTracking: (id, data) =>
    api.put(`/orders/tracking/${id}`, data),

  analytics: () =>
    api.get("/admin/analytics"),

  search: (query) =>
    api.get("/admin/search", {
      params: {
        q: query,
      },
    }),
};

// ---------- Reports ----------
export const reportApi = {
  dashboard: () =>
    api.get("/reports/dashboard"),
};