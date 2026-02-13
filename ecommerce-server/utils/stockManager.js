const mongoose = require('mongoose');
const Product = require('../models/Product');
const ApiError = require('./ApiError');

/**
 * Reduce stock for multiple items using MongoDB transactions
 * @param {Array} items - Array of {productId, quantity}
 * @param {Object} session - MongoDB session for transaction
 */
const reduceStock = async (items, session) => {
  for (const item of items) {
    const product = await Product.findById(item.productId).session(session);
    
    if (!product) {
      throw new ApiError(404, `Product ${item.productId} not found`);
    }
    
    if (product.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${product.name}. Available: ${product.stock}, Required: ${item.quantity}`);
    }
    
    product.stock -= item.quantity;
    await product.save({ session });
  }
};

/**
 * Restore stock for multiple items
 * @param {Array} items - Array of {productId, quantity}
 */
const restoreStock = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (product) {
        product.stock += item.quantity;
        await product.save({ session });
      }
    }
    
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

module.exports = {
  reduceStock,
  restoreStock,
};
