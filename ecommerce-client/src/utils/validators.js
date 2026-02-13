import * as yup from 'yup';
import { PASSWORD_MIN_LENGTH } from './constants';

export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .required('Password is required'),
});

export const registerSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  password: yup
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

export const addressSchema = yup.object().shape({
  fullName: yup
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .required('Full name is required'),
  phone: yup
    .string()
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, 'Invalid phone number')
    .required('Phone number is required'),
  addressLine1: yup
    .string()
    .min(5, 'Address must be at least 5 characters')
    .required('Address line 1 is required'),
  addressLine2: yup.string(),
  city: yup
    .string()
    .min(2, 'City must be at least 2 characters')
    .required('City is required'),
  state: yup
    .string()
    .min(2, 'State must be at least 2 characters')
    .required('State is required'),
  postalCode: yup
    .string()
    .matches(/^[0-9]{5}(-[0-9]{4})?$/, 'Invalid postal code')
    .required('Postal code is required'),
  country: yup
    .string()
    .min(2, 'Country must be at least 2 characters')
    .required('Country is required'),
});

export const productSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Product name must be at least 3 characters')
    .max(100, 'Product name must not exceed 100 characters')
    .required('Product name is required'),
  description: yup
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must not exceed 1000 characters')
    .required('Description is required'),
  price: yup
    .number()
    .positive('Price must be a positive number')
    .min(0.01, 'Price must be at least $0.01')
    .required('Price is required'),
  category: yup
    .string()
    .required('Category is required'),
  stock: yup
    .number()
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .required('Stock is required'),
  images: yup
    .array()
    .of(yup.string().url('Invalid image URL'))
    .min(1, 'At least one image is required'),
  brand: yup.string(),
  sku: yup.string(),
});

export const reviewSchema = yup.object().shape({
  rating: yup
    .number()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must not exceed 5')
    .required('Rating is required'),
  comment: yup
    .string()
    .min(10, 'Review must be at least 10 characters')
    .max(500, 'Review must not exceed 500 characters')
    .required('Review is required'),
});

export const contactSchema = yup.object().shape({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .required('Name is required'),
  email: yup
    .string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: yup
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .required('Subject is required'),
  message: yup
    .string()
    .min(20, 'Message must be at least 20 characters')
    .max(1000, 'Message must not exceed 1000 characters')
    .required('Message is required'),
});

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup
    .string()
    .required('Current password is required'),
  newPassword: yup
    .string()
    .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .notOneOf([yup.ref('currentPassword')], 'New password must be different from current password')
    .required('New password is required'),
  confirmNewPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Confirm new password is required'),
});
