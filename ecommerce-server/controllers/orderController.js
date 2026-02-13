const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const razorpay = require('../config/razorpay');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { reduceStock, restoreStock } = require('../utils/stockManager');

/**
 * Create Razorpay Order
 * POST /api/orders/create-razorpay-order
 * @access Private
 */
const createRazorpayOrder = asyncHandler(async (req, res) => {
  if (!razorpay) {
    throw new ApiError(500, 'Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables');
  }

  const userId = req.user.id;

  // Get user's cart
  const cart = await Cart.findOne({ userId }).populate('items.productId');

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  // Validate all products exist and have sufficient stock
  let totalAmount = 0;
  for (const item of cart.items) {
    const product = item.productId;
    
    if (!product) {
      throw new ApiError(404, 'Product not found in cart');
    }

    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
    }

    // Calculate price after discount
    const priceAfterDiscount = product.price * (1 - product.discount / 100);
    totalAmount += priceAfterDiscount * item.quantity;
  }

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(totalAmount * 100), // Convert to paise
    currency: 'INR',
    receipt: `receipt_${userId}_${Date.now()}`,
  });

  res.status(200).json({
    success: true,
    order: {
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    },
  });
});

/**
 * Verify Payment & Create Order
 * POST /api/orders/verify-payment
 * @access Private
 */
const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, shippingAddress } = req.body;
  const userId = req.user.id;

  // Verify Razorpay signature
  const text = razorpay_order_id + '|' + razorpay_payment_id;
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(text)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, 'Payment verification failed');
  }

  // Start MongoDB session for transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get user's cart with populated products
    const cart = await Cart.findOne({ userId }).populate('items.productId').session(session);

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Cart is empty');
    }

    // Validate stock availability and prepare order items
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.productId;

      if (!product) {
        throw new ApiError(404, 'Product not found');
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
      }

      const priceAfterDiscount = product.price * (1 - product.discount / 100);
      const itemTotal = priceAfterDiscount * item.quantity;

      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        discount: product.discount,
        finalPrice: itemTotal,
      });

      totalAmount += itemTotal;
    }

    // Reduce stock for all items
    await reduceStock(
      cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
      })),
      session
    );

    // Create order
    const order = await Order.create([{
      userId,
      items: orderItems,
      totalAmount,
      paymentStatus: 'completed',
      orderStatus: 'confirmed',
      shippingAddress,
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      razorpaySignature: razorpay_signature,
    }], { session });

    // Clear cart
    cart.items = [];
    await cart.save({ session });

    // Commit transaction
    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: order[0],
    });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

/**
 * Get User Orders
 * GET /api/orders/my-orders
 * @access Private
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const orders = await Order.find({ userId })
    .populate('items.productId')
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
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get Order by ID
 * GET /api/orders/:id
 * @access Private
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.productId');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if order belongs to user or user is admin
  if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to access this order');
  }

  res.status(200).json({
    success: true,
    order,
  });
});

/**
 * Cancel Order
 * PUT /api/orders/:id/cancel
 * @access Private
 */
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Check if order belongs to user
  if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized to cancel this order');
  }

  // Check if order can be cancelled
  if (!['processing', 'confirmed'].includes(order.orderStatus)) {
    throw new ApiError(400, `Order cannot be cancelled. Current status: ${order.orderStatus}`);
  }

  // Restore stock
  await restoreStock(
    order.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
    }))
  );

  // Update order status
  order.orderStatus = 'cancelled';
  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    order,
  });
});

module.exports = {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
