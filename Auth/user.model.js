var mongoose = require('mongoose');
var crypto = require('crypto');
mongoose.connect('mongodb://localhost/auth');
mongoose.connection.on('error', console.error.bind(console, 'database connection error:'));

var userSchema = mongoose.Schema({
	username: String,
	hashedPassword: String,
	salt: String
});


userSchema.virtual('password').set(function (password) {
	var saltBuffer = crypto.randomBytes(16),
    salt = saltBuffer.toString('base64');
    this.salt = salt;

	var hashedBuffer = crypto.pbkdf2Sync(password, salt, 1000, 16),
    hashed = hashedBuffer.toString('base64');
    this.hashedPassword = hashed;
});

userSchema.methods.authenticate = function(password){

	var salty = this.salt;
	var hashedBuffer = crypto.pbkdf2Sync(password, salty, 1000, 16),
    hashed = hashedBuffer.toString('base64');
    
    if(hashed === this.hashedPassword) {
    
    	return true
    }else{
    
    	return false

    }
    	
}




module.exports = mongoose.model('User', userSchema);