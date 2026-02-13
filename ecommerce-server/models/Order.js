const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    default: 0,
  },
  finalPrice: {
    type: Number,
    required: true,
  },
});

const shippingAddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: [true, 'Street address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
  },
  state: {
    type: String,
    required: [true, 'State is required'],
  },
  zipCode: {
    type: String,
    required: [true, 'Zip code is required'],
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
  },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
  shippingAddress: {
    type: shippingAddressSchema,
    required: true,
  },
  paymentId: {
    type: String,
  },
  razorpayOrderId: {
    type: String,
  },
  razorpaySignature: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
