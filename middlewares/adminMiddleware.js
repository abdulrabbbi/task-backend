const Joi = require('joi');

const adminValidation = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  role: Joi.string().valid('admin', 'manager', 'user').required(),
});

module.exports = { adminValidation };
