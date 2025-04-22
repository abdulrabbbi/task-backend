const express = require('express');
const router = express.Router();
const { Task, Admin, Manager, RegularUser } = require('../models');
const authMiddleware = require('../middlewares/authMiddleware');
const authenticate = require("../middlewares/attenticated");

router.get('/stats',authenticate, async (req, res) => {
  try {
    const user = req.user;
    let stats = {};
    // Timeout protection
    const statsPromise = (user.role === 'admin') 
      ? getAdminStats() 
      : (user.role === 'manager') 
        ? getManagerStats(user) 
        : getUserStats(user);

    const result = await Promise.race([
      statsPromise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      )
    ]);

    res.json(result);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      message: error.message || 'Error fetching dashboard stats' 
    });
  }
});
// Helper functions
async function getAdminStats() {
  const [
    totalAdmins,
    totalManagers,
    totalRegularUsers,
    activeTasks,
    overdueTasks,
    recentTasks,
    recentUsers
  ] = await Promise.all([
    Admin.countDocuments().catch(() => 0),
    Manager.countDocuments().catch(() => 0),
    RegularUser.countDocuments().catch(() => 0),
    Task.countDocuments({ status: { $in: ['pending', 'in-progress'] } }).catch(() => 0),
    Task.countDocuments({ 
      status: { $in: ['pending', 'in-progress'] },
      dueDate: { $lt: new Date() }
    }).catch(() => 0),
    Task.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean() // Faster response
      .populate('creatorId', 'name')
      .populate('assignedTo', 'name')
      .catch(() => []),
    RegularUser.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
      .select('name email role createdAt')
      .catch(() => [])
  ]);

  return {
    totalUsers: totalAdmins + totalManagers + totalRegularUsers,
    activeTasks,
    overdueTasks,
    recentTasks,
    recentUsers
  };
}

async function getManagerStats(user) {
  const [
    myTasks,
    teamTasks,
    assignedUsers,
    recentTasks
  ] = await Promise.all([
    Task.countDocuments({ creatorId: user._id, creatorModel: 'Manager' }),
    Task.countDocuments({ 
      $or: [
        { assignedTo: user._id },
        { creatorId: { $in: user.assignedUsers }, creatorModel: 'RegularUser' }
      ]
    }),
    RegularUser.find({ _id: { $in: user.assignedUsers } })
      .select('name email')
      .limit(3),
    Task.find({
      $or: [
        { creatorId: user._id, creatorModel: 'Manager' },
        { assignedTo: user._id },
        { creatorId: { $in: user.assignedUsers }, creatorModel: 'RegularUser' }
      ]
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('creatorId', 'name')
    .populate('assignedTo', 'name')
  ]);

  return {
    myTasks,
    teamTasks,
    assignedUsers,
    recentTasks
  };
}

async function getUserStats(user) {
  const [
    pendingTasks,
    inProgressTasks,
    completedTasks,
    recentTasks
  ] = await Promise.all([
    Task.countDocuments({ 
      creatorId: user._id, 
      creatorModel: 'RegularUser',
      status: 'pending' 
    }),
    Task.countDocuments({ 
      creatorId: user._id,
      creatorModel: 'RegularUser',
      status: 'in-progress' 
    }),
    Task.countDocuments({ 
      creatorId: user._id,
      creatorModel: 'RegularUser',
      status: 'completed' 
    }),
    Task.find({ 
      creatorId: user._id,
      creatorModel: 'RegularUser'
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('assignedTo', 'name')
  ]);

  const totalTasks = pendingTasks + inProgressTasks + completedTasks;
  const completionRate = totalTasks > 0 
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  return {
    pendingTasks,
    inProgressTasks,
    completedTasks,
    completionRate,
    recentTasks
  };
}

module.exports = router;