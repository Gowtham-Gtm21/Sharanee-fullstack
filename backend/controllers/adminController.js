const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");

// @route  GET /api/admin/dashboard
// @access Admin
const dashboard = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalProducts,
    totalCategories,
    totalOrders,
    revenueResult,
    lowStockCount,
    outOfStockCount,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),

    Product.countDocuments(),

    Category.countDocuments(),

    Order.countDocuments(),

    Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Cancelled", "Canceled"],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: {
            $sum: {
              $ifNull: ["$totalAmount", 0],
            },
          },
        },
      },
    ]),

    Product.countDocuments({
      stockStatus: "Low Stock",
    }),

    Product.countDocuments({
      stockStatus: "Out of Stock",
    }),
  ]);

  const totalRevenue =
    revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

  res.status(200).json({
    dashboard: {
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      totalRevenue,
      lowStockCount,
      outOfStockCount,
    },
  });
});

// @route  GET /api/admin/users
// @access Admin
const listUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  res.status(200).json({
    users,
    count: users.length,
  });
});

// @route  GET /api/admin/users/:id
// @access Admin
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "-password"
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  res.status(200).json({
    user,
  });
});

// @route  PUT /api/admin/users/:id
// @access Admin
const updateUser = asyncHandler(async (req, res) => {
  const { fullName, email, phone, role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (fullName !== undefined) {
    user.fullName = fullName;
  }

  if (email !== undefined) {
    user.email = email;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  if (role !== undefined) {
    user.role = role;
  }

  await user.save();

  const updatedUser = await User.findById(user._id).select(
    "-password"
  );

  res.status(200).json({
    message: "User updated successfully",
    user: updatedUser,
  });
});

// @route  DELETE /api/admin/users/:id
// @access Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  await user.deleteOne();

  res.status(200).json({
    message: "User removed successfully",
  });
});

// @route  GET /api/admin/orders
// @access Admin
const listOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "fullName email phone")
    .populate("items.product", "productName images price")
    .populate("shippingAddress")
    .sort({ createdAt: -1 });

  res.status(200).json({
    orders,
    count: orders.length,
  });
});

// @route  PUT /api/admin/orders/:id
// @access Admin
// body: { orderStatus }
const updateOrderStatus = asyncHandler(
  async (req, res) => {
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return res.status(400).json({
        message: "Order status is required",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    if (!Array.isArray(order.trackingHistory)) {
      order.trackingHistory = [];
    }

    order.trackingHistory.push({
      status: orderStatus,
      date: new Date(),
    });

    await order.save();

    const updatedOrder = await Order.findById(
      order._id
    )
      .populate("user", "fullName email phone")
      .populate(
        "items.product",
        "productName images price"
      )
      .populate("shippingAddress");

    res.status(200).json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  }
);

// @route  GET /api/admin/analytics
// @access Admin
const analytics = asyncHandler(async (req, res) => {
  const [
    salesByStatus,
    salesByMonth,
    topProducts,
    recentOrders,
    recentUsers,
  ] = await Promise.all([
    Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
          total: {
            $sum: {
              $ifNull: ["$totalAmount", 0],
            },
          },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Cancelled", "Canceled"],
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },
            month: {
              $month: "$createdAt",
            },
          },
          total: {
            $sum: {
              $ifNull: ["$totalAmount", 0],
            },
          },
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]),

    Order.aggregate([
      {
        $match: {
          orderStatus: {
            $nin: ["Cancelled", "Canceled"],
          },
        },
      },
      {
        $unwind: "$items",
      },
      {
        $group: {
          _id: "$items.product",
          unitsSold: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },
          revenue: {
            $sum: {
              $multiply: [
                {
                  $ifNull: ["$items.price", 0],
                },
                {
                  $ifNull: ["$items.quantity", 0],
                },
              ],
            },
          },
        },
      },
      {
        $sort: {
          unitsSold: -1,
        },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]),

    Order.find()
      .populate("user", "fullName email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),

    User.find({
      role: "user",
    })
      .select("fullName email phone createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);

  res.status(200).json({
    analytics: {
      salesByStatus,
      salesByMonth,
      topProducts,
      recentOrders,
      recentUsers,
    },
  });
});

module.exports = {
  dashboard,
  listUsers,
  getUser,
  updateUser,
  deleteUser,
  listOrders,
  updateOrderStatus,
  analytics,
};