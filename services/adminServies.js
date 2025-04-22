const { StatusCodes } = require('http-status-codes');
const { Admin } = require('../models');
const ApiError = require('../utils/apiError');
const validator = require('validator');

const createAdmin = async (adminBody) => {
  if (!validator.isEmail(adminBody.email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format');
  }

  if (adminBody.password.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters');
  }

  const emailTaken = await Admin.isEmailTaken(adminBody.email);
  if (emailTaken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
  }

  return Admin.create(adminBody);
};

const getAdminByEmail = async (email) => {
  return Admin.findOne({ email });
};

module.exports = {
  createAdmin,
  getAdminByEmail,
};
