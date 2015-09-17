var mongoose = require('mongoose');

var schema = new mongoose.Schema({

    name: { type: String, required: true },

    description: { type: String, max: 255 },
    
    storeId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Store',
		required: true
	}

});

module.exports = mongoose.model('Shape', schema);