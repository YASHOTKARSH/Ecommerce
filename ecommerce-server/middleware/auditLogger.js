const AuditLog = require('../models/AuditLog');

// Helper to get IP address
const getIpAddress = (req) => {
  return req.ip || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.headers['x-real-ip'] || 
         req.connection.remoteAddress || 
         'unknown';
};

// Create audit log entry
const createAuditLog = async (data) => {
  try {
    await AuditLog.create(data);
  } catch (error) {
    // Log the error but don't throw - audit logging shouldn't break the app
    console.error('Audit log error:', error);
  }
};

// Audit logger middleware
const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = function (data) {
      // Log only if response is successful
      if (data.success) {
        const auditData = {
          userId: req.user?.id || req.user?._id || null,
          action,
          resource,
          resourceId: data.id || data._id || req.params.id || null,
          ipAddress: getIpAddress(req),
          userAgent: req.get('user-agent') || '',
          details: {
            method: req.method,
            path: req.originalUrl || req.url,
          },
          status: 'success',
        };
        
        createAuditLog(auditData);
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

// Manual audit log (for use in controllers)
const logAudit = async (req, action, resource, resourceId = null, details = {}, status = 'success') => {
  const auditData = {
    userId: req.user?.id || req.user?._id || null,
    action,
    resource,
    resourceId,
    ipAddress: getIpAddress(req),
    userAgent: req.get('user-agent') || '',
    details,
    status,
  };
  
  await createAuditLog(auditData);
};

module.exports = {
  auditLogger,
  logAudit,
  getIpAddress,
};
