var express = require('express');
var router = express.Router();
var info = require('../utilities/info');

/* GET users listing. */
router.get('/', function(req, res, next) {

res.cookie("session", "", { expires: new Date() });
	
});

module.exports = router;
