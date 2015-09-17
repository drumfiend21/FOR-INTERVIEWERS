'use strict';
var router = require('express').Router();
module.exports = router;

var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var FillingModel = mongoose.model('Filling');
var IcingModel = mongoose.model('Icing');
var ShapeModel = mongoose.model('Shape');

var models = { 
    filling: FillingModel,
    icing: IcingModel,
    shape: ShapeModel }

router.get('/:item', function (req, res, next) {
    models[req.params.item].find({storeId: req.storeId}).exec().then(function (fillingArr) {
        res.send(fillingArr);
    }, function (err) {
        return next(err);
    });
});

router.put('/:item/:id', function (req, res, next) {
    models[req.params.item]
        .findByIdAndUpdate(req.params.id, {$set: req.body}, {upsert: false})
        .exec().then(function (err, filling) {
            res.send(filling);
    }, function (err) {
        return next(err);
    });
});

router.delete('/:item/:id', function (req, res, next) {
    models[req.params.item]
        .findByIdAndRemove(req.params.id).exec().then(function (data) {
        res.sendStatus(200);
    }, function (err){
        res.send(400);
    });
});

router.post('/:item', function (req, res, next) {
    req.body.storeId = req.storeId;
   console.log("you hit the post route for adding an icing") 
    models[req.params.item].create(req.body).then(function (filling) {
        res.send(filling);
    }, function (err) {
        return next(err)
    });
});