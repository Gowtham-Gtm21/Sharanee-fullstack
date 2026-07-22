const express = require("express");
const router = express.Router();
const { downloadInvoice } = require("../controllers/invoiceController");
const { protect } = require("../middleware/auth");

router.get("/:orderId", protect, downloadInvoice);

module.exports = router;
