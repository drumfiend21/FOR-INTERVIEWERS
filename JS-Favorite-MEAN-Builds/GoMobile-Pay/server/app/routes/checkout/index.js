'use strict';
var router = require('express').Router();
var crypto = require('crypto');
var mongoose = require('mongoose');
module.exports = router;
var _ = require('lodash');
var body = require('body-parser');
var Promise = require('bluebird');
var request = require('request');

var UserModel = mongoose.model('User');
var TransactionModel = mongoose.model('Transaction');
var SuspectTransactionModel = mongoose.model('SuspectTransaction');

var createOutcomeHash = function(outcome, secret, timestamp){
	var hash = crypto.createHash('sha1');
  	hash.update(outcome.toString());
  	hash.update(timestamp.toString());
  	hash.update(secret.toString());
  	return "oh_"+hash.digest('hex');
}

var recreateTransactionHash = function(secret, timestamp){
  var hash = crypto.createHash('sha1');
  hash.update(timestamp.toString());
  hash.update(secret.toString());
  return "ti_"+hash.digest('hex');
}

router.post('/validate', function (req, res){

	//TO DO: Sanitize all data coming from req.body
	//currently NOT sanitized

	//Declare variables in route scope for error and success handlers
	var paymentSuccessObj = {}
	var transactionInProgressId
	var webAppHashValError
	var paymentSuccess
	var paymentFail
	var tchoTchoServerError
	var approvedFail
	var apiSecretFail
	var domainError	
	var apiKeyMongoLookupFail
	var deleteTransactionMongoFail
	var deleteTransaction

	UserModel.findOne({apiKey : req.body.transactionObject.apiKey }).exec().then(function (account) {
	
		//Authenticate Browser Domain		
		if(req.body.browserDomain === account.webAppDomain){
			
			//recreate hash from database apiSecret, given timestamp
			var recreatedHash = recreateTransactionHash(account.apiSecret, req.body.transactionObject.timestamp)

			//Authenticated by Hash Cryptography (Hash Recreation and Comparison)
			if(recreatedHash === req.body.transactionObject.transactionHashValue){
				
				var transactionDocument = {
				    user: account._id,
				    buyerAccount: req.body.transactionObject.buyerAccount,
				    sellerAccount: account.sellerAccount,
				    chargeAmount: req.body.transactionObject.chargeAmount,
				    location: req.body.transactionObject.location,
				    timestamp: req.body.transactionObject.timestamp,				  	
				    outcome: "",
				    vendorConfirmed: false,
				    suspect: false
				}

				TransactionModel.create(transactionDocument, function (err, transactionDocumentInDatabase) {
					//TO DO write sanitation.  This will prevent an error from ever happening on document save.
					if(err) return next(err)

					//store transactionId in case of later error outside scope
					transactionInProgressId = transactionDocumentInDatabase._id

					//Submit Transaction to TchoTcho
					//   this will have to be edited as we learn their process

					var objectToTchoTcho = {
							buyerAccount: req.body.transactionObject.buyerAccount,
							pin : req.body.transactionObject.pin,
							chargeAmount: transactionDocumentInDatabase.chargeAmount,
							sellerAccount : transactionDocumentInDatabase.sellerAccount,
							transactionHashValue: req.body.transactionObject.transactionHashValue,
							outcomeHash : null,
							outcome: null

					}

					//CALL TCHOTCHO 
					//(imagine call to tcho tcho has happened)

					var tchoTchoProcessing = function (){
						console.log("INITIATING TRANSACTION WITH BANK .....")
					}

					setTimeout(tchoTchoProcessing, 2000);

					var fakeTchoTchoProcess = function(){
						//assume rest-soap conversion has taken place
						//assume soap-rest conversion has taken place

						objectToTchoTcho.outcome = "1002";

						//generate outcome hash to send to web app
						transactionDocumentInDatabase.outcome = objectToTchoTcho.outcome
						transactionDocumentInDatabase.outcomeHash = createOutcomeHash(objectToTchoTcho.outcome, account.apiSecret, req.body.transactionObject.timestamp)
						//save document to database
						transactionDocumentInDatabase.save()
						
						var outcomeHashObject = {
							key: objectToTchoTcho.outcome,
							hashed: transactionDocumentInDatabase.outcomeHash,
							timestamp: transactionDocumentInDatabase.timestamp,
							confirmed: false
						}
						
						console.log("RECEIVED TRANSACTION OUTCOME FROM BANK");
						//complete route (Success)
						res.send(outcomeHashObject)
					}
					setTimeout(fakeTchoTchoProcess, 7000)

				})

			}else{
				//HASH VAL ERROR
				webAppHashValError = true;
				
			}

			
		}else{
			//BROWSER DOMAIN ERROR 
			

			domainError= true;
		}

		//DELETE TRANSACTION DOCUMENT
		if(deleteTransaction){
			//Look up transaction in our database and delete it
			TransactionModel.findByIdAndRemove(transactionInProgressId).exec().then(function (account) {
				
				var webAppConfirmationError = true
				var nullifyTransaction = true;

				return next(err)

			})
			.catch(function(e) {
		    //DELETE COMPLETED TRANSACTION DUE TO WEB APP CONFIRMATION FAIL LOOKUP FAILED

		    	deleteTransactionMongoFail = true;
				return next(err)
			});
		}

			
		//ERROR HANDLERS
		if(domainError || apiSecretFail || approvedFail || webAppHashValError  || tchoTchoServerError || webAppConfirmationError){

			//API SECRET ERROR response 
			//Sanitize and Store to database with label FRAUD
			
			var suspectTransactionDocument = {
				   
				    webAppTransactionId: req.body.transactionObject.webAppTransactionId,
				    buyerAccount: req.body.transactionObject.buyerAccount,
				    sellerAccount: account.sellerAccount,
				    merchantId: account.merchantId,
				    tchoPayId: account.tchoPayId,
				    chargeAmount: req.body.transactionObject.chargeAmount,
				    itemDescription: req.body.transactionObject.itemDescription,
				    location: req.body.transactionObject.location,
				    timestamp: req.body.transactionObject.timestamp,
				    //TO DO set these properties
				    outcome: null,
				    nullifyTransaction: false

			}	

			SuspectTransactionModel.create(fraudulentTransactionDocument, function (err, suspectTransactionDocumentInDatabase) {
				if(err) return next(err)

				//create ourTransactionId for this suspect transaction document
				if(webAppConfirmationError) suspectTransactionDocumentInDatabase.nullifyTransaction = true;

				suspectTransactionDocumentInDatabase.ourTransactionId = suspectTransactionDocumentInDatabase.createOurTransactionId(suspectTransactionDocumentInDatabase._id);
				suspectTransactionDocumentInDatabase.outcome = suspectOutcome
				suspectTransactionDocumentInDatabase.save();

				//send merchant error response (bad api secret or domain)
				var errorObject = {
					merchantError: true,
					//TO DO: this will need to be updated with the tchotcho api
					paymentError: {
						key: false,
						pinError: false,
						accountError: false
					}
				}
				res.send(apiKeyErrorObject)

			})
		}


	})

// .catch(function(e) {
// 	    //API KEY LOOKUP FAILED
// 	    apiKeyMongoLookupFail = true
// 	    return next(err)

// 	});

	if(apiKeyMongoLookupFail || deleteTransactionMongoFail ){

				//TO DO: reassign signifiers for these two errors
				var lookupErrorObject = {
					ourFault : false,
					merchantError: true,
					//this will need to be updated with the tchotcho api
					paymentError: {
						key: false,
						pinError: false,
						accountError: false
					}
				}
				if(deleteTransactionMongoFail) lookupErrorObject.ourFault = true
				res.send(lookupErrorObject)
	}
});

router.post('/confirm-transaction', function (req, res){
	//1. TO DO: Sanitize value being searched

	var confirmTransactionOutcomeObject = req.body
	
	// 2. find transaction to confirm receipt
	TransactionModel.findOne({timestamp : req.body.timestamp}).exec().then(function (transaction) {
		if(transaction){

			//3. find user account for transaction to rehash
			UserModel.findOne({ _id : transaction.user }).exec().then(function (account) {

				//4. authenticate by Hash Cryptography (Hash Recreation and Comparison)
				var recreatedHash = createOutcomeHash(req.body.key, account.apiSecret, req.body.timestamp)

				if(recreatedHash === req.body.hashed){

			  		//5. set confirmed true and send
			  		req.body.confirmed = true
			  		transaction.vendorConfirmed = true;
			  		transaction.save()

			  		res.send(req.body);
			  	}
		  	})
		}
		else{

		}
	})
})