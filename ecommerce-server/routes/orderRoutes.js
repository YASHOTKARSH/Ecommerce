const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { createOrderSchema, verifyPaymentSchema } = require('../validations/orderValidation');

// Create Razorpay order
router.post('/create-razorpay-order', protect, validate(createOrderSchema), createRazorpayOrder);

// Verify payment and create order
router.post('/verify-payment', protect, validate(verifyPaymentSchema), verifyPaymentAndCreateOrder);

// Get user's orders
router.get('/my-orders', protect, getMyOrders);

// Get order by ID
router.get('/:id', protect, getOrderById);

// Cancel order
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
