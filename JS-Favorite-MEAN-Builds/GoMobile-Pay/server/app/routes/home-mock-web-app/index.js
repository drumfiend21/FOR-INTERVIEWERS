'use strict';
var router = require('express').Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var Promise = require('bluebird');



router.get('/', function(req, res, next) {
		console.log("you've hit the mock-web-app")
		res.render('index', function(err, html){
			res.send(html)
		})
	
});
