const asyncHandler = require("../utils/asyncHandler");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const Category = require("../models/Category");

const getDashboardReport = asyncHandler(async (req, res) => {

    // Total Revenue
    const revenue = await Order.aggregate([
        {
            $match: {
                paymentStatus: {
                    $in: ["Paid", "Pending"]
                }
            }
        },
        {
            $group: {
                _id: null,
                totalRevenue: {
                    $sum: "$totalAmount"
                }
            }
        }
    ]);

    // Summary
    const totalOrders = await Order.countDocuments();

    const totalProducts = await Product.countDocuments();

    const totalCustomers = await User.countDocuments({
        role: "user"
    });

    const totalCategories = await Category.countDocuments();
    // Low Stock Products
    const lowStockProducts = await Product.find({
        stock: {
            $lt: 10
        }
    })
        .select("productName stock images stockStatus")
        .sort({
            stock: 1
        });

    // Recent Orders

    // Revenue Summary
    const revenueSummary = await Order.aggregate([
        {
            $match: {
                paymentStatus: { $in: ["Paid", "Pending"] },
            },
        },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$totalAmount" },
                averageOrderValue: { $avg: "$totalAmount" },
                totalSales: { $sum: 1 },
            },
        },
    ]);

    // Monthly Sales
    const monthlySales = await Order.aggregate([
        {
            $match: {
                paymentStatus: { $in: ["Paid", "Pending"] },
            },
        },
        {
            $group: {
                _id: {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                },
                revenue: { $sum: "$totalAmount" },
                orders: { $sum: 1 },
            },
        },
        {
            $sort: {
                "_id.year": 1,
                "_id.month": 1,
            },
        },
    ]);

    // Top Selling Products
    const topProducts = await Order.aggregate([
        { $unwind: "$items" },

        {
            $group: {
                _id: "$items.product",
                quantitySold: { $sum: "$items.quantity" },
            },
        },

        { $sort: { quantitySold: -1 } },

        { $limit: 5 },

        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },

        { $unwind: "$product" },

        {
            $project: {
                productName: "$product.productName",
                quantitySold: 1,
            },
        },
    ]);

    // Top Categories
    const topCategories = await Order.aggregate([
        { $unwind: "$items" },

        {
            $lookup: {
                from: "products",
                localField: "items.product",
                foreignField: "_id",
                as: "product",
            },
        },

        { $unwind: "$product" },

        {
            $group: {
                _id: "$product.category",
                orders: { $sum: "$items.quantity" },
            },
        },

        { $sort: { orders: -1 } },

        { $limit: 5 },

        {
            $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "category",
            },
        },

        { $unwind: "$category" },

        {
            $project: {
                categoryName: "$category.categoryName",
                orders: 1,
            },
        },
    ]);

    const recentOrders = await Order.find({})
        .populate("user", "fullName")
        .select("user totalAmount paymentStatus orderStatus createdAt")
        .sort({ createdAt: -1 })
        .limit(5);

    res.json({

        success: true,

      summary: {
    totalRevenue:
        revenue.length > 0
            ? revenue[0].totalRevenue
            : 0,

    totalOrders,

    totalProducts,

    totalCategories,

    totalCustomers,
},

revenueSummary:
    revenueSummary.length > 0
        ? revenueSummary[0]
        : {},

monthlySales,

topProducts,

topCategories,

lowStockProducts,

recentOrders,

    });

});

module.exports = {
    getDashboardReport
};