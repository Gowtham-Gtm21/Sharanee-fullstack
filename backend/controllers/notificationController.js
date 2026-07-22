const Notification = require("../models/Notification");
const asyncHandler = require("../utils/asyncHandler");

// @route  POST /api/notifications  (admin)
const addNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json({ notification });
});

// @route  GET /api/notifications
const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find().sort({ createdAt: -1 });
  res.json({ notifications });
});

// @route  PUT /api/notifications/:id/read
const markRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ notification });
});

// @route  DELETE /api/notifications/:id
const removeNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) return res.status(404).json({ message: "Notification not found" });
  res.json({ message: "Notification removed" });
});

module.exports = { addNotification, listNotifications, markRead, removeNotification };
