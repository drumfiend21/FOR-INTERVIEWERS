'use strict';
var router = require('express').Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var Promise = require('bluebird');

var UserModel = mongoose.model('User');

var ensureAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.status(401).end();
    }
};


//These routes are fully authenticated.  
//They check the user logged in the server against
//the user being queried for from the front end


router.get('/:tchoPayId', ensureAuthenticated, function (req, res){
	//Auth Check: is this the user logged in server
	if(req.user.tchoPayId === req.params.tchoPayId){
		var account = req.params.tchoPayId
		UserModel.findOne({tchoPayId : account }).exec().then(function (account) {
			res.send(account);
		});
	}else{
		res.sendStatus(403);
	}
});


router.put('/edit', ensureAuthenticated, function (req, res){
	//Auth Check 1: is this the user logged in server
	if(req.user.tchoPayId === req.body.tchoPayId){
	
		var rewriteUserDocument = function(property){
			UserModel.findOne({tchoPayId: req.body.tchoPayId}).exec().then(function (user){
				//Auth Check 2: confirm supplied password before allowing modification of properties to database
				if (user.correctPassword(req.body.password)) {
					if(property === "password"){
						user.password = req.body.newPasswordOne
					}
					else{
						user[property] = req.body[property]
					}
					user.save(function(err, user){
						if(err) return next(err)
						res.send(user);
					})
				}else{
					res.send({error:"invalid password"})
				}
			})
		}
		if(UserModel.whiteList.indexOf(req.body.property) > -1) {
			
			rewriteUserDocument(req.body.property)

		}else{
			res.sendStatus(403);
		}
	}else{
		res.sendStatus(403)
	}
})