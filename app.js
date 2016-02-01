var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');
var info = require('./utilities/info');
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost:27017/naming');
console.log("MONGOLAB_URL: " + process.env.MONGOLAB_URI);

var routes = require('./routes/index');
var users = require('./routes/users');
var r = require('./routes/r');
var main = require('./routes/main');
var authorize = require('./routes/authorize');
var subscribe = require('./routes/subscribe');

var app = express();

var chatters = {};
var subscriptions = {};

app.lel = function(io){
	
	gIO = io;
	
	gIO.on('connection', function(socket){
		
		socket.on('authresponse', function(session){
			console.log('got auth response');
			console.log(session);
			chatters[session] = socket;
			chatters[session].session = session;
			chatters[session].on('chat', function(msg){
				
				var senderSession = this.session;
				var intent = msg.intent;
				var body = msg.body;
				
				console.log("Received chat from " + this.session + " intended for " + msg.intent + " with body " + msg.body);
				
				info.getUserFromSession(senderSession, db, function(e, doc){
					var theKeys = Object.keys(subscriptions[msg.intent]);
					for(var k = 0; k < theKeys.length; k++){
						console.log('sending ' + msg.body + ' to ' + theKeys[k] + ' from ' + msg.intent);
						subscriptions[msg.intent][theKeys[k]].emit(msg.intent, {name: doc, body:msg.body, intent:msg.intent});
					}
				})
			})
			chatters[session].on('disconnected', function(){
				// chatters[session] = null;
			})
		})
		
		console.log('connected, sending auth request');
		socket.emit('auth');
	})
}

function setSubscriptions(session, channels){
	console.log(session);
	console.log(channels);
	for(var i = 0; i < channels.length; i++){
		if(subscriptions[channels[i]]){
			subscriptions[channels[i]][chatters[session].session] = chatters[session];
		}else{
			subscriptions[channels[i]] = {};
			subscriptions[channels[i]][chatters[session].session] = chatters[session];
		}
	}
}

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
	req.setSubscriptions = setSubscriptions;
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
app.use('/subscribe', subscribe);

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
