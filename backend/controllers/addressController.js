const Address = require("../models/Address");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/address
const addAddress = asyncHandler(async (req, res) => {
  const address = await Address.create(req.body);
  res.status(201).json({ address });
});

// @route  GET /api/address/:userId
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.params.userId }).sort({ createdAt: -1 });
  res.json({ addresses });
});

// @route  PUT /api/address/:id
const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!address) return res.status(404).json({ message: "Address not found" });
  res.json({ address });
});

// @route  DELETE /api/address/:id
const removeAddress = asyncHandler(async (req, res) => {
  const address = await Address.findByIdAndDelete(req.params.id);
  if (!address) return res.status(404).json({ message: "Address not found" });
  res.json({ message: "Address removed" });
});

module.exports = { addAddress, getAddresses, updateAddress, removeAddress };
