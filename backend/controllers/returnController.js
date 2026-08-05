const Return = require("../models/Return");
const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
// =====================================================
// CREATE RETURN REQUEST
// POST /api/returns
// Customer
// body: { order, product, reason }
// =====================================================

const createReturn = asyncHandler(async (req, res) => {
  const { order, product, reason } = req.body;

  if (!order || !product || !reason?.trim()) {
    return res.status(400).json({
      message: "Order, product and reason are required",
    });
  }

  // Logged-in customer from JWT
  const userId = req.user._id;
  // Check order belongs to logged-in customer
  const existingOrder = await Order.findOne({
    _id: order,
    user: userId,
  });

  if (!existingOrder) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  // Return allowed only after delivery
  if (existingOrder.orderStatus !== "Delivered") {
    return res.status(400).json({
      message: "Return is allowed only for delivered orders",
    });
  }

  // Check selected product actually belongs to this order
  const productExists = existingOrder.items.some(
    (item) => item.product.toString() === product.toString()
  );

  if (!productExists) {
    return res.status(400).json({
      message: "This product does not belong to the selected order",
    });
  }

  // Prevent duplicate return for same order + product
  const existingReturn = await Return.findOne({
    user: userId,
    order,
    product,
  });

  if (existingReturn) {
    return res.status(400).json({
      message: "Return request already submitted for this product",
    });
  }

  const returnRequest = await Return.create({
    user: userId,
    order,
    product,
    reason: reason.trim(),
  });

  const populatedReturn = await Return.findById(returnRequest._id)
    .populate("user", "fullName email phone")
    .populate("product", "productName price discountPrice images")
    .populate("order");

  res.status(201).json({
    success: true,
    message: "Return request submitted successfully",
    return: populatedReturn,
  });
});


// =====================================================
// GET LOGGED-IN CUSTOMER RETURNS
// GET /api/returns/my
// Customer
// =====================================================

const myReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({
    user: req.user._id,
  })
    .populate("order")
    .populate(
      "product",
      "productName price discountPrice images"
    )
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: returns.length,
    returns,
  });
});


// =====================================================
// GET ALL RETURNS
// GET /api/returns
// Admin
// =====================================================

const allReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find()
    .populate("user", "fullName email phone")
    .populate("order")
    .populate(
      "product",
      "productName price discountPrice images"
    )
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: returns.length,
    returns,
  });
});


// =====================================================
// UPDATE RETURN / REFUND
// PUT /api/returns/:id
// Admin
//
// body:
// {
//   status,
//   refundStatus,
//   refundMethod,
//   refundAmount,
//   adminNote
// }
// =====================================================

const updateReturnStatus = asyncHandler(async (req, res) => {
  const {
    status,
    refundStatus,
    refundMethod,
    refundAmount,
    adminNote,
  } = req.body;

  const returnRequest = await Return.findById(req.params.id);

  if (!returnRequest) {
    return res.status(404).json({
      message: "Return request not found",
    });
  }

  // Return status
  if (status !== undefined) {
    returnRequest.status = status;
  }

  // Refund status
  if (refundStatus !== undefined) {
    returnRequest.refundStatus = refundStatus;
  }

  // Refund method
  if (refundMethod !== undefined) {
    returnRequest.refundMethod = refundMethod;
  }

  // Refund amount
  if (refundAmount !== undefined) {
    const amount = Number(refundAmount);

    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        message: "Invalid refund amount",
      });
    }

    returnRequest.refundAmount = amount;
  }

  // Admin note
  if (adminNote !== undefined) {
    returnRequest.adminNote = String(adminNote).trim();
  }

  // If refund completed -> return automatically Refunded
  if (refundStatus === "Completed") {
    returnRequest.status = "Refunded";
  }

  // If return rejected -> refund automatically Rejected
  if (status === "Rejected") {
    returnRequest.refundStatus = "Rejected";
  }

  await returnRequest.save();

  const updatedReturn = await Return.findById(returnRequest._id)
    .populate("user", "fullName email phone")
    .populate(
      "product",
      "productName price discountPrice images"
    )
    .populate("order");

  res.json({
    success: true,
    message: "Return request updated successfully",
    return: updatedReturn,
  });
});


module.exports = {
  createReturn,
  myReturns,
  allReturns,
  updateReturnStatus,
};