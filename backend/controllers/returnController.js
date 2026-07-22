const Return = require("../models/Return");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/returns   body: { user, order, product, reason }
const createReturn = asyncHandler(async (req, res) => {
  const { user, order, product, reason } = req.body;
  if (!user || !order || !product || !reason) {
    return res.status(400).json({ message: "user, order, product and reason are required" });
  }
  const doc = await Return.create({ user, order, product, reason });
  res.status(201).json({ return: doc });
});

// @route  GET /api/returns/:userId
const myReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find({ user: req.params.userId })
    .populate("order product")
    .sort({ createdAt: -1 });
  res.json({ returns });
});

// @route  GET /api/returns  (admin)
const allReturns = asyncHandler(async (req, res) => {
  const returns = await Return.find().populate("order product user").sort({ createdAt: -1 });
  res.json({ returns });
});

// @route  PUT /api/returns/:id  (admin)  body: { status }
const updateReturnStatus = asyncHandler(async (req, res) => {
  const doc = await Return.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!doc) return res.status(404).json({ message: "Return request not found" });
  res.json({ return: doc });
});

module.exports = { createReturn, myReturns, allReturns, updateReturnStatus };
