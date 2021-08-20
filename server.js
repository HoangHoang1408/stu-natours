const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// config env
dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;
// database connection
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
};
const database = process.env.DATABASE;
mongoose.connect(database, options).then(() => {
  console.log('Connected!');
});
// server listen
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
