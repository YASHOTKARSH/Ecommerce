const Joi = require('joi');

// Product creation validation
const createProductSchema = Joi.object({
  title: Joi.string().required().trim().messages({
    'string.empty': 'Product title is required',
    'any.required': 'Product title is required',
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Product description is required',
    'any.required': 'Product description is required',
  }),
  price: Joi.number().required().min(0).messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price cannot be negative',
    'any.required': 'Product price is required',
  }),
  discount: Joi.number().min(0).max(100).default(0).messages({
    'number.min': 'Discount cannot be negative',
    'number.max': 'Discount cannot exceed 100%',
  }),
  stock: Joi.number().required().min(0).messages({
    'number.base': 'Stock must be a number',
    'number.min': 'Stock cannot be negative',
    'any.required': 'Stock quantity is required',
  }),
  category: Joi.string()
    .required()
    .valid('Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Other')
    .messages({
      'any.required': 'Product category is required',
      'any.only': 'Category must be one of: Electronics, Fashion, Home, Books, Sports, Other',
    }),
  images: Joi.array().items(Joi.string().uri()).default([]),
});

// Product update validation
const updateProductSchema = Joi.object({
  title: Joi.string().trim(),
  description: Joi.string(),
  price: Joi.number().min(0).messages({
    'number.min': 'Price cannot be negative',
  }),
  discount: Joi.number().min(0).max(100).messages({
    'number.min': 'Discount cannot be negative',
    'number.max': 'Discount cannot exceed 100%',
  }),
  stock: Joi.number().min(0).messages({
    'number.min': 'Stock cannot be negative',
  }),
  category: Joi.string().valid('Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Other').messages({
    'any.only': 'Category must be one of: Electronics, Fashion, Home, Books, Sports, Other',
  }),
  images: Joi.array().items(Joi.string().uri()),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

// Search and filter validation
const searchProductSchema = Joi.object({
  search: Joi.string().allow(''),
  category: Joi.string().valid('Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Other'),
  minPrice: Joi.number().min(0),
  maxPrice: Joi.number().min(0),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10),
  sort: Joi.string().valid('price', '-price', 'createdAt', '-createdAt', 'ratings', '-ratings').default('-createdAt'),
}).custom((value, helpers) => {
  if (value.minPrice && value.maxPrice && value.minPrice > value.maxPrice) {
    return helpers.message('minPrice cannot be greater than maxPrice');
  }
  return value;
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  searchProductSchema,
};
