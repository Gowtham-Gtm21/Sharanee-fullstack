const mongoose = require("mongoose");

const discountSchema = new mongoose.Schema(
    {
        offerName: {
            type: String,
            required: true,
            trim: true,
        },

        applyTo: {
            type: String,
            enum: ["Product", "Category"],
            required: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null,
        },

        discountType: {
            type: String,
            enum: ["Percentage", "Flat"],
            required: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: 0,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: ["Scheduled", "Active", "Expired"],
            default: "Scheduled",
        },

        active: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Discount", discountSchema);