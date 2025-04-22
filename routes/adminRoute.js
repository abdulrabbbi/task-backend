const express = require('express');
const { createAdmin } = require('../controller/adminController');
const validate = require('../middlewares/validationMidleware');
const { adminValidation } = require('../middlewares/adminMiddleware');

const router = express.Router();

router.post(
  '/register',
  validate({ body: adminValidation }, { abortEarly: false }),
  createAdmin
);


module.exports = router;