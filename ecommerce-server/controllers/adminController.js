const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  // Build filter
  const filter = {};
  if (req.query.userId) filter.userId = req.query.userId;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.resource) filter.resource = req.query.resource;
  if (req.query.status) filter.status = req.query.status;

  // Date range filter
  if (req.query.startDate || req.query.endDate) {
    filter.timestamp = {};
    if (req.query.startDate) {
      filter.timestamp.$gte = new Date(req.query.startDate);
    }
    if (req.query.endDate) {
      filter.timestamp.$lte = new Date(req.query.endDate);
    }
  }

  const auditLogs = await AuditLog.find(filter)
    .populate('userId', 'name email')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AuditLog.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: auditLogs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-logs/stats
// @access  Private/Admin
const getAuditStats = asyncHandler(async (req, res, next) => {
  const stats = await AuditLog.aggregate([
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  const statusStats = await AuditLog.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      byAction: stats,
      byStatus: statusStats,
    },
  });
});

module.exports = {
  getAuditLogs,
  getAuditStats,
};
