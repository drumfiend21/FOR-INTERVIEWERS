var router = require('express').Router();
module.exports = router;
var body = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var UserModel = mongoose.model('User');

var StoreModel = mongoose.model('Store');
var IcingModel = mongoose.model('Icing');
var ShapeModel = mongoose.model('Shape');
var FillingModel = mongoose.model('Filling');

router.post('/store', function (req, res, next) {
	var d = req.body;
    console.log("req body create store", d)
    var store = new StoreModel();
    store.name = d.name;
    store.description = d.description;
    store.owner = req.user._id;
    //ADD MORE FOR ALL OTHER DATA POINTS
    store.save(function (err, store) {
    	UserModel.findByIdAndUpdate(req.user._id, {$set: {storeId: store._id, admin: true, adminOwner: true}})
    		.exec().then(function (user) {

	    	createDefaults(store._id).then(function (data){
	    		res.send(store);
	    	});
    	});
    });
});


var createDefaults = function(storeId) {
	var shapeArr = [
		{name: 'Round', description: 'Round Cake Shape Description', storeId: storeId },
		{name: 'Square', description: 'Square Cake Shape Description', storeId: storeId },
		{name: 'Rectangle', description: 'Rectangle Cake Shape Description', storeId: storeId }];

	var fillingArr = [
		{name: 'Chocolate', description: 'Chocolate description', price: 20, storeId: storeId },
		{name: 'Vanilla', description: 'Vanilla description', price: 30, storeId: storeId },
		{name: 'Strawberry', description: 'Strawberry description', price: 40, storeId: storeId }];

    var icingArr = [
    	{name: 'Chocolate', description: 'Chocolate description', price: 5, storeId: storeId },
    	{name: 'Vanilla', description: 'Vanilla description', price: 10, storeId: storeId },
    	{name: 'Strawberry', description: 'Strawberry description', price: 15, storeId: storeId }];

    var seedData = function(model, array) {
    	return model.create(array);
    }

    return Promise.all([
    	seedData(ShapeModel, shapeArr),
    	seedData(IcingModel, icingArr),
    	seedData(FillingModel, fillingArr)]);

}