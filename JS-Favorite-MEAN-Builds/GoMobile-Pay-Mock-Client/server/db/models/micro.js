var mongoose = require ('mongoose');

var microSchema = new mongoose.Schema({
	name: {type: String, required: true}, //name of veggie
	spice: {type: String, enum: ['mild', 'medium', 'medium-spicy', 'spicy'], required: true}, //spice level
	price: {type: Number, required: true}, //price (if we want to sell by bulk later)
	description: {type: String, required: true},
	image: {type: String, required: true},
	inventory: {type: Number, required: true, min: 0}, //how much we have in stock
});

microSchema.virtual('available').get(function () {
	return this.inventory > 0 ? true : false;
});

var Micro = mongoose.model('Micro', microSchema);
