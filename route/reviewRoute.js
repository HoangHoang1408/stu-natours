const express = require('express');
const reviewController = require('../controller/reviewController');
const authController = require('../controller/authController');
const router = express.Router({ mergeParams: true });

// routes
router.use(authController.protect);
router
  .route('/')
  .get(
    reviewController.getAllReviewsFromATourOptions,
    reviewController.getAllReviews
  )
  .post(
    authController.restrict('user'),
    reviewController.setTourAndUserIds,
    reviewController.creatReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .delete(
    authController.restrict('user', 'admin'),
    reviewController.deleteReview
  )
  .patch(
    authController.restrict('user', 'admin'),
    reviewController.updateReview
  );



// export
module.exports = router;
