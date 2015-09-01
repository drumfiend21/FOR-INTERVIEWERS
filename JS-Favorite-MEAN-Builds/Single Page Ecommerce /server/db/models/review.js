var mongoose = require('mongoose');

var schema = new mongoose.Schema({

	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

    productId: { type: String },

    category: { type: String},

    shortSummary: { type: String},

    description: { type: String},
    
    stars: {
    	type: Number,
    	min: 1,
    	max: 5
    },

    date: {
        type: Date,
        default: Date.now
    },

    reviewCompleted: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('Review', schema);