const express = require('express');
const router = express.Router();
// controller
const userController = require('../controller/userController');
const authController = require('../controller/authController');

// authentication
router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);
router.route('/updatePassword').patch(authController.updatePassword);
// normal routes
router.route('/me').get(userController.getMe, userController.getUser);
router
  .route('/updateMe')
  .patch(userController.uploadUserPhoto,userController.resizeUserPhoto,userController.updateMe);
router.route('/deleteMe').delete(userController.deleteMe);

router.use(authController.restrict('admin'));
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)
  .patch(userController.updateUser);

// export
module.exports = router;
