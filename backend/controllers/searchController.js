const asyncHandler = require("../utils/asyncHandler");

const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Order = require("../models/Order");
const Coupon = require("../models/Coupon");

const search = asyncHandler(async (req, res) => {
    const q = (req.query.q || "").trim();

    if (!q) {
        return res.json({
            products: [],
            categories: [],
            users: [],
            orders: [],
            coupons: [],
        });
    }

    const regex = new RegExp(q, "i");

    const [
        products,
        categories,
        users,
        coupons,
        orders,
    ] = await Promise.all([

        Product.find({
            $or: [
                { productName: regex },
                { brand: regex },
                { fabric: regex },
                { color: regex },
                { occasion: regex },
            ],
        })
            .populate("category", "categoryName")
            .limit(10),

        Category.find({
            categoryName: regex,
        }).limit(10),

        User.find({
            role: "user",
            $or: [
                { fullName: regex },
                { email: regex },
                { phone: regex },
            ],
        })
            .select("-password")
            .limit(10),

        Coupon.find({
            code: regex,
        }).limit(10),

        Order.find()
            .populate("user", "fullName")
            .limit(20),
    ]);

    const filteredOrders = orders.filter((order) => {
        return (
            order.user?.fullName?.match(regex) ||
            order.trackingId?.match(regex)
        );
    });

    res.json({
        products,
        categories,
        users,
        orders: filteredOrders,
        coupons,
    });
});

module.exports = {
    search,
};