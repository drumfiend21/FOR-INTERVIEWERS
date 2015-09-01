/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:

function $Promise(){

	this.state = "pending"
	this.check = false;
	this.value;
	this.handlerGroups = [];
	this.catchcheck = false;

}

$Promise.prototype.then = function(successHandler, failureHandler){
		
	console.log("called")
	var obj = {}

	obj.forwarder = new Deferral();
	
	if(typeof(successHandler) === "function"){
		obj.successCb = successHandler;
	}

	if(typeof(failureHandler) === "function"){	
		obj.errorCb = failureHandler;
	}

	this.handlerGroups.push(obj);

	if(this.check){
		this.callHandlers(obj);
	}

	return obj.forwarder.$promise
}

$Promise.prototype.callHandlers = function(obj){
	var val = this.value;

	if(this.state === "resolved"){
		if(obj.successCb){
			obj.successCb(val);
		}
	}
	if(this.state === "rejected"){
		if(obj.errorCb){
			obj.errorCb(val);
		}
	}

}

$Promise.prototype.catch = function(errorFn){

	return this.then(null, errorFn);

}


function Deferral(){
	this.$promise = new $Promise();

}

Deferral.prototype.resolve = function(data){
	
	if(this.$promise.check === false){
		this.$promise.state = "resolved";
		this.$promise.value = data;
		this.$promise.check = true;
		var val = this.$promise.value

		this.$promise.handlerGroups.forEach(function(obj){
			if(!obj.successCb){
				obj.forwarder.resolve(val)
			}else{

				try{
					var ran = obj.successCb(val);
					console.log("DeferralA SuccessCb", ran)
					if(ran.constructor === $Promise){
						
						ran.then(function(smth){
							obj.forwarder.resolve(smth)
						})

					}else{
						obj.forwarder.resolve(ran)					
					}
				}

				catch(err){
					obj.forwarder.reject("err")
				}

			}
		})
		this.$promise.handlerGroups = [];
	} 
}

Deferral.prototype.reject = function(data){
	
	if(this.$promise.check === false){
		this.$promise.state = "rejected";
		this.$promise.value = data;
		this.$promise.check = true;
		var val = this.$promise.value

		this.$promise.handlerGroups.forEach(function(obj){
			if(!obj.errorCb){
				obj.forwarder.reject(val);
			}else{
				try{
					var ran = obj.errorCb(val);
					if(ran.constructor === $Promise){
						ran.then(function(smth){
							obj.forwarder.reject(smth)
						})
					}else{
						obj.forwarder.resolve(obj.errorCb(val))					
					}
				}

				catch(err){
				
					obj.forwarder.reject("err")
				}
			}
		})
		this.$promise.handlerGroups = [];	
	} 
}

function defer(){

	return new Deferral();
}


/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
