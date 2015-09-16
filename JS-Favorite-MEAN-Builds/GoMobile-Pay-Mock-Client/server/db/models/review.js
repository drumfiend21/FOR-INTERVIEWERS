var mongoose = require ('mongoose');

var reviewSchema = new mongoose.Schema({
	rating: {type: Number, required: true, max: 5, min: 1}, // 1-5 (5 is best)
	blend: {type: mongoose.Schema.Types.ObjectId, ref: 'Blend', required: true}, //not sure if we need blend in reviews, since it's referenced in blends
	comment: {type: String}, // commented review
	// title: {type: String}, //review title
	user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, //user who left the review
	date: {type: Date, default: Date} //date review was created.
});



var Review = mongoose.model('Review', reviewSchema);