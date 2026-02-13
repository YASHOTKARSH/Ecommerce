const ApiError = require('../utils/ApiError');

// Validate content-type for JSON requests
const validateContentType = (req, res, next) => {
  // Skip validation for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip if no body
  if (!req.body || Object.keys(req.body).length === 0) {
    return next();
  }

  // Check content-type header
  const contentType = req.get('content-type');
  
  if (!contentType) {
    throw new ApiError(400, 'Content-Type header is required');
  }

  // Allow application/json and multipart/form-data (for file uploads)
  if (!contentType.includes('application/json') && 
      !contentType.includes('multipart/form-data') &&
      !contentType.includes('application/x-www-form-urlencoded')) {
    throw new ApiError(415, 'Unsupported Media Type. Use application/json or multipart/form-data');
  }

  next();
};

// Validate JSON payload
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    throw new ApiError(400, 'Invalid JSON payload');
  }
  next();
};

// Validate file uploads
const validateFileUpload = (options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxCount = 5,
  } = options;

  return (req, res, next) => {
    // Skip if no files
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const files = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();

    // Check file count
    if (files.length > maxCount) {
      throw new ApiError(400, `Too many files. Maximum ${maxCount} files allowed`);
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        throw new ApiError(400, `File ${file.name} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`);
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        throw new ApiError(400, `File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
    }

    next();
  };
};

// Reject suspicious requests
const rejectSuspiciousRequests = (req, res, next) => {
  const userAgent = req.get('user-agent');
  
  // Block requests without user agent (optional, can be too strict)
  // if (!userAgent) {
  //   throw new ApiError(403, 'Forbidden - No User-Agent header');
  // }

  // Block common malicious patterns
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /<script>/i,
    /javascript:/i,
  ];

  const url = req.originalUrl || req.url;
  const body = JSON.stringify(req.body);
  const query = JSON.stringify(req.query);

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(url) || pattern.test(body) || pattern.test(query) || (userAgent && pattern.test(userAgent))) {
      throw new ApiError(403, 'Forbidden - Suspicious request detected');
    }
  }

  next();
};

module.exports = {
  validateContentType,
  validateJSON,
  validateFileUpload,
  rejectSuspiciousRequests,
};
