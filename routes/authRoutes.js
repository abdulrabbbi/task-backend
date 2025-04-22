const express = require('express');
const authController = require('../controller/authController');
const validate = require('../middlewares/validationMidleware');
const { login, logout } = require('../validations/authValidation');
const router = express.Router();

router.post('/login', validate(login), authController.login);
router.post('/logout', validate(logout), authController.logout);
router.get('/verify', authController.verifyToken);
router.post('/refresh', authController.refreshAccessToken);


module.exports = router;