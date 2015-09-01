var mongoose = require('mongoose');

var schema = new mongoose.Schema({

    name: { type: String, required: true },

	description: { type: String, max: 255 },

	color: {type: String},

    price: { type: Number, required: true },

    storeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Store',
		required: true
	},

    reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}]

});

module.exports = mongoose.model('Filling', schema);