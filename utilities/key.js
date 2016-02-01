var crypto = require('crypto');

//TODO: FIX INVALID KEY CALLBACK

exports.createKey = function(callback, op){
	
	var sha = crypto.createHash('sha256');
	sha.update(Math.random().toString());
	fin = sha.digest('hex');
	callback(fin);
}

//TODO: SAFETY CHECK IN MONGO
//THIS CODE IS HORRIBLE. UGH.

// exports.createKey = function(callback, op){
//
// 	var sha = crypto.createHash('sha256');
// 	sha.update(Math.random().toString());
// 	fin = sha.digest('hex');
// 	callback(fin);
//
// 	pg.connect('postgres://localhost:5432', function(err, client, done){
// 		if(!op){
// 			var sha = crypto.createHash('sha256');
// 			sha.update(Math.random().toString());
// 			fin = sha.digest('hex');
// 		}else{
// 			fin = op;
// 		}
//
// 		checkKey(fin, client, function(good){
// 			if(good){
// 				callback(fin);
// 			}else{
// 				this.createKey(function(thekey){
// 					callback(thekey);
// 				});
// 			}
// 		});
//
// 	});
//
// }
//
// checkKey = function(test, client, callb){
// 	var query = client.query('SELECT sessionid FROM "public"."users" WHERE ("sessionid" = \'' + test + '\')');
// 	results = [];
//     query.on('row', function(row) {
//         results.push(row);
//     });
// //
// //     // After all data is returned, close connection and return results
//     query.on('end', function() {
// 			if(!results[0]){
// 				callb(true);
// 			}else{
// 				callb(false);
// 			}
//     });
// }