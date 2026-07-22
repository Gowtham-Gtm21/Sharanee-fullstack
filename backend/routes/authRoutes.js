const express = require("express");
const router = express.Router();
const { register, login, forgotPassword, resetPassword, profile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, profile);

module.exports = router;
