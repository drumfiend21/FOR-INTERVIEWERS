'use strict';
var crypto = require('crypto');
var mongoose = require('mongoose');


var createOurTransactionId = function (uniqueProperty) {
    var hash = crypto.createHash('sha1');
    hash.update(uniqueProperty.toString());
    hash.update(crypto.randomBytes(256).toString());
    return "ti_"+hash.digest('hex');
};


var schema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    buyerAccount: {
        type: String
    },
    sellerAccount: {
        type: String
    },
    chargeAmount: {
        type: Number
    },
    location: {
        type: Object
    },
    timestamp:{
        type: Number
    },
    outcome:{
        type: Object
    },
    outcomeHash: {
        type: String
    },
    vendorConfirmed:{
        type: Boolean
    },
    suspect: {
        type: Boolean
    }
});

schema.statics.createOurTransactionId = createOurTransactionId;

mongoose.model('Transaction', schema);