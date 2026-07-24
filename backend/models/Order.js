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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "Card", "UPI", "NetBanking"],
      default: "COD",
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    deliveryDate: {
      type: Date,
      default: null,
    },

    orderStatus: {
      type: String,
      enum: ORDER_STATUSES,
      default: "Placed",
    },

    trackingId: {
      type: String,
      default: "",
      trim: true,
    },

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    trackingHistory: [
      {
        status: {
          type: String,
          enum: ORDER_STATUSES,
          required: true,
        },

        note: {
          type: String,
          default: "",
          trim: true,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

/*
  New order create ஆகும்போது:
  - finalAmount empty அல்லது 0 என்றால் calculate செய்யும்
  - trackingHistory-ல் Placed status automatic-aa add செய்யும்
*/
orderSchema.pre("save", function (next) {
  if (
    this.finalAmount === undefined ||
    this.finalAmount === null ||
    this.finalAmount === 0
  ) {
    this.finalAmount = Math.max(
      Number(this.totalAmount || 0) - Number(this.discount || 0),
      0
    );
  }

  if (this.isNew && this.trackingHistory.length === 0) {
    this.trackingHistory.push({
      status: this.orderStatus || "Placed",
      note: "Order placed successfully",
      date: new Date(),
    });
  }

  next();
});

/*
  Admin orderStatus change பண்ணும்போது
  trackingHistory automatic-aa add ஆகும்.
*/
orderSchema.pre("save", function (next) {
  if (!this.isNew && this.isModified("orderStatus")) {
    const latestHistory =
      this.trackingHistory.length > 0
        ? this.trackingHistory[this.trackingHistory.length - 1]
        : null;

    if (!latestHistory || latestHistory.status !== this.orderStatus) {
      this.trackingHistory.push({
        status: this.orderStatus,
        note: `Order status updated to ${this.orderStatus}`,
        date: new Date(),
      });
    }

    if (this.orderStatus === "Delivered" && !this.deliveryDate) {
      this.deliveryDate = new Date();
    }

    if (this.orderStatus !== "Delivered" && this.deliveryDate) {
      this.deliveryDate = null;
    }
  }

  next();
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;