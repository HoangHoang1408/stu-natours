const jwt = require('jsonwebtoken');
const util = require('util');
const crypto = require('crypto');

// model
const User = require('../models/userModel');

// util
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/sendEmail');

// method
const createAndSendToken = function (user, res, code) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user._id = undefined;
  user.password = undefined;
  res.status(code).json({
    status: 'success',
    token,
    user,
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(user, url).sendWelcome();
  createAndSendToken(user, res, 201);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return new AppError('Email and Password needed!', 400);
  const user = await User.findOne({ email }).select(
    '+password +loginAvailable +loginBuster +loginFailCount'
  );
  if (!user) return next(new AppError('Invalid email!', 400));
  if (user.loginBuster && Date.now() > user.loginBuster) {
    user.loginFailCount = undefined;
    user.loginBuster = undefined;
    user.loginAvailable = true;
  }
  if (user.loginAvailable !== undefined && !user.loginAvailable)
    return next(new AppError('You can not login now, try again later', 400));
  if (!(await user.checkPassword(password))) {
    if (!user.loginFailCount) {
      user.loginFailCount = 0;
      user.loginBuster = Date.now() + process.env.LOGIN_BUSTER * 60 * 60 * 1000;
    }
    user.loginFailCount += 1;
    if (
      user.loginFailCount >= +process.env.LOGIN_FAIL_COUNT &&
      Date.now() < user.loginBuster
    )
      user.loginAvailable = false;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Invalid password!', 400));
  }
  user.loginFailCount = undefined;
  user.loginBuster = undefined;
  await user.save({ validateBeforeSave: false });
  createAndSendToken(user, res, 200);
});
exports.logout = catchAsync(async (req, res, net) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Get token from req headers
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError('Please login to continue...', 400));
  // 2. Verify token
  const decoded = await util.promisify(jwt.verify)(token, process.env.JWT_KEY);
  // 3. Check if user still exsist
  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError('The account was deleted...', 401));
  // 4. Check if user changed password after JWT issued
  if (user.checkPasswordChangedAfterJWTIssued(decoded.iat))
    return next(
      new AppError(
        'Password has been changed recently, please login again to continue...',
        400
      )
    );
  req.user = user;
  res.locals.user = user;
  next();
});
exports.isLogin = async (req, res, next) => {
  try {
    if (req.cookies.jwt) {
      const decoded = await util.promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_KEY
      );
      const user = await User.findById(decoded.id);
      if (!user) return next();
      if (user.checkPasswordChangedAfterJWTIssued(decoded.iat)) return next();
      res.locals.user = user;
      return next();
    }
  } catch (err) {
    return next();
  }
  next();
};
exports.restrict = function (...role) {
  return (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(
        new AppError('You dont have permission to perform this action!', 403)
      );
    next();
  };
};
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Get user
  const { email } = req.body;
  if (!email) return next(new AppError('Email required!', 400));
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError('The user does not exist, please try again!', 400)
    );
  // 2. Generate resetToken
  const resetToken = user.createResetPasswordToken();
  await user.save({ validateBeforeSave: false });
  // 3. Send reset url to email
  try {
    const url = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    await new Email(user, url).sendResetPassword();
    res.status(200).json({
      status: 'success',
      message: 'Reset token sent to email',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    return next(new AppError('Send email fail, try again!', 500));
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({ resetPasswordToken });
  if (!user) return next(new AppError('Invalid token, try again!', 400));
  if (Date.now() > user.resetPasswordExpires)
    return next(new AppError('The token was expired, try again!', 400));
  const { password, passwordConfirm } = req.body;
  if (!password || !passwordConfirm)
    return next(
      new AppError('Please provide password and confirm password...', 400)
    );
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  createAndSendToken(user, res, 200);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');
  const { currentPassword, password, passwordConfirm } = req.body;
  if (!currentPassword || !password || !passwordConfirm)
    return next(
      new AppError(
        'Needed fields: currentPassword, password, passwordConfirm. Please try again!',
        400
      )
    );
  if (!(await user.checkPassword(currentPassword)))
    return next(new AppError('Wrong current password', 400));
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();
  createAndSendToken(user, res, 200);
});
