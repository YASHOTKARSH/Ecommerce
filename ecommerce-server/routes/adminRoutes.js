const express = require('express');
const { getAuditLogs, getAuditStats } = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// All routes require authentication and admin role
router.use(auth, roleAuth('admin'));

// Audit logs routes
router.get('/audit-logs', getAuditLogs);
router.get('/audit-logs/stats', getAuditStats);

module.exports = router;
