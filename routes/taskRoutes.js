const express = require("express");
const taskController = require("../controller/taskController");
const taskValidation = require("../validations/taskValidation");
const validate = require("../middlewares/validationMidleware");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(auth());

router
  .route("/")
  .post(validate(taskValidation.createTask), taskController.createTask)
  .get(taskController.getTasks);

router
  .route("/:taskId")
  .get(taskController.getTask)
  .patch(validate(taskValidation.updateTask), taskController.updateTask)
  .delete(taskController.deleteTask);

module.exports = router;
