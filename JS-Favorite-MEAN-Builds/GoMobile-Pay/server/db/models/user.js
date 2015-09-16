'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    email: {
        type: String
    },
    phone: {
        type: String
    },
    callbackUrl: {
        type: String
    },
    password: {
        type: String
    },
    sellerAccount: {
        type: String
    },
    merchantId: {
        type: String
    },
    tchoPayId: {
        type: String
    },
    description: {
        type: String
    },
    salt: {
        type: String
    },
    apiKey: {
        type: String
    },
    apiSecret: {
        type: String
    },
    webAppServerSecret: {
        type: String
    },
    webAppDomain:{
        type: String
    }

});

// generateSalt, encryptPassword and the pre 'save' and 'correctPassword' operations
// are all used for local authentication security.
var generateSalt = function () {
    return crypto.randomBytes(16).toString('base64');
};

var encryptPassword = function (plainText, salt) {
    var hash = crypto.createHash('sha1');
    hash.update(plainText);
    hash.update(salt);
    return hash.digest('hex');
};


schema.statics.whiteList = ["merchantId", "webAppDomain", "phone","password","email","description","callbackUrl","sellerAccount"]

schema.method('toJSON', function(){

    var user = this.toObject()
    delete user.password
    delete user.salt
    return user

})

schema.pre('save', function (next) {

    if (this.isModified('password')) {
        this.salt = this.constructor.generateSalt();
        this.password = this.constructor.encryptPassword(this.password, this.salt);
    }

    next();

});

schema.statics.generateSalt = generateSalt;
schema.statics.encryptPassword = encryptPassword;

schema.method('correctPassword', function (candidatePassword) {
    return encryptPassword(candidatePassword, this.salt) === this.password;
});

mongoose.model('User', schema);