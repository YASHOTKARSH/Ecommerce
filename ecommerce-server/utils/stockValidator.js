const Product = require('../models/Product');
const ApiError = require('./ApiError');

/**
 * Check if a product has sufficient stock
 * @param {String} productId - Product ID
 * @param {Number} quantity - Requested quantity
 * @returns {Promise<Product>} - Product if stock is available
 * @throws {ApiError} - If product not found or insufficient stock
 */
const checkStockAvailability = async (productId, quantity) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  if (product.stock < quantity) {
    throw new ApiError(400, `Insufficient stock. Only ${product.stock} items available`);
  }

  return product;
};

/**
 * Validate stock for all items in a cart
 * @param {Array} cartItems - Array of cart items with productId and quantity
 * @returns {Promise<Boolean>} - True if all items have sufficient stock
 * @throws {ApiError} - If any item has insufficient stock
 */
const validateCartStock = async (cartItems) => {
  const validationPromises = cartItems.map(async (item) => {
    const product = await Product.findById(item.productId);

    if (!product) {
      throw new ApiError(404, `Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${product.title}. Only ${product.stock} items available`
      );
    }

    return true;
  });

  await Promise.all(validationPromises);
  return true;
};

/**
 * NOTE: Stock reduction happens in Order module after payment confirmation
 * This utility only validates stock availability, does not reduce it
 */

module.exports = {
  checkStockAvailability,
  validateCartStock,
};
