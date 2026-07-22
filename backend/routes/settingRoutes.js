const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settingController");
const { protect, admin } = require("../middleware/auth");

router.get("/", getSettings);
router.put("/", protect, admin, updateSettings);

module.exports = router;
