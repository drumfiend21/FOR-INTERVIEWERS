'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var Cake = mongoose.model('Cake');

router.get('/:cakeid', function (req, res, next) {

	Cake.findById(req.params.cakeid, function (err, cake) {
		if(err) return next(err);
		res.send(cake);
	});

});


router.get('/store/:storeId', function (req, res, next) {

	Cake.find({ storeId : req.params.storeId }).exec().then(function (cakes) {
		res.send(cakes);
	});

});



router.get('/', function (req, res, next) {
    
    Cake.find().populate('storeId').exec().then(function (allcakes) {
        res.send(allcakes);
    });

});


router.post('/many', function (req, res, next){

	console.log("hit store many cakes post route")

	var cakes = req.body
	console.log(cakes)


	var storeCake = function(cakeArr){
		var cakePromises = [];

		cakeArr.forEach(function(cake){
			cakePromises.push(Cake.create(cake))
		})

		console.log(cakePromises)
		
		return cakePromises
	}
	
	Promise.all(storeCake(cakes))
    .then(function(cakes){

    	console.log("custom cakes stored in database", cakes)
    	res.send(cakes)

    })

})