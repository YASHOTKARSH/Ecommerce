const express = require('express');
const router = express.Router();
const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  clearCart,
} = require('../controllers/cartController');
const auth = require('../middleware/auth');
const validate = require('../middleware/validation');
const {
  addToCartSchema,
  updateCartSchema,
} = require('../validations/cartValidation');

// All cart routes require authentication
router.use(auth);

// Get user's cart
router.get('/', getCart);

// Add item to cart
router.post('/', validate(addToCartSchema), addToCart);

// Update cart item quantity
router.put('/', validate(updateCartSchema), updateCartItem);

// Remove item from cart
router.delete('/:productId', removeFromCart);

// Clear entire cart
router.delete('/', clearCart);

module.exports = router;
