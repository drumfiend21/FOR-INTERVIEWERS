'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');
var CakeModel = mongoose.model('Cake');
var StoreModel = mongoose.model('Store');
var Promise = require('bluebird');



router.get('/create', function (req, res, next) {
    console.log("you hit test create");
    CakeModel.create({
        name: "Test Cake",
        type : "Custom"
    }, function(err, cake){
        console.log("Test Cake created", cake);
        res.redirect("/");
    });
});


router.get('/:storeId', function (req, res, next) {
    StoreModel.findById(req.params.storeId).exec().then(function (store) {
        return store;
    }).then(function (store) {
        CakeModel.find({storeId: store._id})
            .populate('shape','type description')
            .populate('icing','name description price')
            .populate('filling','name description price')
            .populate('reviews').exec()
            .then(function (cakesArr){
                res.send(cakesArr);
            });
    });
});


router.get('/colors/:storeId', function (req, res, next) {
    StoreModel.findById(req.params.storeId).exec().then(function (store) {
        res.send(store.colorScheme);
    });
});



router.get('/', function (req, res, next) {
    StoreModel.find().exec().then(function (storeArr) {
        res.send(storeArr);
    });
});