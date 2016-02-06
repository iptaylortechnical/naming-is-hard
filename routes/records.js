var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	
	var urlParts = req.originalUrl.split('/');
	var err;
	
	//no db. rip.
	if(req.db){
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

	
	if(urlParts[1]){
		ident = urlParts[1];
	}else{
		err = "Did not specify room"
	}
	
	if(shouldBeR == 'r'){
		name = ident;
	}else{
		err = 'tricksy, false';
	}
	
	room = {
		name: name,
		err: err
	}
	
	  res.send(room);
});

module.exports = router;
