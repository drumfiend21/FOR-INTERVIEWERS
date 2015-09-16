var router = require('express').Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Micro = mongoose.model('Micro');

module.exports = router;

function hasAdminPower(req, res, next){

	if (req.user.admin === true) next();
	else res.status(403).end();
}

// get all Micro
router.get('/', function (req, res, next){
	Micro.find({}).exec()
	.then(
		function (micros){
			res.json(micros);
		}, 
		function (err){
			next(err);
		}
	);
});

//get micro with microid 
router.get('/:microid', function (req, res, next){
	Micro.findById(req.params.microid).exec()
	.then(
		function (micro){
			res.json(micro);
		},
		function (err){
			next(err);
		}
	);
});

//get micro with microname
router.get('/name/:microname', function (req, res, next){
	Micro.findOne({name: req.params.microname}).exec()
	.then(
		function (micro){
			res.json(micro);
		},
		function (err){
			next(err);
		}
	);
});

//get micro with spice level

router.get('/spice/:spicelevel', function (req, res, next){
	Micro.find({spice: req.params.spicelevel}).exec()
	.then(
		function (micro){
		res.json(micro);
	}, 
		function (err){
		next(err);
		}
	);
});


// we need to build admin only posting routes
// creates new micro and returns new micro
router.post('/', hasAdminPower, function (req, res, next){
	var micro = new Micro(req.body);
	micro.save(function(err){
		res.status(200).send(micro);
	});
}); 


//edits this micro
router.put('/:microid', hasAdminPower, function (req, res, next){
	Micro.findByIdAndUpdate(req.params.microid, req.body).exec()
	.then(
		function (micro){
			res.status(200).send(micro);
		},
		function (err){
			next(err);
		}
	);
});

// delete this micro
router.delete('/:microid', hasAdminPower, function (req, res, next){
	Micro.findByIdAndRemove(req.params.microid).exec()
	.then(
		function (){
			res.status(204).send();
		},
		function (err){
			next(err);
		}
	);
});
