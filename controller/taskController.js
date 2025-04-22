const { StatusCodes } = require('http-status-codes');
const { Task } = require('../models');
const ApiError = require('../utils/apiError');

const createTask = async (req, res, next) => {
  try {
    const taskData = {
      ...req.body,
      creatorId: req.user.id,
      creatorModel: req.user.constructor.modelName,
    };
    
    const task = await Task.create(taskData);
    res.status(StatusCodes.CREATED).send(task);
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    let filter = {};
    
    // Regular users can only see their own tasks
    if (req.user.role === 'user') {
      filter = { creatorId: req.user.id, creatorModel: 'RegularUser' };
    }
    // Managers can see their tasks and tasks of their assigned users
    else if (req.user.role === 'manager') {
      filter = {
        $or: [
          { creatorId: req.user.id, creatorModel: 'Manager' },
          { assignedTo: { $in: req.user.assignedUsers } },
        ],
      };
    }
    // Admins can see all tasks
    // No filter needed
    
    const tasks = await Task.find(filter);
    res.send(tasks);
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }
    
    // Check permissions
    if (req.user.role === 'user' && 
        (task.creatorId.toString() !== req.user.id.toString() || task.creatorModel !== 'RegularUser')) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    
    if (req.user.role === 'manager' && 
        task.creatorId.toString() !== req.user.id.toString() && 
        task.creatorModel === 'Manager' && 
        !req.user.assignedUsers.includes(task.creatorId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    
    res.send(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);
    
    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }
    
    // Check permissions
    if (req.user.role === 'user' && 
        (task.creatorId.toString() !== req.user.id.toString() || task.creatorModel !== 'RegularUser')) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    
    if (req.user.role === 'manager' && 
        task.creatorId.toString() !== req.user.id.toString() && 
        task.creatorModel === 'Manager' && 
        !req.user.assignedUsers.includes(task.creatorId)) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }
    
    Object.assign(task, req.body);
    await task.save();
    res.send(task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.taskId);

    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }

    if (
      req.user.role === 'user' &&
      (task.creatorId.toString() !== req.user.id.toString() || task.creatorModel !== 'RegularUser')
    ) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }

    if (
      req.user.role === 'manager' &&
      task.creatorId.toString() !== req.user.id.toString() &&
      task.creatorModel === 'Manager' &&
      !req.user.assignedUsers.includes(task.creatorId.toString())
    ) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'Forbidden');
    }

    await task.deleteOne(); 
    res.status(StatusCodes.NO_CONTENT).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};