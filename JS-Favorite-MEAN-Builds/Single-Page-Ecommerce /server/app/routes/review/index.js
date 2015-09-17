'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var CakeModel = mongoose.model('Cake');
var StoreModel = mongoose.model('Store');
var ReviewModel = mongoose.model('Review');
var Promise = require('bluebird');


router.get('/unwritten', function (req, res, next) {
    ReviewModel.find({user: req.user._id, reviewCompleted: false})
        .exec().then(function (reviewArr) {
        res.send(reviewArr);
    });
});


router.get('/:storeId', function (req, res, next) {
    StoreModel.findById(req.params.storeId).exec().then(function (store) {
        return store;
    }).then(function (store) {
    	CakeModel.find({ storeId: store._id }).exec().then(function (cakes) {
    		res.send(cakes);
    	});
    });
});



router.get('/', function (req, res, next) {
    StoreModel.find().exec().then(function (storeArr) {
        res.send(storeArr);
    });
});