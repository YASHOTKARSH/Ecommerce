const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  verifyPaymentSchema,
  cancelOrderSchema,
} = require('../validations/orderValidation');
const {
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');

// Create Razorpay order
router.post('/create-razorpay-order', auth, createRazorpayOrder);

// Verify payment and create order
router.post('/verify-payment', auth, validate(verifyPaymentSchema), verifyPayment);

// Get user orders
router.get('/my-orders', auth, getMyOrders);

// Get order by ID
router.get('/:id', auth, getOrderById);

// Cancel order
router.put('/:id/cancel', auth, validate(cancelOrderSchema), cancelOrder);

module.exports = router;
