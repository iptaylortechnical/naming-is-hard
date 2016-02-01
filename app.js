var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var db = null; //require('monk')('localhost:27017/naming');

var routes = require('./routes/index');
var users = require('./routes/users');
var r = require('./routes/r');
var main = require('./routes/main');
var authorize = require('./routes/authorize');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
//expose db to other endpoints
app.use(function(req, res, next) {
	
	req.db = db;
	
  //var err = new Error('Not Found');
  //err.status = 404;
	//next(err);
  next();
});

app.use('/users', users);
app.use('/r/*', r);
app.use('/r', r);
app.use('/', main);
app.use('/auth', authorize);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
