const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
// util
const catchAsync = require('../utils/catchAsync');
//
exports.getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    tours,
    title: 'All Tours',
  });
});
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'user review rating',
  });
  if (!tour) return next(new AppError('No tour found!', 404));
  res
    .status(200)
    .set(
      'Content-Security-Policy',
      "default-src 'self' https://*.mapbox.com https://js.stripe.com/v3/ ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com https://js.stripe.com/v3/ 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
    )
    .render('tour', {
      title: tour.name,
      tour,
    });
});
exports.login = (req, res, next) => {
  res.status(200).render('login', {
    title: 'Log In',
  });
};
exports.signUp = (req, res, next) => {
  res.status(200).render('signUp', {
    title: 'Sign Up',
  });
};
exports.getAccount = (req, res, next) => {
  res.status(200).render('account', {
    title: 'Account',
  });
};
