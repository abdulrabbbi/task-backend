// const { StatusCodes } = require("http-status-codes");
// const { Admin, Manager, RegularUser } = require("../models");
// const ApiError = require("../utils/apiError");

// const createManager = async (req, res, next) => {
//   try {
//     // const manager = await Manager.create(req.body);
//     console.time("CreateManager");
//     const manager = await Manager.create(req.body);
//     console.timeEnd("CreateManager");

//     res.status(StatusCodes.CREATED).send(manager);
//   } catch (error) {
//     next(error);
//   }
// };

// const createUser = async (req, res, next) => {
//   try {
//     const user = await RegularUser.create(req.body);
//     res.status(StatusCodes.CREATED).send(user);
//   } catch (error) {
//     next(error);
//   }
// };

// const getUsers = async (req, res, next) => {
//   try {
//     const users = await RegularUser.find();
//     res.send(users);
//   } catch (error) {
//     next(error);
//   }
// };

// const getUser = async (req, res, next) => {
//   try {
//     const user = await RegularUser.findById(req.params.userId);
//     if (!user) {
//       throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//     }
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// };

// const updateUser = async (req, res, next) => {
//   try {
//     const user = await RegularUser.findByIdAndUpdate(
//       req.params.userId,
//       req.body,
//       { new: true }
//     );
//     if (!user) {
//       throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//     }
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// };

// const deleteUser = async (req, res, next) => {
//   try {
//     const user = await RegularUser.findByIdAndDelete(req.params.userId);
//     if (!user) {
//       throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//     }
//     res.status(StatusCodes.NO_CONTENT).send();
//   } catch (error) {
//     next(error);
//   }
// };

// const assignManager = async (req, res, next) => {
//   try {
//     const user = await RegularUser.findByIdAndUpdate(
//       req.body.userId,
//       { manager: req.body.managerId },
//       { new: true }
//     );
//     if (!user) {
//       throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
//     }
//     res.send(user);
//   } catch (error) {
//     next(error);
//   }
// };

// module.exports = {
//   createManager,
//   createUser,
//   getUsers,
//   getUser,
//   updateUser,
//   deleteUser,
//   assignManager,
// };

const { StatusCodes } = require("http-status-codes");
const { RegularUser } = require("../models/RegularUser")
const { Manager } = require("../models/Manager");
const {
  createRegularUser,
  createManager: createManagerService,
  getUserById,
  queryUsers,
  updateUserById,
  deleteUserById,
  assignManagerToUser,
} = require("../services/usersServices");
const mongoose = require('mongoose');

const createUser = async (req, res, next) => {
  try {
    const user = await createRegularUser(req.body);
    
    // Verify the manager relationship was established
    if (req.body.manager) {
      const manager = await mongoose.model('Manager').findById(req.body.manager);
      if (!manager.assignedUsers.includes(user._id)) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to establish manager relationship');
      }
    }

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};


const createManager = async (req, res, next) => {
  try {
    const manager = await createManagerService(req.body);

    res.status(StatusCodes.CREATED).json({
      success: true,
      data: manager,
    });
  } catch (error) {
    console.error("❌ [5] Error in createManager:", error);
    next(error);
  }
};
 //above one is
const getUsers = async (req, res, next) => {
  try {
    const users = await queryUsers(req.query);
    res.status(StatusCodes.OK).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

const getUser = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.userId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await updateUserById(req.params.userId, req.body);
    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await deleteUserById(req.params.userId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const user = await assignManagerToUser(req.body.userId, req.body.managerId);
    res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  createManager,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  assignManager,
};
