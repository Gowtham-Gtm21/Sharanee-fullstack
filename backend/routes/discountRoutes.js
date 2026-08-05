const express = require("express");
const router = express.Router();

const {
    createDiscount,
    listDiscounts,
    updateDiscount,
    removeDiscount,
    toggleDiscount,
} = require("../controllers/discountController");

const { protect, admin } = require("../middleware/auth");

// Create
router.post("/", protect, admin, createDiscount);

// List
router.get("/", protect, admin, listDiscounts);

// Update
router.put("/:id", protect, admin, updateDiscount);

// Delete
router.delete("/:id", protect, admin, removeDiscount);

// Enable / Disable
router.put("/toggle/:id", protect, admin, toggleDiscount);

module.exports = router;