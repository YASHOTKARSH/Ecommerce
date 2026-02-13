export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
  },
  PRODUCTS: {
    BASE: '/products',
    SEARCH: '/products/search',
    BY_ID: (id) => `/products/${id}`,
    BY_CATEGORY: (category) => `/products/category/${category}`,
  },
  CART: {
    BASE: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear',
  },
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id) => `/orders/${id}`,
    MY_ORDERS: '/orders/my-orders',
  },
  CATEGORIES: {
    BASE: '/categories',
  },
};

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SELLER: 'seller',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  CASH_ON_DELIVERY: 'cash_on_delivery',
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Toys & Games',
  'Health & Beauty',
  'Automotive',
  'Food & Grocery',
  'Jewelry',
  'Computers',
  'Mobile Phones',
  'Shoes',
  'Furniture',
  'Office Supplies',
];

export const ITEMS_PER_PAGE = 12;

export const TOAST_DURATION = 3000;

export const PASSWORD_MIN_LENGTH = 8;

export const CURRENCY_SYMBOL = '$';
