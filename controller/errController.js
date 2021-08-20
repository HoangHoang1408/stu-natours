// util
const AppError = require('../utils/appError');

// handle error
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  let message = '';
  Object.keys(err.errors).forEach(
    (el) => (message += err.errors[el].message + ', ')
  );
  return new AppError(message, 400);
};
const handleDuplicateFields = (err) => {
  const message = `Duplicate field: ${
    Object.keys(err.keyValue)[0]
  }, with the value: ${Object.values(err.keyValue)[0]}`;
  return new AppError(message, 400);
};
const handleJWTError = function (err) {
  return new AppError('Invalid token, login again to continue!', 401);
};
const handleTokenExpiredError = (err) =>
  new AppError('Your token was expired, login to try again...', 401);
// send method
const sendErrorDev = function (err, req, res) {
  if (req.originalUrl.startsWith('/api'))
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  return res.status(err.statusCode).render('error', {
    title: 'Error',
    message: err.message,
  });
};
const sendErrorProd = function (err, req, res) {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res.status(500).json({
      status: 'error',
      message: 'Something very wrong happened on the server!',
    });
  }
  return res.status(err.statusCode).render('error', {
    title: 'Error',
    message: err.message,
  });
};

// error controller middleware
module.exports = function (err, req, res, next) {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'production') {
    console.log('Here is the error:', err);
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFields(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError')
      error = handleTokenExpiredError(error);
    sendErrorProd(error, req, res);
  } else if (process.env.NODE_ENV === 'development') {
    console.error(err);
    sendErrorDev(err, req, res);
  }
};
