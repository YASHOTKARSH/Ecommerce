const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { calculateRevenue, groupByDate, getDateRange } = require('../utils/analyticsHelper');
const cloudinary = require('../config/cloudinary');

// Constants
const MONGODB_OBJECTID_REGEX = /^[0-9a-fA-F]{24}$/;
const CLOUDINARY_PUBLIC_ID_REGEX = /\/v\d+\/(.+)\.\w+$/;

// ==================== USER MANAGEMENT ====================

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', role = '' } = req.query;

  const query = {};

  // Search by name or email
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  // Filter by role
  if (role && ['admin', 'customer'].includes(role)) {
    query.role = role;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Get user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.role = role;
  await user.save();

  const updatedUser = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: updatedUser,
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Ban/unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const banUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent admin from banning themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, 'You cannot ban your own account');
  }

  // Toggle ban status
  user.isBanned = !user.isBanned;
  await user.save();

  const updatedUser = await User.findById(user._id).select('-password');

  res.status(200).json({
    success: true,
    message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
    data: updatedUser,
  });
});

// ==================== ORDER MANAGEMENT ====================

// @desc    Get all orders with filters and pagination
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status = '',
    paymentStatus = '',
    search = '',
  } = req.query;

  const query = {};

  // Filter by order status
  if (status && ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    query.orderStatus = status;
  }

  // Filter by payment status
  if (paymentStatus && ['pending', 'completed', 'failed', 'refunded'].includes(paymentStatus)) {
    query.paymentStatus = paymentStatus;
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  // For search, we need to first find users if searching by email
  let userIds = [];
  if (search) {
    const users = await User.find({
      email: { $regex: search, $options: 'i' },
    }).select('_id');
    userIds = users.map((u) => u._id);
    
    // Try to search by order ID as well
    if (MONGODB_OBJECTID_REGEX.test(search)) {
      query.$or = [{ _id: search }, { user: { $in: userIds } }];
    } else if (userIds.length > 0) {
      query.user = { $in: userIds };
    }
  }

  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('items.product', 'title category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// @desc    Get order by ID
// @route   GET /api/admin/orders/:id
// @access  Private/Admin
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email address')
    .populate('items.product', 'title category price images');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Validate status transition logic
  const validTransitions = {
    processing: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };

  if (!validTransitions[order.orderStatus].includes(orderStatus)) {
    throw new ApiError(
      400,
      `Cannot transition from ${order.orderStatus} to ${orderStatus}`
    );
  }

  order.orderStatus = orderStatus;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'title category');

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: updatedOrder,
  });
});

// @desc    Update payment status
// @route   PUT /api/admin/orders/:id/payment-status
// @access  Private/Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const order = await Order.findById(req.params.id).populate('items.product');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // If refunding, restore stock
  if (paymentStatus === 'refunded' && order.paymentStatus !== 'refunded') {
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product._id, {
          $inc: { stock: item.quantity },
        });
      }
    }
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  const updatedOrder = await Order.findById(order._id)
    .populate('user', 'name email')
    .populate('items.product', 'title category');

  res.status(200).json({
    success: true,
    message: 'Payment status updated successfully',
    data: updatedOrder,
  });
});

// ==================== PRODUCT MANAGEMENT ====================

// @desc    Get product statistics
// @route   GET /api/admin/products/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } });
  const outOfStockProducts = await Product.countDocuments({ stock: 0 });

  // Calculate total inventory value using aggregation
  const inventoryValue = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
      },
    },
  ]);
  const totalInventoryValue = inventoryValue.length > 0 ? inventoryValue[0].totalValue : 0;

  // Products by category
  const productsByCategory = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      totalInventoryValue,
      productsByCategory,
    },
  });
});

// @desc    Bulk update products
// @route   PUT /api/admin/products/bulk-update
// @access  Private/Admin
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { updates } = req.body;

  const results = [];

  for (const update of updates) {
    try {
      const product = await Product.findByIdAndUpdate(
        update.id,
        update.updates,
        { new: true, runValidators: true }
      );

      if (!product) {
        results.push({
          id: update.id,
          success: false,
          message: 'Product not found',
        });
      } else {
        results.push({
          id: update.id,
          success: true,
          message: 'Product updated successfully',
          data: product,
        });
      }
    } catch (error) {
      results.push({
        id: update.id,
        success: false,
        message: error.message,
      });
    }
  }

  res.status(200).json({
    success: true,
    message: 'Bulk update completed',
    results,
  });
});

// @desc    Bulk delete products
// @route   DELETE /api/admin/products/bulk-delete
// @access  Private/Admin
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  // Get products to delete their Cloudinary images
  const products = await Product.find({ _id: { $in: ids } });

  // Delete Cloudinary images
  for (const product of products) {
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          // Extract public_id from Cloudinary URL
          const matches = imageUrl.match(CLOUDINARY_PUBLIC_ID_REGEX);
          if (matches && matches[1]) {
            await cloudinary.uploader.destroy(matches[1]);
          }
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }
    }
  }

  // Delete products
  const result = await Product.deleteMany({ _id: { $in: ids } });

  res.status(200).json({
    success: true,
    message: `${result.deletedCount} products deleted successfully`,
    deletedCount: result.deletedCount,
  });
});

// ==================== ANALYTICS & DASHBOARD ====================

// @desc    Get dashboard overview
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = asyncHandler(async (req, res) => {
  // Date ranges
  const today = getDateRange('today');
  const week = getDateRange('week');
  const month = getDateRange('month');

  // Total counts
  const totalUsers = await User.countDocuments();
  const totalOrders = await Order.countDocuments();

  // Revenue calculations
  const allCompletedOrders = await Order.find({ paymentStatus: 'completed' });
  const totalRevenue = calculateRevenue(allCompletedOrders);

  const todayOrders = await Order.find({
    createdAt: { $gte: today.startDate, $lte: today.endDate },
  });
  const revenueToday = calculateRevenue(todayOrders.filter((o) => o.paymentStatus === 'completed'));
  const ordersToday = todayOrders.length;

  const weekOrders = await Order.find({
    createdAt: { $gte: week.startDate, $lte: week.endDate },
  });
  const revenueThisWeek = calculateRevenue(weekOrders.filter((o) => o.paymentStatus === 'completed'));
  const ordersThisWeek = weekOrders.length;

  const monthOrders = await Order.find({
    createdAt: { $gte: month.startDate, $lte: month.endDate },
  });
  const revenueThisMonth = calculateRevenue(monthOrders.filter((o) => o.paymentStatus === 'completed'));
  const ordersThisMonth = monthOrders.length;

  // New users
  const newUsersToday = await User.countDocuments({
    createdAt: { $gte: today.startDate, $lte: today.endDate },
  });
  const newUsersThisWeek = await User.countDocuments({
    createdAt: { $gte: week.startDate, $lte: week.endDate },
  });
  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: month.startDate, $lte: month.endDate },
  });

  // Top 5 selling products
  const topProducts = await Order.aggregate([
    { $match: { paymentStatus: 'completed' } },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        orderCount: { $sum: 1 },
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        title: { $first: '$items.title' },
      },
    },
    { $sort: { orderCount: -1 } },
    { $limit: 5 },
    {
      $project: {
        id: '$_id',
        title: 1,
        orderCount: 1,
        revenue: 1,
      },
    },
  ]);

  // Recent orders
  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

  // Low stock alerts
  const lowStockAlerts = await Product.find({ stock: { $lt: 10, $gt: 0 } })
    .sort({ stock: 1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalUsers,
        totalOrders,
        totalRevenue,
        revenueToday,
        revenueThisWeek,
        revenueThisMonth,
        ordersToday,
        ordersThisWeek,
        ordersThisMonth,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
      },
      topProducts,
      recentOrders,
      lowStockAlerts,
    },
  });
});

// @desc    Get revenue analytics
// @route   GET /api/admin/analytics/revenue
// @access  Private/Admin
const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  const query = { paymentStatus: 'completed' };

  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  const orders = await Order.find(query).populate('items.product', 'category');

  // Daily revenue breakdown
  const dailyRevenue = groupByDate(orders, 'day');

  // Monthly revenue breakdown
  const monthlyRevenue = groupByDate(orders, 'month');

  // Revenue by category
  const revenueByCategory = {};
  orders.forEach((order) => {
    order.items.forEach((item) => {
      const category = item.product?.category || 'Unknown';
      if (!revenueByCategory[category]) {
        revenueByCategory[category] = 0;
      }
      revenueByCategory[category] += item.price * item.quantity;
    });
  });

  res.status(200).json({
    success: true,
    data: {
      dailyRevenue: Object.values(dailyRevenue).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      monthlyRevenue: Object.values(monthlyRevenue).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      revenueByCategory,
      totalRevenue: calculateRevenue(orders),
    },
  });
});

// @desc    Get order analytics
// @route   GET /api/admin/analytics/orders
// @access  Private/Admin
const getOrderAnalytics = asyncHandler(async (req, res) => {
  // Order status distribution
  const statusDistribution = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
      },
    },
  ]);

  // Orders over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ordersOverTime = await Order.find({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const groupedOrders = groupByDate(ordersOverTime, 'day');

  // Average order value
  const completedOrders = await Order.find({ paymentStatus: 'completed' });
  const averageOrderValue =
    completedOrders.length > 0
      ? calculateRevenue(completedOrders) / completedOrders.length
      : 0;

  // Order completion rate
  const totalOrders = await Order.countDocuments();
  const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
  const completionRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

  res.status(200).json({
    success: true,
    data: {
      statusDistribution,
      ordersOverTime: Object.values(groupedOrders).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      averageOrderValue,
      completionRate,
    },
  });
});

// @desc    Get user analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res) => {
  // User registration over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const users = await User.find({
    createdAt: { $gte: thirtyDaysAgo },
  });

  const registrationOverTime = {};
  users.forEach((user) => {
    const date = user.createdAt.toISOString().split('T')[0];
    registrationOverTime[date] = (registrationOverTime[date] || 0) + 1;
  });

  // Active users (ordered in last 30 days)
  const recentOrderUsers = await Order.distinct('user', {
    createdAt: { $gte: thirtyDaysAgo },
  });
  const activeUsers = recentOrderUsers.length;

  // User role distribution
  const roleDistribution = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      registrationOverTime: Object.entries(registrationOverTime)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
      activeUsers,
      roleDistribution,
      totalUsers: await User.countDocuments(),
    },
  });
});

module.exports = {
  // User management
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  banUser,
  // Order management
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  // Product management
  getProductStats,
  bulkUpdateProducts,
  bulkDeleteProducts,
  // Analytics
  getDashboard,
  getRevenueAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
};
