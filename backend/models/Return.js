const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: [
        "Requested",
        "Approved",
        "Rejected",
        "Picked Up",
        "Refunded",
      ],
      default: "Requested",
    },

    refundStatus: {
      type: String,
      enum: [
        "Not Started",
        "Processing",
        "Completed",
        "Rejected",
      ],
      default: "Not Started",
    },

    refundMethod: {
      type: String,
      enum: [
        "Original Payment Method",
        "Bank Transfer",
        "UPI",
        "Not Selected",
      ],
      default: "Not Selected",
    },

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    adminNote: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Return", returnSchema);