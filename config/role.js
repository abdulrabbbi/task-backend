const { ADMIN, MANAGER, USER, PERMISSIONS } = require('./constants');

const allRoles = {
  [USER]: [
    PERMISSIONS.GET_TASKS,
    PERMISSIONS.MANAGE_TASKS
  ],
  [MANAGER]: [
    PERMISSIONS.GET_TASKS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.GET_USERS,
    PERMISSIONS.MANAGE_USERS
  ],
  [ADMIN]: [
    PERMISSIONS.GET_TASKS,
    PERMISSIONS.MANAGE_TASKS,
    PERMISSIONS.GET_USERS,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.GET_ADMINS,
    PERMISSIONS.MANAGE_ADMINS
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};