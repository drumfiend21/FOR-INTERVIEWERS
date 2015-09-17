app.directive('payFrame', function ($rootScope, AuthService, CheckoutFactory, AUTH_EVENTS, $state, $http) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/iframe/iframe.html',
        link: function (scope) {

        	//Authenticate Domain
		    scope.enterinfo = true;
        	var commDomain 

        	//Communication between web app and iframe
        	function receiveMessage(event)
			{	

				if(event.origin === commDomain && event.data.hasOwnProperty("res")){
		        	scope.authorizing = false;
		        	scope.paymentprocessed = true;
		        	scope.$apply();
		        	console.log("in resolve")
					return 
				}

				commDomain = event.origin

				//Controller accesses parent window and assigns button container 
			    //data-attributes to scope variables
			    scope.iframe.chargeAmount = event.data.chargeAmount
			    scope.iframe.transactionHashValue= event.data.transactionHashValue
			    scope.iframe.apiKey = event.data.apiKey
		        scope.iframe.timestamp = event.data.timestamp
		        scope.$apply();

			}
			window.addEventListener("message", receiveMessage, false);

        	//FOR TESTING: because of nested index.html
        	$("#checkout-button").remove()

		    //Build Transaction Object Scaffold
		    scope.iframe = {};
		    
		    //State Changes (ng-if) All falsey values.
		    scope.authorizing 
		    scope.merchanterror
		    scope.paymenterror
		    scope.paymentprocessed

		    //Pull rest of properties from iframe
		    scope.iframe.buyerAccount
		    scope.iframe.pin

		    //Get buyer location
		    navigator.geolocation.getCurrentPosition(function(geo){
		        console.log(geo)
		        scope.iframe.location = geo
		    })    


		    scope.someFunc = function(){

		        //send api call to backend, create and save a database object 
		        //take API key and search database
		        
		        //hide enterinfo show authorizing transaction
	        	scope.enterinfo = false;
	        	scope.authorizing = true;

		        //once outcome returns from back end, we communicate to merchant app

		        var parentWindow = window.parent;

		  		parentWindow.postMessage("TRANSACTION OUTCOME FROM IFRAME", commDomain);
	        	
	        	// Validate Web App Api Key and Secret
	        	var submitTransaction = function(transactionObject){
					//NOTE ON HTTP REQUEST IN CONTROLLER
					//the security gains by having this call in the controller outmatch gains of modularity
					//by having this call here, we are able to pass window.location.origin directly into our call
					//with the smallest chance of its value being manipulated before submission
					return $http.post('/api/checkout/validate', 
						{
							transactionObject: transactionObject, 
							browserDomain: commDomain

						}).then(function(response){

							parentWindow.postMessage(response.data, commDomain);

							delete scope.iframe;
							return response.data
					})
				}
				submitTransaction(scope.iframe)
		    }
        }
    }
})