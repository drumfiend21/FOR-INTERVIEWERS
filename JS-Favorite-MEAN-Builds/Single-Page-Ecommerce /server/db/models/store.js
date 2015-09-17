var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate');

var schema = new mongoose.Schema({
	name: { type: String, required: true, unique: true },

	description: { type: String, max: 255 },

	thumbnail: {
		type: String,
		default: 'https://placeholdit.imgix.net/~text?txtsize=33&txt=200%C3%97150&w=200&h=150'
	},
	address: { type: String, max: 255 },
	phone: { type: String, max: 10 },
    owner: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},

	employees: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}],
	reviews: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Review'
	}],
	colorScheme: {
		type: [String],
		default: ['#F3A2C6', '#F90101', '#F2B50F', '#00933B']
	}
});

module.exports = mongoose.model('Store', schema);