const Cart = require('../models/Cart');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { checkStockAvailability } = require('../utils/stockValidator');

/**
 * @desc    Add item to cart
 * @route   POST /api/cart
 * @access  Private
 */
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Check if product exists and has sufficient stock
  await checkStockAvailability(productId, quantity);

  // Find or create user's cart
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    // Create new cart
    cart = await Cart.create({
      userId,
      items: [{ productId, quantity }],
    });
  } else {
    // Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      await checkStockAvailability(productId, newQuantity);
      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      cart.items.push({ productId, quantity });
    }

    await cart.save();
  }

  // Populate product details
  await cart.populate('items.productId');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart
 * @access  Private
 */
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    (item) => item.productId.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, 'Item not found in cart');
  }

  // If quantity is 0, remove item
  if (quantity === 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    // Check stock availability
    await checkStockAvailability(productId, quantity);
    cart.items[itemIndex].quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.productId');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/:productId
 * @access  Private
 */
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Remove item from cart
  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();
  await cart.populate('items.productId');

  res.status(200).json({
    success: true,
    data: cart,
  });
});

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
const getCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find user's cart
  let cart = await Cart.findOne({ userId }).populate({
    path: 'items.productId',
    select: 'title price discount images stock',
  });

  if (!cart) {
    // Return empty cart if not found
    cart = {
      userId,
      items: [],
      total: 0,
    };
    
    return res.status(200).json({
      success: true,
      data: cart,
    });
  }

  // Calculate total price
  const total = await cart.calculateTotal();

  res.status(200).json({
    success: true,
    data: {
      ...cart.toObject(),
      total,
    },
  });
});

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart
 * @access  Private
 */
const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Find user's cart
  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Clear all items
  cart.items = [];
  await cart.save();

  res.status(200).json({
    success: true,
    data: cart,
  });
});

module.exports = {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  clearCart,
};
