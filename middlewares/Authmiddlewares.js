const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require('http-status-codes');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Authentication required");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        throw new ApiError(StatusCodes.FORBIDDEN, "Forbidden");
      }

      req.user = decoded;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = authMiddleware;
