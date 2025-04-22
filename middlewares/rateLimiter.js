const rateLimit = require('express-rate-limit');

// Rate limiting configuration for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  skipSuccessfulRequests: true // only count failed requests
});

// Rate limiting configuration for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

module.exports = {
  authLimiter,
  apiLimiter
};