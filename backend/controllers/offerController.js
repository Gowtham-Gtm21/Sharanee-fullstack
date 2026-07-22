const Offer = require("../models/Offer");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/offers/active
const activeOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ active: true, endDate: { $gte: new Date() } }).sort({ createdAt: -1 });
  res.json({ offers });
});

// @route  GET /api/offers  (admin)
const allOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find().sort({ createdAt: -1 });
  res.json({ offers });
});

// @route  POST /api/offers  (admin)
const createOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.create(req.body);
  res.status(201).json({ offer });
});

// @route  PUT /api/offers/:id  (admin)
const updateOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!offer) return res.status(404).json({ message: "Offer not found" });
  res.json({ offer });
});

// @route  DELETE /api/offers/:id  (admin)
const removeOffer = asyncHandler(async (req, res) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) return res.status(404).json({ message: "Offer not found" });
  res.json({ message: "Offer removed" });
});

module.exports = { activeOffers, allOffers, createOffer, updateOffer, removeOffer };
