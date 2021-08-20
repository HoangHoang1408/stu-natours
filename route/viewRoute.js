const router = require('express').Router();
const viewController = require('../controller/viewController');
const authController = require('../controller/authController');
const bookingController = require('../controller/bookingController');
// rout
// check if user logged in
router
  .route('/')
  .get(
    bookingController.getBookingInfo,
    authController.isLogin,
    viewController.getOverview
  );
router
  .route('/tours/:slug')
  .get(authController.isLogin, viewController.getTour);
router.route('/login').get(authController.isLogin, viewController.login);
router.route('/signUp').get(viewController.signUp);
router.route('/me').get(authController.protect, viewController.getAccount);
router
  .route('/my-tours')
  .get(authController.protect, bookingController.getMyTours);
// export
module.exports = router;
