var key = require('./key');

exports.userExists = function(username, db, next){
	var users = db.get('users');
	
	users.find({username:username}, function(e, docs){
		next(e, !!docs[0]);
	});
}

exports.createUser = function(username, password, db, next){
	var users = db.get('users');
	
	key.createKey(function(k){
		var session = k;
		
		users.insert({
			username: username,
			password: password,
			session: k
		});
		
		next(null, session);
		
	})
	
}

exports.getSessionExists = function(session, db, next){
	var users = db.get('users');
	
	users.find({session:session}, function(e, docs){
		next(e, !!docs[0]);
	})
}

exports.getUserFromSession = function(session, db, next){
	var users = db.get('users');
	
	users.find({session:session}, function(e, docs){
		next(e, docs[0].username);
	})
}

exports.getSessionFromUser = function(username, password, db, next){
	var users = db.get('users');
	
	users.find({username:username, password:password}, function(e, docs){
		
		if(docs[0]){
			next(null, docs[0].session);
		}else{
			next("incorrect");
		}
		
	})
}