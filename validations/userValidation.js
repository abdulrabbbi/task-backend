const Joi = require('joi');

const createManager = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8)
  })
};

const createUser = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    manager: Joi.string().regex(/^[0-9a-fA-F]{24}$/) 
  })
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  }),
  body: Joi.object().keys({
    name: Joi.string(),
    email: Joi.string().email()
  })
};

const assignManager = {
  body: Joi.object().keys({
    userId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required(),
    managerId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required()
  })
};

module.exports = {
  createManager,
  createUser,
  updateUser,
  assignManager
};