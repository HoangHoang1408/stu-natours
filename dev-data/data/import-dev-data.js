const fs = require('fs');
const util = require('util');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// import model
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// configure env
dotenv.config({ path: './config.env' });

// connect to database
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connected');
  });

// function
const readFilePromise = util.promisify(fs.readFile);
const importData = async function () {
  try {
    const dataTour = await readFilePromise('dev-data/data/tours.json');
    const dataUser = await readFilePromise('dev-data/data/users.json');
    const dataReview = await readFilePromise('dev-data/data/reviews.json');
    await Tour.create(JSON.parse(dataTour));
    await Review.create(JSON.parse(dataReview));
    await User.create(JSON.parse(dataUser), { validateBeforeSave: false });
    console.log('Imported!');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(1);
  }
};
const deleteData = async function () {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Deleted!');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit(1);
  }
};

// run
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
