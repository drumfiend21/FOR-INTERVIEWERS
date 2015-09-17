'use strict';
var router = require('express').Router();
module.exports = router;

var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var deepPopulate = require('mongoose-deep-populate');
var UserModel = mongoose.model('User');
var StoreModel = mongoose.model('Store');
var textSearch = require('mongoose-text-search');


router.post('/search', function (req, res, next) {
    UserModel.find(req.body, function (err, user){
        res.send(user);
    });
});

router.put('/employ', function (req, res, next) {
    UserModel.findByIdAndUpdate(req.body.id, {$set: {admin: true, storeId: req.storeId}})
        .exec().then(function (user) {
        StoreModel.findByIdAndUpdate(req.storeId, {$push: {'employees': user._id}})
            .exec().then(function (store) {
            console.log('SUCCESSFUL');
            console.log(user);
            console.log(store);
            res.send(user)
        });
    });
});

router.put('/:id', function (req, res, next) {
    UserModel.findByIdAndUpdate(req.params.id, {$set: {admin: false}})
        .exec().then(function (user) {

        StoreModel.findByIdAndUpdate(req.storeId, {$pull: {'employees': user._id}})
            .exec().then(function (store) {

        res.send(user);
        });
    }, function (err) {
        return next(err);
    });
});

router.get('/', function (req, res, next) {
    UserModel.find({admin: true, storeId: req.storeId}).exec().then(function (userArr) {
        res.send(userArr);
    }, function (err) {
        return next(err);
    });
});

