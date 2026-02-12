// CSRF protection middleware for cookie-based authentication
// Verifies that requests with cookies come from trusted origins
const csrfProtection = (req, res, next) => {
  // Skip CSRF check for GET, HEAD, OPTIONS requests (safe methods)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip if no cookies present (JWT in header only)
  if (!req.cookies || Object.keys(req.cookies).length === 0) {
    return next();
  }

  // Verify origin or referer header
  const origin = req.headers.origin || req.headers.referer;
  
  if (!origin) {
    // In production, reject requests without origin/referer
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden - Invalid request origin',
      });
    }
    // In development, allow for testing tools like Postman
    return next();
  }

  // Check if origin is allowed (matches CLIENT_URL or same origin)
  const allowedOrigins = [
    process.env.CLIENT_URL,
    `http://localhost:${process.env.PORT || 5000}`,
    'http://localhost:3000',
  ].filter(Boolean);

  const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden - Invalid request origin',
    });
  }

  next();
};

module.exports = csrfProtection;
