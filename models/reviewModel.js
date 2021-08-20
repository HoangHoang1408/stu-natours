const mongoose = require('mongoose');
const Tour = require('./tourModel');

// schema
const reviewSchema = mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Input review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Rating needed!'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toObject: { virtuals: true },
    toJson: { virtuals: true },
  }
);

// index
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

// static
reviewSchema.statics.updateTourRatings = async function (tourId) {
  const stat = await this.aggregate([
    { $match: { tour: tourId } },
    {
      $group: {
        _id: '$tour',
        ratingsAverage: { $avg: '$rating' },
        ratingsQuantity: { $sum: 1 },
      },
    },
    {
      $project: {
        ratingsAverage: { $round: ['$ratingsAverage', 2] },
        ratingsQuantity: 1,
      },
    },
  ]);
  console.log(stat);
  const tour = await Tour.findById(tourId);
  if (stat.length > 0) {
    tour.ratingsAverage = stat[0].ratingsAverage;
    tour.ratingsQuantity = stat[0].ratingsQuantity;
  } else {
    tour.ratingsAverage = 4.5;
    tour.ratingsQuantity = 0;
  }
  await tour.save();
};
// middleware
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchema.post('save', async function () {
  await this.constructor.updateTourRatings(this.tour);
});
reviewSchema.post(/findOneAnd/, async function (doc) {
  await doc.constructor.updateTourRatings(doc.tour);
});
// export
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
