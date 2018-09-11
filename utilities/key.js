var crypto = require('crypto');

//TODO: FIX INVALID KEY CALLBACK

exports.createKey = function(callback, op){
	
	var sha = crypto.createHash('sha256');
	sha.update(Math.random().toString());
	fin = sha.digest('hex');
	callback(fin);
}
