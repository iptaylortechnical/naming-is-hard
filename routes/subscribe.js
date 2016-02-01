var express = require('express');
var router = express.Router();
var info = require('../utilities/info');

/* GET users listing. */
router.get('/', function(req, res, next) {

	var query = req.query;
	var db = req.db;
	
	if(query && query.phrases && query.session){
		session = query.session;
		phrases = query.phrases;
		
		info.getSessionExists(session, db, function(e, exists){
			if(exists){
				var parts = phrases.split(',');
				req.setSubscriptions(session, parts);
				res.state = 200;
				res.send({
					state: 'ok'
				})
			}else{
				res.send({
					err: "session does not exist"
				})
			}
		})
	}else{
		res.send({
			err: "did not specify"
		})
	}
	
	
});

module.exports = router;
