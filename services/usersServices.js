const { StatusCodes } = require('http-status-codes');
const { RegularUser, Manager } = require('../models');
const ApiError = require('../utils/apiError');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const mongoose = require("mongoose");


const createRegularUser = async (userBody) => {
  const RegularUser = mongoose.model('RegularUser');
  const Manager = mongoose.model('Manager');

  // Validate input
  if (!validator.isEmail(userBody.email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format');
  }

  if (userBody.password && userBody.password.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters');
  }

  if (await RegularUser.isEmailTaken(userBody.email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
  }

  // Verify manager exists if provided
  if (userBody.manager) {
    const managerExists = await Manager.exists({ _id: userBody.manager });
    if (!managerExists) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Manager not found');
    }
  }

  // Hash password
  if (userBody.password) {
    userBody.password = await bcrypt.hash(userBody.password, 8);
  }

  // Create user
  const user = await RegularUser.create(userBody);

  return user;
};

const createManager = async (managerBody) => {
    try {
        if (!validator.isEmail(managerBody.email)) {
          throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format');
        }
  if (!validator.isEmail(managerBody.email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid email format');
  }

  if (managerBody.password && managerBody.password.length < 8) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Password must be at least 8 characters');
  }

  if (await Manager.isEmailTaken(managerBody.email)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
  }

  if (managerBody.password) {
    managerBody.password = await bcrypt.hash(managerBody.password, 10);
  }

  return Manager.create(managerBody);
} catch (error) {
    console.error('Error in createManager:', error);
    throw error; // Re-throw for controller to handle
  }
};

const getUserById = async (userId) => {
  return RegularUser.findById(userId);
};

const getManagerById = async (managerId) => {
  return Manager.findById(managerId);
};

const queryUsers = async (filter, options) => {
  return RegularUser.paginate(filter, options);
};

const queryManagers = async (filter, options) => {
  return Manager.paginate(filter, options);
};

const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (updateBody.email && (await RegularUser.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already taken');
  }

  if (updateBody.password) {
    updateBody.password = await bcrypt.hash(updateBody.password, 10);
  }

  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const deleteUserById = async (userId) => {
  const user = await RegularUser.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }
  return "deleted succesfully";
};

const assignManagerToUser = async (userId, managerId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const manager = await getManagerById(managerId);
  if (!manager) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Manager not found');
  }

  user.manager = managerId;
  await user.save();
  return user;
};

module.exports = {
  createRegularUser,
  createManager,
  getUserById,
  queryUsers,
  queryManagers,
  updateUserById,
  deleteUserById,
  assignManagerToUser
};