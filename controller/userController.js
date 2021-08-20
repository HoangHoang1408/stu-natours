const factory = require('./handlerFactory');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const AppError = require('../utils/appError');

// multer config and resize with sharp
// multer
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only image', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
// sharp
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  console.log(req.body);
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .toFile(`./public/img/users/${req.file.filename}`);

  next();
});
// normal

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This route is not fo udating password', 400));
  const acceptedFields = ['name', 'email'];
  const obj = {};
  Object.keys(req.body).forEach((e) => {
    if (acceptedFields.includes(e)) obj[e] = req.body[e];
  });
  if (req.file) {
    obj.photo = req.file.filename;
  }
  const user = await User.findByIdAndUpdate(req.user.id, obj, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
// for admin
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.deleteUser = factory.deleteOne(User);
exports.createUser = factory.createOne(User);
exports.updateUser = factory.updateOne(User);
