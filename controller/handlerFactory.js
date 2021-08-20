// util import
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// function
exports.getAll = (model) =>
  catchAsync(async (req, res, next) => {
    let specialOptions = {};
    if (req.specialOptions) specialOptions = req.specialOptions;
    const query = new APIFeatures(model.find(specialOptions), req.query)
      .filter()
      .limit()
      .sort()
      .paginate().query;
    // execute query
    const doc = await query;
    if (!doc) return next(new AppError('No document found!', 404));
    res.status(200).json({
      results: doc.length,
      status: 'success',
      data: doc,
    });
  });
exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });
exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) return next(new AppError('No document found with that id', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) return next(new AppError('No document found with that id', 404));
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.getOne = (model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    if (popOptions) {
      popOptions.forEach((el) => {
        query = query.populate(el);
      });
    }
    const doc = await query;
    if (!doc) return next(new AppError('No document found with that id', 404));
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });
