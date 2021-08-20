const mongoose = require('mongoose');
const slugify = require('slugify');

// schema
const tourSchema = new mongoose.Schema(
  {
    startLocation: {
      description: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        require: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5,
      validate: {
        validator: function (val) {
          return Math.round(val * 100) / 100;
        },
      },
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      required: true,
    },
    startDates: {
      type: [Date],
      required: true,
    },
    name: {
      type: String,
      trim: true,
      unique: [true, "Tour's name must be unique"],
      required: [true, 'A tour must have a name'],
      minLength: [10, "Min name's length: 10 characters"],
      maxLength: [50, "Max name's length: 50 characters"],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a goup size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: ['easy', 'medium', 'difficult'],
    },
    guides: {
      type: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
      required: [true, 'A tour must have guides team'],
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a Summary'],
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a image'],
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        description: String,
        day: Number,
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// index
tourSchema.index({ ratingsAverage: -1, price: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
// virtual property
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

// middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
tourSchema.post(/^find/, function (docs, next) {
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
