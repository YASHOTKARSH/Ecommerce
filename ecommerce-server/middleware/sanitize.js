const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Sanitize data to prevent NoSQL injection
const sanitizeData = (req, res, next) => {
  // Remove any keys that start with '$' or contain '.'
  req.body = mongoSanitize.sanitize(req.body);
  req.query = mongoSanitize.sanitize(req.query);
  req.params = mongoSanitize.sanitize(req.params);
  
  next();
};

module.exports = {
  mongoSanitize: mongoSanitize(),
  xssClean: xss(),
  sanitizeData,
};
