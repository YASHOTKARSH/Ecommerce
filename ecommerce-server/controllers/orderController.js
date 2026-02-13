const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reduceStock, restoreStock } = require('../utils/stockManager');

// @desc    Create Razorpay order (without reducing stock)
// @route   POST /api/orders/create-razorpay-order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { shippingAddress } = req.body;

  // Validate shipping address
  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
      !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
    throw new ApiError(400, 'Complete shipping address is required');
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Validate stock availability for all items
  for (const item of cart.items) {
    if (!item.productId) {
      throw new ApiError(400, 'Invalid product in cart');
    }

    const product = item.productId;
    
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }
  }

  // Calculate total amount
  const totalAmount = await cart.calculateTotal();

  // Create Razorpay order
  const options = {
    amount: Math.round(totalAmount * 100), // Convert rupees to paise (smallest currency unit for INR)
    currency: 'INR',
    receipt: `order_${userId}_${Date.now()}`,
  };

  const razorpayOrder = await razorpay.orders.create(options);

  res.status(200).json({
    success: true,
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    key: process.env.RAZORPAY_KEY_ID,
  });
});

// @desc    Verify payment and create order (with stock reduction)
// @route   POST /api/orders/verify-payment
// @access  Private
const verifyPaymentAndCreateOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Payment details are required');
  }

  if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || 
      !shippingAddress.state || !shippingAddress.zipCode || !shippingAddress.country) {
    throw new ApiError(400, 'Complete shipping address is required');
  }

  // CRITICAL: Verify Razorpay signature
  const generated_signature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generated_signature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed. Invalid signature.');
  }

  // Get user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');
  
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Prepare order items with price information
  const orderItems = cart.items.map(item => {
    const product = item.productId;
    const price = product.price;
    const discount = product.discount || 0;
    const finalPrice = product.finalPrice;

    return {
      productId: product._id,
      quantity: item.quantity,
      price: price,
      discount: discount,
      finalPrice: finalPrice,
    };
  });

  // Calculate total amount
  const totalAmount = await cart.calculateTotal();

  // Reduce stock atomically using transactions
  try {
    await reduceStock(orderItems.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })));
  } catch (error) {
    throw new ApiError(400, error.message || 'Failed to reduce stock');
  }

  // Create order
  const order = await Order.create({
    userId,
    items: orderItems,
    totalAmount,
    shippingAddress,
    paymentStatus: 'completed',
    orderStatus: 'processing',
    razorpayOrderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  // Clear cart after successful order creation
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    order,
  });
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ userId })
    .populate('items.productId', 'title images price')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Order.countDocuments({ userId });

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const order = await Order.findById(orderId).populate('items.productId', 'title images price discount');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if user owns this order (or is admin)
  if (order.userId.toString() !== userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this order');
  }

  res.status(200).json({
    success: true,
    order,
  });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res, next) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if user owns this order
  if (order.userId.toString() !== userId && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order');
  }

  // Check if order can be cancelled
  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Order is already cancelled');
  }

  if (order.orderStatus === 'delivered') {
    throw new ApiError(400, 'Delivered orders cannot be cancelled');
  }

  // Restore stock
  let stockRestoreWarning = null;
  try {
    await restoreStock(order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    })));
  } catch (error) {
    console.error('Error restoring stock:', error);
    stockRestoreWarning = `Order cancelled successfully, but stock restoration encountered an error. Please contact support with order ID ${orderId} to verify inventory.`;
  }

  // Update order status
  order.orderStatus = 'cancelled';
  await order.save();

  const response = {
    success: true,
    message: 'Order cancelled successfully',
    order,
  };

  if (stockRestoreWarning) {
    response.warning = stockRestoreWarning;
  }

  res.status(200).json(response);
});

module.exports = {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
