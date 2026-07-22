const express = require("express");
const router = express.Router();
const {
  addNotification,
  listNotifications,
  markRead,
  removeNotification,
} = require("../controllers/notificationController");
const { protect, admin } = require("../middleware/auth");

router.post("/", protect, admin, addNotification);
router.get("/", protect, admin, listNotifications);
router.put("/:id/read", protect, admin, markRead);
router.delete("/:id", protect, admin, removeNotification);

module.exports = router;
