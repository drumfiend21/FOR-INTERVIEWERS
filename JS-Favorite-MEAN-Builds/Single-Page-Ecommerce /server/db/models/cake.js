var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var schema = new mongoose.Schema({

	name: { type: String, required: true },

	description: String,

	type: { type: String, required: true, enum: cakeTypes },

	storeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Store'
	},
	quantity: { type: Number, default: 1 },

	numOrdered: { type: Number, default: 1},

	images: {
		type: [String],
		default: [
			'http://www.craftsy.com/blog/wp-content/uploads/2013/09/birdseyeview_cake.jpg',
			'http://www.craftsy.com/blog/wp-content/uploads/2013/09/birdseyeview_cake.jpg'
		]
	},

	price: { type: Number, default: 19.99 },

	shape: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Shape',
		required: true
	},

	icing: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Icing',
		required: true
	},

	layers: [{
		position: Number,
    	filling: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Filling'
		}
	}],

	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}]
	
});

var cakeTypes = {
	values: 'stock custom'.split(' '),
	message: 'Validation failed. Must be either "stock" or "custom"'
}

schema.plugin(deepPopulate, {
	populate: {
	    'layers.filling': {
	      select: '_id name storeId'
	    }
	}
});

module.exports = mongoose.model('Cake', schema);