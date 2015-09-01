var mongoose = require('mongoose');
var db = mongoose.connection;

// Make sure your Mongo database is running!
mongoose.connect('mongodb://localhost/assessjs');
db.on('error', console.error.bind(console, 'MongoDb connection error: '));

var ArticleSchema = new mongoose.Schema({

	title: 
	 {
		type: String, 
		required: "Validation Failed"
	},
	body: 
	{
		type: String, 
		required: "Validation Failed"
	},
	tags: 
	{
		type: Array,
		get: stringify
	}

});

function stringify (array){
	return array.toString();
}


ArticleSchema.methods.asJSON = function(){
	return JSON.stringify(this)
}



ArticleSchema.statics.findByTitle = function(title, cb){
	this.findOne({title: title}, cb)
}


var Article = mongoose.model('Article', ArticleSchema);




module.exports = Article;


