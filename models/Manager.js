const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const ApiError = require("../utils/ApiError");
const { StatusCodes } = require('http-status-codes');

const managerSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
      select: false
    },
    role: {
      type: String,
      default: "manager",
      enum: ["manager"],
      immutable: true
    },
    assignedUsers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "RegularUser"
    }],
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
  }
);

// Add plugins
managerSchema.plugin(toJSON);
managerSchema.plugin(paginate);

// Indexes
managerSchema.index({ email: 1 }, { unique: true });
managerSchema.index({ assignedUsers: 1 });

// Virtual for assignedUsers count
managerSchema.virtual('userCount').get(function() {
  return this.assignedUsers.length;
});

// Static methods
managerSchema.statics = {
  async isEmailTaken(email, excludeUserId) {
    const manager = await this.findOne({ 
      email, 
      _id: { $ne: excludeUserId } 
    });
    return !!manager;
  },

  async getManagerWithUsers(managerId) {
    return this.findById(managerId)
      .populate({
        path: 'assignedUsers',
        select: 'name email role createdAt',
        options: { sort: { createdAt: -1 } }
      });
  },

  async verifyUserAssignment(managerId, userId) {
    return this.exists({
      _id: managerId,
      assignedUsers: userId
    });
  }
};

// Instance methods
managerSchema.methods = {
  isPasswordMatch: async function(password) {
    return bcrypt.compare(password, this.password);
  },

  addUser: async function(userId) {
    if (!this.assignedUsers.includes(userId)) {
      this.assignedUsers.push(userId);
      await this.save();
    }
    return this;
  },

  removeUser: async function(userId) {
    this.assignedUsers = this.assignedUsers.filter(id => !id.equals(userId));
    await this.save();
    return this;
  }
};

// Password hashing middleware
managerSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(8);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Password hashing failed"));
  }
});

const Manager = mongoose.model("Manager", managerSchema);

module.exports = Manager;