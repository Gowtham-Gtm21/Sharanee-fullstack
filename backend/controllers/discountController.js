const Discount = require("../models/Discount");
const asyncHandler = require("../utils/asyncHandler");

// Create Discount
const createDiscount = asyncHandler(async (req, res) => {
    const today = new Date();

    const start = new Date(req.body.startDate);
    const end = new Date(req.body.endDate);

    let status = "Scheduled";

    if (today >= start && today <= end) {
        status = "Active";
    } else if (today > end) {
        status = "Expired";
    }

    const discount = await Discount.create({
        ...req.body,
        status,
    });

    res.status(201).json({
        success: true,
        discount,
    });
});

// List Discounts
const listDiscounts = asyncHandler(async (req, res) => {
    const discounts = await Discount.find()
        .populate("product", "productName")
        .populate("category", "categoryName")
        .sort({ createdAt: -1 });

    const today = new Date();

    for (const discount of discounts) {
        let status = "Scheduled";

        if (today >= discount.startDate && today <= discount.endDate) {
            status = "Active";
        } else if (today > discount.endDate) {
            status = "Expired";
        }

        if (discount.status !== status) {
            discount.status = status;
            await discount.save();
        }
    }

    res.json({
        success: true,
        discounts,
    });
});

// Update Discount
const updateDiscount = asyncHandler(async (req, res) => {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
        return res.status(404).json({
            message: "Discount not found",
        });
    }

    Object.assign(discount, req.body);

    const today = new Date();

    if (today < discount.startDate) {
        discount.status = "Scheduled";
    } else if (today > discount.endDate) {
        discount.status = "Expired";
    } else {
        discount.status = "Active";
    }

    await discount.save();

    res.json({
        success: true,
        discount,
    });
});

// Delete Discount
const removeDiscount = asyncHandler(async (req, res) => {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
        return res.status(404).json({
            message: "Discount not found",
        });
    }

    await discount.deleteOne();

    res.json({
        success: true,
        message: "Discount deleted successfully",
    });
});

// Enable / Disable
const toggleDiscount = asyncHandler(async (req, res) => {
    const discount = await Discount.findById(req.params.id);

    if (!discount) {
        return res.status(404).json({
            message: "Discount not found",
        });
    }

    discount.active = !discount.active;

    await discount.save();

    res.json({
        success: true,
        discount,
    });
});

module.exports = {
    createDiscount,
    listDiscounts,
    updateDiscount,
    removeDiscount,
    toggleDiscount,
};