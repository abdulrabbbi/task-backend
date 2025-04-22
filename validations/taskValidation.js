const Joi = require('joi');

const createTask = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    dueDate: Joi.date().required(),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    assignedTo: Joi.string().required(),
    assignedModel: Joi.string().valid('Manager', 'RegularUser')
  })
};

const updateTask = {
  params: Joi.object().keys({
    taskId: Joi.string().required()
  }),
  body: Joi.object().keys({
    title: Joi.string(),
    description: Joi.string().allow(''),
    dueDate: Joi.date(),
    status: Joi.string().valid('pending', 'in-progress', 'completed')
  })
};

module.exports = {
  createTask,
  updateTask
};