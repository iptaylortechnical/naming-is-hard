var express = require('express');
var router = express.Router();
var info = require('../utilities/info');

/* GET users listing. */
router.get('/', function(req, res, next) {

	var query = req.query;
	var db = req.db;
	
	if(query && query.session){
		session = query.session;
		
		info.getSessionExists(session, db, function(e, exists){
			if(exists){
				info.getSubscriptions(db, session, function(e, result){
					if(!e && !!result){
						res.state = 200;
						res.send({
							state: 'ok',
							subscriptions:result
						})
					}else{
						res.send({
							err: e || 'no result'
						})
					}
				});
				
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
