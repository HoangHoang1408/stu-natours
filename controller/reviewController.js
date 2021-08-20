const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

// method
exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// special options
exports.getAllReviewsFromATourOptions = (req, res, next) => {
  if (req.params.tourId) req.specialOptions = { tour: req.params.tourId };
  next();
};
// normal
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.creatReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
