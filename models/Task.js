const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const taskSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'creatorModel',
    },
    creatorModel: {
      type: String,
      required: true,
      enum: ['Admin', 'Manager', 'RegularUser'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'assignedModel',
    },
    assignedModel: {
      type: String,
      enum: ['Manager', 'RegularUser'],
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
taskSchema.plugin(toJSON);
taskSchema.plugin(paginate);
taskSchema.index({ creatorId: 1, creatorModel: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ assignedTo: 1 });


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;