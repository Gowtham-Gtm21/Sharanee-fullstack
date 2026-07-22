const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    shippingAddress: { type: mongoose.Schema.Types.ObjectId, ref: "Address", required: true },
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["COD", "Card", "UPI", "NetBanking"], default: "COD" },
    paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
    orderStatus: { type: String, enum: ORDER_STATUSES, default: "Placed" },
    trackingId: { type: String, default: "" },
    courierName: { type: String, default: "" },
    trackingHistory: [
      {
        status: { type: String, required: true },
        note: { type: String, default: "" },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
