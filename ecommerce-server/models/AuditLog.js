const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: {
    type: String,
    required: true,
    enum: [
      'user.register',
      'user.login',
      'user.logout',
      'user.password_change',
      'user.password_reset',
      'user.role_update',
      'user.delete',
      'order.create',
      'order.update',
      'order.cancel',
      'order.refund',
      'payment.success',
      'payment.failed',
      'product.create',
      'product.update',
      'product.delete',
      'admin.action',
    ],
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'order', 'payment', 'product', 'admin'],
  },
  resourceId: {
    type: String,
    default: null,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    default: '',
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
