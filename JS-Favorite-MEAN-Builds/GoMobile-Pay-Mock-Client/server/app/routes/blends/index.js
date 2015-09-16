var router = require('express').Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Blend = mongoose.model('Blend');

module.exports = router;

function isAuthenticatedUser (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.sendStatus(401);
	}
}

// get all Blend
router.get('/', function (req, res, next){
	Blend.find({}).populate('micros reviews').exec()
	.then(
		function (blends){
			res.json(blends);
		}, 
		function (err){
			next(err);
		}
	);
});


//get blend with blendid 
router.get('/:blendid', function (req, res, next){
	Blend.findById(req.params.blendid).populate('micros reviews').exec()
	.then(
		function (blend){
			res.json(blend);
		},
		function (err){
			next(err);
		}
	);
});

//get blend with blendname
router.get('/name/:blendname', function (req, res, next){
	Blend.findOne({name: req.params.blendname}).populate('micros reviews').exec()
	.then(
		function (blend){
			res.json(blend);
		},
		function (err){
			next(err);
		}
	);
});

// creates new blend and returns new blend

router.post('/', function (req, res, next){

	var blend = new Blend(req.body);
	blend.save(function (err){
		res.status(200).send(blend);
	});
});


router.put('/:blendid', isAuthenticatedUser, function (req, res, next){

	if (req.user) {
		Blend.findByIdAndUpdate(req.params.blendid, req.body).exec()
		.then(
			function (blend){
				res.status(200).send(blend);
			},
			function (err){
				console.log("ERROR IS ", err);
				next(err);
			}
		);
	}
});

// delete this blend

router.delete('/:blendid', isAuthenticatedUser, function (req, res, next){
	Blend.findByIdAndRemove(req.params.blendid).exec()
	.then(
		function (){
			res.status(204).send();
		},
		function (err){
			next(err);
		}
	);
});