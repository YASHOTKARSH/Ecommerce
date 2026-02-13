const mongoose = require('mongoose');
const Product = require('../models/Product');
const ApiError = require('./ApiError');

/**
 * Reduce stock for multiple products atomically using MongoDB transactions
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Promise<void>}
 */
const reduceStock = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        throw new ApiError(404, `Product ${item.productId} not found`);
      }

      if (product.stock < item.quantity) {
        throw new ApiError(400, `Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${item.quantity}`);
      }

      // Reduce stock atomically
      const result = await Product.findOneAndUpdate(
        { 
          _id: item.productId, 
          stock: { $gte: item.quantity } 
        },
        { 
          $inc: { stock: -item.quantity } 
        },
        { 
          session,
          new: true 
        }
      );

      if (!result) {
        throw new ApiError(400, `Failed to reduce stock for ${product.title}. Stock might have changed.`);
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

/**
 * Restore stock for multiple products (used when cancelling orders)
 * @param {Array} items - Array of {productId, quantity}
 * @returns {Promise<void>}
 */
const restoreStock = async (items) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      
      if (!product) {
        // If product doesn't exist, log but don't fail the transaction
        // TODO: Integrate with proper logging/monitoring service in production
        console.warn(`[STOCK WARNING] Product ${item.productId} not found during stock restoration`);
        continue;
      }

      // Restore stock atomically
      await Product.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: item.quantity } 
        },
        { 
          session,
          new: true 
        }
      );
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
