var express = require('express');
var router = express.Router();
var info = require('../utilities/info');
var username;
var password;
var session;
var err;

function sendPackage(res){
	
	var data = {
		username:username,
		session:session,
		err:err
	}
	
	res.send(data);
}

// router.get('/', function(req, res, next){
// 	res.send(req.cookies);
// })

/* GET users listing. */
router.post('/', function(req, res, next) {

	var query = req.body;
	var db = req.db;

	if(query){
		username = query.username;
		console.log(username);
		password = query.password;

		info.userExists(username, db, function(e, exists){
			console.log('user exists: ' + exists);
			if(exists){
				info.getSessionFromUser(username, password, db, function(e, sesh){
					if(!e){
						session = sesh;

						res.cookie("session", session);
						
						sendPackage(res);
					}else{
						err = e;
						sendPackage(res);
					}
				})
			}else{
				info.createUser(username, password, db, function(e, sesh){
					session = sesh;
					sendPackage(res);
				})
			}
		})

	}else{
		err = "did not specify username and password";
		sendPackage(res);
	}

});

module.exports = router;
