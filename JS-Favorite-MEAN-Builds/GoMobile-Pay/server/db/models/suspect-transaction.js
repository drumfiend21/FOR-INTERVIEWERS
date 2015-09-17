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
    webAppTransactionId: {
        type: String
    },
    buyerAccount: {
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
    chargeAmount: {
        type: Number
    },

    location: {
        type: Object
    },
    timestamp:{
        type: Number
    },
    ourTransactionId:{
        type: String
    },
    outcome:{
        type: String
    },
    suspect: {
        type: Boolean
    }
});

schema.statics.createOurTransactionId = createOurTransactionId;

mongoose.model('SuspectTransaction', schema);