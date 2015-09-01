'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var Promise = require('bluebird');
var mongoose = require('mongoose');

var CakeModel = mongoose.model('Cake');

var IcingModel = mongoose.model('Icing');
var FillingModel = mongoose.model('Filling');
var ShapeModel = mongoose.model('Shape');
var ReviewModel = mongoose.model('Review');





router.get('/', function (req, res, next) {
    
    var getData = function(model){
 	 	return model.find({storeId : req.storeId}).exec()
    
    }

    Promise.all([getData(FillingModel), getData(IcingModel), getData(ShapeModel), getData(ReviewModel), getData(CakeModel)])
    .then(function(ingredients){

    	res.send(ingredients)

    })
});

router.post('/', function (req, res, next){

	console.log("hit cake post route")
	var cake = req.body
	cake.storeId = req.storeId;
	delete cake.selectedNumLayers


	CakeModel.create(cake, function (err, cake) {
		if (err) return next(err);
		console.log("custom cake was saved to database", cake)
		res.send(cake);

	})

})




