/**
 * User role constants
 */
const ADMIN = 'admin';
const MANAGER = 'manager';
const USER = 'user';

/**
 * Permission constants
 */
const PERMISSIONS = {
  // Task permissions
  GET_TASKS: 'getTasks',
  MANAGE_TASKS: 'manageTasks',
  
  // User permissions
  GET_USERS: 'getUsers',
  MANAGE_USERS: 'manageUsers',
  
  // Admin permissions
  GET_ADMINS: 'getAdmins',
  MANAGE_ADMINS: 'manageAdmins'
};

module.exports = {
  ADMIN,
  MANAGER,
  USER,
  PERMISSIONS
};