const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const userController = require('../controller/userController');
const validate = require('../middlewares/validationMidleware');
const { 
  createManager, 
  updateUser, 
  createUser,
  assignManager 
} = require('../validations/userValidation');


// Admin routes
router.post(
  '/managers',
  authMiddleware('manageAdmins'),
  validate(createManager),
  userController.createManager
);

router.post(
  '/',
  authMiddleware('manageUsers'),
  validate(createUser),
  userController.createUser
);

// Get users
router.get(
  '/',
  authMiddleware('getUsers'),
  userController.getUsers
);

// User management routes
router.route('/:userId')
  .get(
    authMiddleware('getUsers'),
    userController.getUser
  )
  .patch(
    authMiddleware('manageUsers'),
    validate(updateUser),
    userController.updateUser
  )
  .delete(
    authMiddleware('manageUsers'),
    userController.deleteUser
  );

// Manager assignment
router.post(
  '/assign-manager',
  authMiddleware('manageUsers'),
  validate(assignManager),
  userController.assignManager
);

module.exports = router;

