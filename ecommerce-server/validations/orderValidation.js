const Joi = require('joi');

const shippingAddressSchema = Joi.object({
  street: Joi.string().required().messages({
    'string.empty': 'Street address is required',
    'any.required': 'Street address is required',
  }),
  city: Joi.string().required().messages({
    'string.empty': 'City is required',
    'any.required': 'City is required',
  }),
  state: Joi.string().required().messages({
    'string.empty': 'State is required',
    'any.required': 'State is required',
  }),
  zipCode: Joi.string().required().messages({
    'string.empty': 'Zip code is required',
    'any.required': 'Zip code is required',
  }),
  country: Joi.string().required().messages({
    'string.empty': 'Country is required',
    'any.required': 'Country is required',
  }),
  phone: Joi.string().required().messages({
    'string.empty': 'Phone number is required',
    'any.required': 'Phone number is required',
  }),
});

const verifyPaymentSchema = Joi.object({
  razorpay_order_id: Joi.string().required().messages({
    'string.empty': 'Razorpay order ID is required',
    'any.required': 'Razorpay order ID is required',
  }),
  razorpay_payment_id: Joi.string().required().messages({
    'string.empty': 'Razorpay payment ID is required',
    'any.required': 'Razorpay payment ID is required',
  }),
  razorpay_signature: Joi.string().required().messages({
    'string.empty': 'Razorpay signature is required',
    'any.required': 'Razorpay signature is required',
  }),
  shippingAddress: shippingAddressSchema.required().messages({
    'any.required': 'Shipping address is required',
  }),
});

const cancelOrderSchema = Joi.object({
  reason: Joi.string().optional(),
});

module.exports = {
  shippingAddressSchema,
  verifyPaymentSchema,
  cancelOrderSchema,
};
