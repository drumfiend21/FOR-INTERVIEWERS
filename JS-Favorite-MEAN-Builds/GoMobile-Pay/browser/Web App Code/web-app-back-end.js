// WEB APP SERVER CODE
// Sample code for Node.js

// Node server requirements
var crypto = require('crypto');
var request = require('request');

// Store your API Secret as a string on this variable
var apiSecret 

// 1. EVERYTHING BELOW IS CALLED ONLOAD OF THE PAGE CONTAINING THE CHECKOUT BUTTON

// Generates hash and timestamp for GoMobile Pay
// Push the transactionHash into the page HTML being served, store it on 
// the global variable, "transactionHashValue", supplied by us for your front end javascript.
// Also, push the timestamp into the page HTML being served, store it on 
// the global variable, "timestamp", supplied by us for your front end javascript

router.get('/init', function (req, res, next){



    var createTransactionHash = function (secret, timestamp) {
       var hash = crypto.createHash('sha1');
       hash.update(timestamp.toString());
       hash.update(secret.toString());
       return "ti_"+hash.digest('hex');
    };
    
  //generate timestamp (nonce value for hash)
    var timestamp = Date.now().toString()
    
    //generate hash
    var transactionHash = createTransactionHash(apiSecret,timestamp)

    var initObject = {
      timestamp : timestamp,
      transactionHash: transactionHash
    }
    console.log("initObject to be sent to front end",initObject)
  res.send(initObject);
  
}); 


// 2.  CONFIRMATION ROUTE
// post outcome object to this route, in which authenticate to GoMobile Pay server
router.post('/confirm', isAuthenticatedUser, function (req, res, next){

  // Intakes transactionOutcomeObject on req.body
    var transactionOutcomeObject = req.body

    // Authenticate that outcome object is coming from GoMobile Pay
    var createConfirmOutcomeHash = function (secret, timestamp, outcomeKey) {
       var hash = crypto.createHash('sha2');
       hash.update(timestamp.toString());
       hash.update(secret.toString());
       hash.update(outcomeKey.toString());
       return "oh_"+hash.digest('hex');
    };

      // Store confirmation outcome hash
      var confirmOutcomeHash = createConfirmOutcomeHash(apiSecret, req.body.timestamp, req.body.key)

      // Compare confirmation outcome to incumbent outcome received 
      if(confirmOutcomeHash === req.body.hashed){

        // This outcome incumbent is authenticated as sourced from GoMobile Pay
        request.post({url:'https://192.168.1.139:1337/checkout/confirm-transaction', 
            formData: transactionOutcomeObject
          }, function optionalCallback(err, httpResponse, body) {
            if(err) return err //your error handling here

        })
      }else{
        //the incumbent outcome object did not authenticate as coming from GoMobile Pay
        //choose your recourse
        // res.send(2)
        console.log("Hash did not evaluate")
      }
}); 