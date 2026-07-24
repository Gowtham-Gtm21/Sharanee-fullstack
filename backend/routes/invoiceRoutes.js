const express = require("express");

const {
  downloadInvoice,
} = require("../controllers/invoiceController");

const {
  protect,
} = require("../middleware/auth");

const router = express.Router();

// Download invoice PDF
// Route: GET /api/invoice/:orderId
// Access: Authenticated User / Admin
router.get(
  "/:orderId",
  protect,
  downloadInvoice
);

module.exports = router;