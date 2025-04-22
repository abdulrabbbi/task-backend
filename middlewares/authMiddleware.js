const passport = require('passport');
const { StatusCodes } = require('http-status-codes');
const ApiError = require('../utils/apiError');
const { roleRights } = require('../config/role');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || !user) {
    return reject(new ApiError(StatusCodes.UNAUTHORIZED, 'Please authenticate'));
  }

  req.user = user;

  if (requiredRights.length) {
    const userRights = roleRights.get(user.role);
    const hasRequiredRights = requiredRights.every((requiredRight) =>
      userRights.includes(requiredRight)
    );
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(StatusCodes.FORBIDDEN, 'Forbidden'));
    }
  }

  resolve();
};


const auth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;