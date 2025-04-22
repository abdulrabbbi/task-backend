const express = require("express");
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const taskRoutes = require("./taskRoutes");
const adminRoutes = require("./adminRoute");
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();
router.use('/dashboard', dashboardRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
