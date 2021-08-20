const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
// model
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');

// upload images
const multerStorage = multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
});
exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`./public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  Promise.all(
    req.files.images.map(async (file, i) => {
      const name = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      req.body.images.push(name);
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`./public/img/tours/${name}`);
    })
  );
  next();
});

// main middleware
exports.alliasTop5Tour = (req, res, next) => {
  req.query.page = 1;
  req.query.limit = 5;
  req.query.sort = '-ratingsAverage price';
  next();
};
exports.getTourStats = catchAsync(async (req, res, next) => {
  const data = await Tour.aggregate([
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        averagePrice: { $avg: '$price' },
        averageRatings: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $project: {
        averagePrice: { $round: ['$averagePrice', 2] },
        averageRatings: { $round: ['$averageRatings', 2] },
      },
    },
  ]);
  res.status(200).json({
    resutls: data.length,
    status: 'success',
    data,
  });
});
exports.getMonthlyPlans = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const data = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}/01/01`),
          $lte: new Date(`${year}/12/31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
  ]);
  res.status(200).json({
    results: data.length,
    status: 'success',
    data,
  });
});
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const unit = req.params.unit || 'mi';
  const { distance, lnglat } = req.params;
  if (!distance || !lnglat)
    return next(new AppError('Needed fields: distance,lalng', 400));
  const r = unit === 'mi' ? distance / 3963.2 : distance / 6357;
  const [lng, lat] = lnglat.split(',');
  if (!lng || !lat)
    return next(
      new AppError('Please provide valid longtitude,latitude format', 400)
    );
  const data = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], r],
      },
    },
  });
  res.status(200).json({
    results: data.length,
    status: 'success',
    data,
  });
});
exports.getToursDistance = catchAsync(async (req, res, next) => {
  const unit = req.params.unit || 'mi';
  const { lnglat } = req.params;
  if (!lnglat) return next(new AppError('Needed fields: lalng', 400));
  const [lng, lat] = lnglat.split(',');
  if (!lng || !lat)
    return new AppError('Please provide valid longtitude,latitude format', 400);
  const data = await Tour.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [+lng, +lat] },
        spherical: true,
        distanceField: 'distance',
        distanceMultiplier: unit === 'mi' ? 0.000621 : 0.001,
      },
    },
    {
      $project: {
        name: 1,
        distance: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data,
  });
});
//
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, ['reviews']);
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);
exports.updateTour = factory.updateOne(Tour);
