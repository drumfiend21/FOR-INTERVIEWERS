'use strict';
var router = require('express').Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var Promise = require('bluebird');

var UserModel = mongoose.model('User');

var createNewHash = function (uniqueProperty) {
    var hash = crypto.createHash('sha1');
    hash.update(crypto.randomBytes(256).toString());
    hash.update(uniqueProperty.toString());
    return hash.digest('hex');
};

// router.get('/mock-hash', function (req, res) {
	
// 	var apiSecret = 'sk_1b2fdf74f0921837adc6d83e894f4999dde056cb'

// 	//1.  EVERYTHING BELOW IS WITHIN YOUR ROUTE THAT SERVES THE PAGE CONTAINING THE CHECKOUT BUTTON


//     //generate timestamp (nonce value for hash)
//     var timestamp = Date.now()


//     var createTransactionHash = function (secret, timestamp) {
//        var hash = crypto.createHash('sha1');
//        hash.update(timestamp.toString());
//        hash.update(secret.toString());
//        return "th_"+hash.digest('hex');
//     };
    
//     //generate hash
// 	console.log("OUR MOCK HASH", createTransactionHash(apiSecret,timestamp))




// })


router.post('/', function (req, res) {
	var info = req.body.signupInfo
	console.log("you're in the sign up post route")
	console.log("sign up form received in route", info)
	// console.log("createTchoPayUserId function,",createTchoPayUserId)
	// console.log("firing function,", createTchoPayUserId(info))
	
	
	UserModel.create(info, function (err, user) {
		if (err) return next(err);
		// saved!
		user.tchoPayId = "id_"+createNewHash(user._id);
		user.apiKey = "pk_"+createNewHash(user._id);
		user.apiSecret = "sk_"+createNewHash(user._id);
		user.webAppServerSecret = "wask_"+createNewHash(user._id);
		user.save()
		console.log("user created in database!")
		res.send(user)
	})



	// createTchoPayUserId(info).then(function (info){
	// 	console.log("created tchoPayUserId,", info)
	// 	return createApiKey(info)
	// })
	// .then(function (info){
	// 	console.log("created apiKey,", info)
	// 	return createApiSecret(info)
	// })
	// .then(function (info){
	// 	console.log("created apiSecret,", info)
	// 	return UserModel.create(info, function (err, user) {
	// 	  if (err) return handleError(err);
	// 	  // saved!
	// 	  console.log("user created in database!")
	// 	  res.send(user)
	// 	})
		
	// })
	// res.sendStatus(200);
});
