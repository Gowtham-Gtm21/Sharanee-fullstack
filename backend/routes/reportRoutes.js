const express = require("express");

const router = express.Router();

const {
    getDashboardReport
} = require("../controllers/reportController");

const { protect, admin } = require("../middleware/auth");

router.get(
    "/dashboard",
    protect,
    admin,
    getDashboardReport
);

module.exports = router;