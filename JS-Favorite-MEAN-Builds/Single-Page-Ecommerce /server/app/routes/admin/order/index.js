'use strict';
var router = require('express').Router();
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var deepPopulate = require('mongoose-deep-populate');
var OrderModel = mongoose.model('Order');
var ReviewModel = mongoose.model('Review');
var CakeModel = mongoose.model('Cake');

router.get('/', function (req, res, next) {
	// status: {$inc: ['Created','Processing','Completed']} -- 
    OrderModel.find({storeId: req.storeId})
        .populate('items').exec().then(function (orderArr) {
        res.send(orderArr);
    }, function (err) {
        return next(err);
    });
});

router.put('/:orderId/complete', function (req, res, next) {
	Order.findByIdAndUpdate(req.params.orderId, {$set: { status: req.body.status }})
		.populate('items')
		.exec()
		.then(function (order) {
			console.log('USER ID', req.user._id);
			console.log('COMPLETED ORDER', order);
			order.items.forEach( function (item) {
				
				splitItemIntoReviews(item, order.customer);
			});
		}).then(function () {
			res.send('YAY');

		});
});

var splitItemIntoReviews = function (item, customerId) {

	var createOpenReviews = function(array) {
		console.log('ITEM ID ARRAY', array);
		array.forEach(function (item) {
			var nRev = new ReviewModel();
			nRev.user = customerId;
			nRev.productId = item;
			return nRev.save();
		});
	}

		var fillArray = [item._id, item.icing];
		item.layers.forEach(function (layer) {
			var exists = false;
			for (var i = 0; i < fillArray.length ; i++) {
				if(layer.filling.toString() === fillArray[i]) {
					fillArray[i]
					exists = true;
				}
			}
			if(!exists) fillArray.push(layer.filling.toString());
		});
		return createOpenReviews(fillArray);
}