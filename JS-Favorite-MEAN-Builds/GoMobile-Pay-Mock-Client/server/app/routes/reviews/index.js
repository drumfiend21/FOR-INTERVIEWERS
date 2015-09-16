var router = require('express').Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Blend = mongoose.model('Blend');
var User = mongoose.model('User');
var Order = mongoose.model('Order');
var Review = mongoose.model('Review');

module.exports = router;


// get all reviews
router.get('/', function (req, res, next){
	Review.find({}).exec()
	.then(
		function (review){
			res.json(review);
		}, 
		function (err){
			next(err);
		}
	);
});

//get review with orderid 
router.get('/:reviewid', function (req, res, next){
	Review.findById(req.params.reviewid).exec()
	.then(
		function (review){
			res.json(review);
		},
		function (err){
			next(err);
		}
	);
});

// we need to build admin only posting routes
// creates new review and returns new review
router.post('/', function (req, res, next){
	var review = new Review(req.body);
	review.save(function(err){
		res.status(200).send(review);
	});
}); 

//edits this order
router.put('/:reviewid', function (req, res, next){
	Review.findByIdAndUpdate(req.params.reviewid, req.body).exec()
	.then(
		function (review){
			res.status(200).send(review);
		},
		function (err){
			next(err);
		}
	);
});

// delete this review
router.delete('/:reviewid', function (req, res, next){
	Review.findByIdAndRemove(req.params.reviewid).exec()
	.then(
		function (){
			res.status(204).send();
		},
		function (err){
			next(err);
		}
	);
});
