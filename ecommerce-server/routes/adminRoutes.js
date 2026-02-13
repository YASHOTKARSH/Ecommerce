const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const validate = require('../middleware/validation');
const {
  updateUserRoleSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  bulkUpdateProductsSchema,
  bulkDeleteProductsSchema,
} = require('../validations/adminValidation');
const {
  // User management
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  banUser,
  // Order management
  getOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  // Product management
  getProductStats,
  bulkUpdateProducts,
  bulkDeleteProducts,
  // Analytics
  getDashboard,
  getRevenueAnalytics,
  getOrderAnalytics,
  getUserAnalytics,
} = require('../controllers/adminController');

// Apply auth and admin role to all routes
router.use(auth);
router.use(roleAuth('admin'));

// ==================== USER MANAGEMENT ROUTES ====================
router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', validate(updateUserRoleSchema), updateUserRole);
router.put('/users/:id/ban', banUser);
router.delete('/users/:id', deleteUser);

// ==================== ORDER MANAGEMENT ROUTES ====================
router.get('/orders', getOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', validate(updateOrderStatusSchema), updateOrderStatus);
router.put('/orders/:id/payment-status', validate(updatePaymentStatusSchema), updatePaymentStatus);

// ==================== PRODUCT MANAGEMENT ROUTES ====================
router.get('/products/stats', getProductStats);
router.put('/products/bulk-update', validate(bulkUpdateProductsSchema), bulkUpdateProducts);
router.delete('/products/bulk-delete', validate(bulkDeleteProductsSchema), bulkDeleteProducts);

// ==================== ANALYTICS ROUTES ====================
router.get('/dashboard', getDashboard);
router.get('/analytics/revenue', getRevenueAnalytics);
router.get('/analytics/orders', getOrderAnalytics);
router.get('/analytics/users', getUserAnalytics);

module.exports = router;
