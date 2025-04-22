const { StatusCodes } = require('http-status-codes');
const ApiError = require("../utils/apiError");
const logger = require('../utils/logger');

const errorConverter = (err, req, res, next) => {
  let error = err;

  // Handle Joi validation errors (from express-validation)
  if (err.error && err.error.isJoi) {
    error = new ApiError(
      StatusCodes.BAD_REQUEST,
      `Validation error: ${err.error.details.map(x => x.message).join(', ')}`
    );
  }
  // Handle mongoose validation errors
  else if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(StatusCodes.BAD_REQUEST, message);
  }
  // Handle other errors without status code
  else if (!(error instanceof ApiError)) {
    const statusCode = 
      error.statusCode || 
      error.status || 
      StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || StatusCodes[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};


const errorHandler = (err, req, res, next) => {
  console.error('🔥 Final error in handler:', err);
  console.log('💡 Final statusCode used in res.status:', err.statusCode);

  let statusCode = Number.isInteger(err.statusCode) ? err.statusCode : StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};




module.exports = {
  errorConverter,
  errorHandler
};