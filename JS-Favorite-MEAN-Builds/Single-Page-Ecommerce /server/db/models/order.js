var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var schema = new mongoose.Schema({
	customer: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	storeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Store',
		required: true
	},
	total: {
		type: Number,
		required: true
	},
	status: {
		type: String,
		default: 'Created'
	},
	items:[{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Cake'
	}],
	trackingInfo: String,
	orderDate: {
		type: Date,
		default: Date.now
	}
});

schema.plugin(deepPopulate, {
	populate: {
	    'items': 'Cake',
	    'items.layer.filling': {
	      select: '_id name storeId'
	    }
	}
});

module.exports = mongoose.model('Order', schema);