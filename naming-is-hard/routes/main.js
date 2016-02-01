var express = require('express');
var router = express.Router();
var info = require('../utilities/info');

router.get('/', function(req, res, next) {
	var session = req.cookies.session;
	var db = req.db;
	
	if(session){
		info.getSessionExists(session, db, function(e, exists){
			if(exists){
				res.send('home');
			}else{
				res.render('login');
			}
		})
	}else{
		res.render('login')
	}
	
});

module.exports = router;
