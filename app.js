// package
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
// controller
const globalErrorHandler = require('./controller/errController');

// router
const tourRouter = require('./route/tourRoute');
const userRouter = require('./route/userRoute');
const reviewRouter = require('./route/reviewRoute');
const bookingRouter = require('./route/bookingRoute');
const viewRouter = require('./route/viewRoute');

// util
const AppError = require('./utils/appError');

// initalize app
// start express app
const app = express();

// set view
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// middleware
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from a IP, retry in one hour',
  })
);
app.use(mongoSanitize());
app.use(xss());
app.use(helmet());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAvarage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use((req, res, next) => {
  res.set(
    'Content-Security-Policy',
    "default-src *;style-src 'self' https: 'unsafe-inline'"
  );
  next();
});
// routs

// view route
app.use('/', viewRouter);

// api route
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);
// global error handler
app.all('*', (req, res, next) => {
  return next(
    new AppError(`Can't find ${req.originalUrl} on this server`, 404)
  );
});
app.use(globalErrorHandler);

// export app
module.exports = app;
