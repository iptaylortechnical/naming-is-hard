var express = require('express');
var router = express.Router();
var info = require('../utilities/info');

/* GET users listing. */
router.get('/', function(req, res, next) {
	
	var urlParts = req.originalUrl.split('/');
	var err;
	var db = req.db;
	
	//no db. rip.
	if(!db){
	  var err = new Error('No DB');
	  err.status = 500;
		next(err);
		return;
	}
	
	//get rid of leading blank
	urlParts.shift();
	
	var shouldBeR = urlParts[0];
	var ident;
	var room;
	var name;
	var legit = true;
	
	if(urlParts[1]){
		ident = urlParts[1];
	}else{
		err = "Did not specify room"
		legit = false;
	}
	
	if(shouldBeR == 'r'){
		name = ident;
	}else{
		err = 'tricksy, false';
		legit = false;
	}
	
	if(legit){
		info.getChats(db, '/'+name, function(e, docs){
			room = {
				name: name,
				err: e,
				legit:legit,
				records:docs
			}
	
			res.send(room);
		})
	}
});

module.exports = router;
