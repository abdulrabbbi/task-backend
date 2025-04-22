const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const regularUserSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
    },
    role: {
      type: String,
      default: 'user',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Manager',
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
regularUserSchema.plugin(toJSON);
regularUserSchema.plugin(paginate);
regularUserSchema.index({ manager: 1 });

regularUserSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

regularUserSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

regularUserSchema.post('save', async function(doc) {
  if (doc.manager) {
    await mongoose.model('Manager').findByIdAndUpdate(
      doc.manager,
      { $addToSet: { assignedUsers: doc._id } }
    );
  }
});

regularUserSchema.post('remove', async function(doc) {
  if (doc.manager) {
    await mongoose.model('Manager').findByIdAndUpdate(
      doc.manager,
      { $pull: { assignedUsers: doc._id } }
    );
  }
});


regularUserSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};
const RegularUser = mongoose.model('RegularUser', regularUserSchema);

module.exports = RegularUser;