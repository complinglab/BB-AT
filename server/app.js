require('dotenv').config();

var createError = require('http-errors');
var express = require('express');
require('express-async-errors'); // Error handling for async function
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

const { SigninAuthError, NoTaskError } = require('./src/helpers/errors');

// set up mongoose connection
var mongoose = require('mongoose');

var mongoDB = process.env.MONGODB_CONNECT;

mongoose.connect(mongoDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

var db = mongoose.connection;

db.once('open', () =>
  console.log('MongoDB -- database connection established successfully!')
);

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var app = express();

app.use(express.static(path.resolve(__dirname, '../react-ui/build')));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// Configure routes
require('./src/routes/index')(app);

// All remaining requests return the React app, so it can handle routing.
app.get('*', function (request, response) {
  console.log(path.resolve(__dirname, '../react-ui/build', 'index.html'));
  response.sendFile(path.resolve(__dirname, '../react-ui/build', 'index.html'));
});

app.get('*', (req, res) => {
  return res.status(404).send('Error 404! route not found!');
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handlers

app.use(function handleSigninError(err, req, res, next) {
  if (err instanceof SigninAuthError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  next(err);
});

app.use(function (err, req, res, next) {
  if (err instanceof NoTaskError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  next(err);
});

app.use(function (err, req, res, next) {
  // Replace with auth error instance
  if (err.name === 'MongoError' && err.code === 11000) {
    console.log(err);
    let key = Object.keys(err.keyValue);
    res
      .status(409)
      .json({ message: `Account with that ${key} already exists` });
    return;
  }

  next(err);
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  statusCode = err.statusCode || 500;
  message = 'Internal Server Error';

  console.log(err);

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  });
});

module.exports = app;
