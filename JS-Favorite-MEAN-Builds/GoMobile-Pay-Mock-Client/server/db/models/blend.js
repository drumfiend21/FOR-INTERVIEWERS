'use strict';

var mongoose = require ('mongoose');

var blendSchema = new mongoose.Schema({
	name: {type: String, required: true}, //name of blend e.g. "joe's mega blend"
	micros: [{type: mongoose.Schema.Types.ObjectId, ref: 'Micro'}], //the types of micros stored in array
	reviews: [{type: mongoose.Schema.Types.ObjectId, ref: 'Review'}], //the reviews for this blend stored in array
	price: {type: Number, require: true} //only two prices possible: small or LARGE
});

var Blend = mongoose.model('Blend', blendSchema);
