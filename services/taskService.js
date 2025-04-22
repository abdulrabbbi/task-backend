const { Task } = require('../models');
const ApiError = require('../utils/apiError');

class TaskService {
  async createTask(taskData) {
    return await Task.create(taskData);
  }

  async getTasks(filter) {
    return await Task.find(filter);
  }

  async getTaskById(taskId) {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Task not found');
    }
    return task;
  }

  async updateTask(taskId, updateData) {
    const task = await this.getTaskById(taskId);
    Object.assign(task, updateData);
    await task.save();
    return task;
  }

  async deleteTask(taskId) {
    const task = await this.getTaskById(taskId);
    await task.remove();
  }

  // Permission check methods
  canUserViewTask(user, task) {
    if (user.role === 'admin') return true;
    if (user.role === 'user') {
      return task.creatorId.equals(user.id) && task.creatorModel === 'RegularUser';
    }
    if (user.role === 'manager') {
      return task.creatorId.equals(user.id) && task.creatorModel === 'Manager' || 
             user.assignedUsers.some(id => id.equals(task.creatorId));
    }
    return false;
  }
}

module.exports = new TaskService();