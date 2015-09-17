var router = require('express').Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Order = mongoose.model('Order');
var User = mongoose.model('User');
var _ = require('lodash');

//Node server requirements
var crypto = require('crypto');
var request = require('request');

module.exports = router;

var apiSecret = "sk_9b9ea3790c6bdbbe36d7a4ac7ad8501ddadaa7de";

function hasAdminPower(req, res, next){
	if(req.user.admin) next();	
	else res.status(403).end();
}

function isAuthenticatedUser (req, res, next) {
	if (req.isAuthenticated()) {
		next();
	} else {
		res.sendStatus(401);
	}
}

//Authenticate that outcome object is coming from TchoPay
var createConfirmOutcomeHash = function (secret, timestamp, outcomeKey) {
   var hash = crypto.createHash('sha1');
   hash.update(outcomeKey.toString());   
   hash.update(timestamp.toString());
   hash.update(secret.toString());
   return "oh_"+hash.digest('hex');
};

// runs on page load, generates hash and timestamp for tchopay
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

	res.send(initObject);
	
}); 


// post outcome object to this route, in which authenticate to tchopay server
router.post('/confirm', function (req, res, next){

	//intakes transactionOutcomeObject on req.body
    var transactionOutcomeObject = req.body

    //Store confirmation outcome hash
	var confirmOutcomeHash = createConfirmOutcomeHash(apiSecret, req.body.timestamp, req.body.key)
      
      //Compare confirmation outcome to incumbent outcome received 
      if(confirmOutcomeHash === req.body.hashed){

        //this outcome incumbent is authenticated as sourced from TchoPay
        request.post({url:'http://localhost:1337/api/checkout/confirm-transaction',
        	form: transactionOutcomeObject},
        	function optionalCallback(err, httpResponse, body) {

          //error handling if no confirmation response from TchoPay server
          if(err){
            res.send({res: 1});
            return console.log('your transaction may have been processed, but we didnt get a confirmation from TchoPay; please contact them', err)
          }

          //expect response containing same transactionOutcomeObject
          //with 'confirmed' property set to 'true'
          var transactionReceipt = JSON.parse(body);

          //Check that TchoPay has authenticated the transaction receipt 
          //by changing the 'confirmed' property to true
          if(transactionReceipt.confirmed === true){
            //At this point the transaction is fully authorized and TchoPay completes communication
            //for this transaction.

            //Web app developer can store this transaction receipt in their database now.
            //e.g.
            // Model.create(transactionReceipt).exec().then(function (user) {
              res.send({res: 3});
            // });
            
          }else{
            //if due to communication error TchoPay did not authenticate the receipt
            //send false to your front end i
            res.send({res: 2});
          }
        })
      }else{
        //the incumbent outcome object did not authenticate as coming from TchoPay
        //choose your recourse
        console.log("Hash did not evaluate");
        res.send({res: 0});
      }	
}); 

// get all Orders
router.get('/', isAuthenticatedUser, function (req, res, next){
	if (req.user.admin) {
		Order.find({}).exec()
		.then(
			function (orders){
				res.json(orders);
			}, 
			function (err){
				next(err);
			}
		);
	} else {
		console.log("only this user's orders");
		User.findById(req.user._id)
		.populate('orders')
		.exec()
		.then(
			function (user){
				res.json(user.orders);
			},
			function (err){
				next(err);
			}
		);
	}
});


//get order with orderid 
router.get('/:orderid', isAuthenticatedUser, function (req, res, next){

	if (req.user.admin) {
		Order.findById(req.params.orderid).exec()
		.then(
			function (order){
				res.json(order);
			},
			function (err){
				next(err);
			}
		);
	} else {
		User.findById(req.user._id)
		.populate('orders')
		.exec()
		.then(
			function (user){
				console.log('this is user.orders', user.orders)
				
					var matched = user.orders.filter(function(order) {
						console.log('this is order in filter', order)
						console.log('this is req.params.orderid', req.params.orderid)
						return order._id == req.params.orderid
					})
					console.log('this is matched', matched)
				if (matched.length > 0) {
					res.json(matched);
				} else {
					res.sendStatus(403).end();
				}
			},
			function (err){
				next(err);
			}
		);
	}
});

// creates new order and returns new order
router.post('/', isAuthenticatedUser, function (req, res, next){
	var order = new Order(req.body);
	order.save(function(err){
		res.status(200).send(order);
	});
}); 

//edits this order
router.put('/:orderid', isAuthenticatedUser, function (req, res, next){
	//console.log("in the route req.body is ", req.body._id.replace(/[\n\t\r]/g,""));
	if (req.user.admin){
		Order.findById(req.params.orderid)
		.exec()
		.then(function (order) {
			order.changeStatus(req.body._id.replace(/[\n\t\r]/g,""));
			order.save();
			// console.log(order);
		}, function(err){
			next(err);
		}).then(function(order){
			res.json(order);
		});

	} 
});

// delete this order
router.delete('/:orderid', isAuthenticatedUser, function (req, res, next){
	if (req.user.admin){
		Order.findByIdAndRemove(req.params.orderid).exec()
		.then(
			function (){
				res.status(204).send();
			},
			function (err){
				next(err);
			}
		);
	}
});
