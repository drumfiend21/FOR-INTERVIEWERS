'use strict';
var router = require('express').Router();
module.exports = router;

var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var deepPopulate = require('mongoose-deep-populate');
var CakeModel = mongoose.model('Cake');

var IcingModel = mongoose.model('Icing');
var FillingModel = mongoose.model('Filling');
var ShapeModel = mongoose.model('Shape');


var getAll = function(storeId, model) {
    return model.find({storeId: storeId}).exec();
}


router.get('/', function (req, res, next) {
    Promise.all([getAll(req.storeId, IcingModel),
                getAll(req.storeId, FillingModel),
                getAll(req.storeId, ShapeModel),
                CakeModel.find({type: 'stock', storeId: req.storeId})
                    .populate('shape icing layers')
                    .deepPopulate('layers.filling')
                    .exec()
                ]).then(function (returnArray) {
                    res.send(returnArray);
                }, function (err) {
                    return next(err);
                });
});

router.put('/:id', function (req, res, next) {
    CakeModel
        .findByIdAndUpdate(req.params.id, {$set: req.body}, {upsert: false})
        .exec().then(function (err, cake) {
            res.send(cake);
    }, function (err) {
        return next(err);
    });
});

router.delete('/:id', function (req, res, next) {
    CakeModel.findByIdAndRemove(req.params.id).exec().then(function (data) {
        res.sendStatus(200);
    }, function (err){
        res.send(400);
    });
});

router.post('/', function (req, res, next) {
    console.log('CREATE', req.body);
    CakeModel.create(req.body).then(function (cake) {
        res.send(cake);
    }, function (err) {
        return next(err)
    });
});

