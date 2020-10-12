var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const { body, validationResult } = require('express-validator');
const flash = require('express-flash-notification');
const session = require('express-session');

var expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');

var indexRouter = require('./routes/backend/index');
var systemConfig = require('./configs/system');


mongoose.connect('mongodb://localhost/shopping');
const db = mongoose.connection;
db.on('error', () => {console.log('connection error:')});
db.once('open', () =>{
  // we're connected!
  console.log('connection ok:')
});



var app = express();


app.use(cookieParser());
app.use(session({
        secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
}));
app.use(flash(app));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'backend');


// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Local variable
app.locals.systemConfig = systemConfig;
app.use(`/${systemConfig.prefixAdmin}`, indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('pages/error', { title: 'Error Page'});
});

module.exports = app;
