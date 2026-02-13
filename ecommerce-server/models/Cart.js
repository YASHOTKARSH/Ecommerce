const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required'],
      },
      quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to update updatedAt
cartSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to calculate total price
cartSchema.methods.calculateTotal = async function () {
  await this.populate('items.productId');
  
  let total = 0;
  for (const item of this.items) {
    if (item.productId) {
      const product = item.productId;
      // Use the virtual finalPrice field from Product model
      const finalPrice = product.finalPrice;
      total += finalPrice * item.quantity;
    }
  }
  
  return total;
};

module.exports = mongoose.model('Cart', cartSchema);
