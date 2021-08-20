const mongoose = require('mongoose');
const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a User'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a Tour'],
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});
// bookingSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: 'user',
//     select: 'name',
//   }).populate({
//     path: 'tour',
//     select: 'name',
//   });
//   next();
// });
const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
