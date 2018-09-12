var key = require('./key');

exports.userExists = function(username, db, next){
	var users = db.get('users');
	
	users.find({username:username}, function(e, docs){
		if(!e)next(e, !!docs[0]);
	});
}

exports.createUser = function(username, password, db, next){
	var users = db.get('users');
	
	key.createKey(function(k){
		var session = k;
		
		users.insert({
			username: username,
			password: password,
			session: k,
			subscriptions: []
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

exports.storeChat = function(db, intent, msg){
	var records = db.get('records');
	
	records.find({intent:intent}, function(e, docs){
		if(!!docs[0]){
			records.update({intent:intent}, {
				$push: {
					records: msg
				}
			})
		}else{
			records.insert({
				intent:intent,
				records: [
					msg
				]
			})
		}
	})
}

exports.getChats = function(db, intent, next){
	var records = db.get('records');
	
	records.find({intent:intent}, function(e, docs){
		if(docs[0]){
			const recs = docs[0].records;
			next(e, recs.slice(recs.length - 200) || '');
		}else{
			next('intent does not exist ' + e);
		}
	})
}

exports.storeSubscriptions = function(db, session, subs){
	var users = db.get('users');
	
	users.update({session:session}, {
		$set:{
			subscriptions: subs
		}
	})
}

exports.getSubscriptions = function(db, session, next){
	var users = db.get('users');
	
	users.find({session:session}, function(e, docs){
		if(!e && !!docs[0]){
			next(null, docs[0].subscriptions);
		}else{
			next(e || 'no docs');
		}
	})
}