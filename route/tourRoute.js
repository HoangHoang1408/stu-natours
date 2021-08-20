const express = require('express');

// controller import
const tourController = require('../controller/tourController');
const authController = require('../controller/authController');
// router
const reviewRouter = require('./reviewRoute');
const router = express.Router();

// http method
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-tours')
  .get(tourController.alliasTop5Tour, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plans/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlans
  );
router
  .route('/get-tours-within/:distance/center/:lnglat/unit/:unit')
  .get(tourController.getToursWithin);
router
  .route('/distances/center/:lnglat/unit/:unit')
  .get(tourController.getToursDistance);
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.createTour
  );
router
  .route('/:id')
  .get(tourController.getTour)
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour
  )
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  );

// export
module.exports = router;
