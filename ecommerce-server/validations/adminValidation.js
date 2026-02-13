const Joi = require('joi');

// User role update validation
const updateUserRoleSchema = Joi.object({
  role: Joi.string()
    .valid('customer', 'admin')
    .required()
    .messages({
      'any.required': 'Role is required',
      'any.only': 'Role must be either customer or admin',
    }),
});

// Order status update validation
const updateOrderStatusSchema = Joi.object({
  orderStatus: Joi.string()
    .valid('processing', 'confirmed', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.required': 'Order status is required',
      'any.only': 'Invalid order status',
    }),
});

// Payment status update validation
const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string()
    .valid('pending', 'completed', 'failed', 'refunded')
    .required()
    .messages({
      'any.required': 'Payment status is required',
      'any.only': 'Invalid payment status',
    }),
});

// Bulk product update validation
const bulkUpdateProductsSchema = Joi.object({
  updates: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required().messages({
          'any.required': 'Product ID is required for each update',
        }),
        updates: Joi.object({
          title: Joi.string().trim(),
          description: Joi.string(),
          price: Joi.number().min(0),
          discount: Joi.number().min(0).max(100),
          stock: Joi.number().min(0),
          category: Joi.string().valid('Electronics', 'Fashion', 'Home', 'Books', 'Sports', 'Other'),
        })
          .min(1)
          .required()
          .messages({
            'object.min': 'At least one update field is required',
          }),
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product update is required',
      'any.required': 'Updates array is required',
    }),
});

// Bulk product delete validation
const bulkDeleteProductsSchema = Joi.object({
  ids: Joi.array()
    .items(Joi.string().required())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product ID is required',
      'any.required': 'Product IDs array is required',
    }),
});

// Date range validation for analytics
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
}).custom((value, helpers) => {
  if (value.startDate && value.endDate && value.startDate > value.endDate) {
    return helpers.message('Start date cannot be after end date');
  }
  return value;
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

module.exports = {
  updateUserRoleSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  bulkUpdateProductsSchema,
  bulkDeleteProductsSchema,
  dateRangeSchema,
  paginationSchema,
};
