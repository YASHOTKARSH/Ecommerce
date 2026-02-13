const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPaymentAndCreateOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const { createOrderSchema, verifyPaymentSchema } = require('../validations/orderValidation');

// Create Razorpay order
router.post('/create-razorpay-order', auth, validate(createOrderSchema), createRazorpayOrder);

// Verify payment and create order
router.post('/verify-payment', auth, validate(verifyPaymentSchema), verifyPaymentAndCreateOrder);

// Get user's orders
router.get('/my-orders', auth, getMyOrders);

// Get order by ID
router.get('/:id', auth, getOrderById);

// Cancel order
router.put('/:id/cancel', auth, cancelOrder);

module.exports = router;
