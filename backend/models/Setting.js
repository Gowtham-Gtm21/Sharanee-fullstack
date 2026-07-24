const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    storeName: String,
    storeEmail: String,
    storePhone: String,
    storeAddress: String,

    currency: {
      type: String,
      default: "INR"
    },

    shippingFee: {
      type: Number,
      default: 0
    },

    freeShippingThreshold: {
      type: Number,
      default: 0
    },

    deliveryDays: {
      type: String,
      default: "5-7"
    },

    taxRate: {
      type: Number,
      default: 0
    },

    taxIncluded: {
      type: Boolean,
      default: false
    },

    codEnabled: {
      type: Boolean,
      default: true
    },

    onlinePaymentEnabled: {
      type: Boolean,
      default: true
    },

    upiId: String,

    emailOnNewOrder: {
      type: Boolean,
      default: true
    },

    emailOnLowStock: {
      type: Boolean,
      default: true
    },

    emailOnNewCustomer: {
      type: Boolean,
      default: false
    },

    lowStockThreshold: {
      type: Number,
      default: 10
    },

    maintenanceMode: {
      type: Boolean,
      default: false
    }

  },
  { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);