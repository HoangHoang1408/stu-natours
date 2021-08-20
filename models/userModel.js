const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');

// schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'User must have a name'],
    },
    email: {
      type: String,
      required: [true, 'User must have a email'],

      unique: true,
      validate: {
        message: 'User must have a valid email',
        validator: validator.isEmail,
      },
    },
    role: {
      type: String,
      default: 'user',
      enum: {
        values: ['user', 'guide', 'leadguide', 'admin'],
        message:
          "Role must be in one of the following fields: 'user', 'guide', 'leadguide', 'admin'",
      },
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
    photo: {
      type: String,
      default: 'default.jpg',
    },
    password: {
      type: String,
      required: [true, 'Please provide confirm password '],
      select: false,
      minLength: 8,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please provide confirm password '],

      validate: {
        validator: function (val) {
          return this.password === val;
        },
        message: 'Passwords must be the same',
      },
    },
    passwordChangedAt: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    loginFailCount: {
      type: Number,
      select: false,
    },
    loginBuster: {
      type: Date,
      select: false,
    },
    loginAvailable: {
      type: Boolean,
      select: false,
      default: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// virtual
userSchema.virtual('bookings', {
  ref: 'Booking',
  foreignField: 'user',
  localField: '_id',
  options: {
    select: 'tour',
  },
});

// middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.resetPasswordToken = undefined;
  this.resetPasswordExpires = undefined;
  if (this.isNew) return next();
  this.passwordChangedAt = Date.now();
  next();
});
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } }).populate('bookings');
  next();
});

// method
userSchema.methods.checkPassword = async function (pass) {
  return await bcrypt.compare(pass, this.password);
};
userSchema.methods.checkPasswordChangedAfterJWTIssued = function (iat) {
  if (!this.passwordChangedAt) return false;
  return Date.parse(this.passwordChangedAt) / 1000 > iat;
};
userSchema.methods.createResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.resetPasswordExpires =
    Date.now() + process.env.RESET_PASSWORD_EXPIRES * 60 * 1000;
  return resetToken;
};

// export
const User = mongoose.model('User', userSchema);
module.exports = User;
