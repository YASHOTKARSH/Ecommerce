const Joi = require('joi');

// Add to cart validation
const addToCartSchema = Joi.object({
  productId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity must be at least 1',
    'any.required': 'Quantity is required',
  }),
});

// Update cart validation
const updateCartSchema = Joi.object({
  productId: Joi.string().required().regex(/^[0-9a-fA-F]{24}$/).messages({
    'string.empty': 'Product ID is required',
    'any.required': 'Product ID is required',
    'string.pattern.base': 'Invalid product ID format',
  }),
  quantity: Joi.number().integer().min(0).required().messages({
    'number.base': 'Quantity must be a number',
    'number.min': 'Quantity cannot be negative',
    'any.required': 'Quantity is required',
  }),
});

module.exports = {
  addToCartSchema,
  updateCartSchema,
};
