app.directive('payFrame', function ($rootScope, AuthService, CheckoutFactory, AUTH_EVENTS, $state, $http) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/iframe/iframe.html',
        link: function (scope) {

        	//Authenticate Domain
		    scope.enterinfo = true;

        	console.log("prelistener")

        	var commDomain 


        	
        	//communication between web app and iframe
        	function receiveMessage(event)
			{	
				console.log("IFRAME COMMUNICATION LIVE", event)
			

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

		    




				


				// var origin = {
				// 	incumbentDomain: event.origin
				// }
			 //  // Do we trust the sender of this message?  (might be
			 //  // different from what we originally opened, for example).
				// $http.post("api/checkout/comm-eval", origin).then(function (response){

				//   console.log("incumbent eval response:", response)
				  
				  // if(response.data === true){
				//   // event.source is popup
				//   // event.data is "hi there yourself!  the secret response is: rheeeeet!"
				//   		console.log("tchopay evaluated incumbent as true")

				  		// var parentWindow = window.parent;

				  		// parentWindow.postMessage("RESPONSE CONTACT FROM IFRAME BACK TO WEBAPP", 'http://localhost:1338/');
				//   		// console.log(event.data)

				//   }else{
				  		
				//   }


				// })
			}
			window.addEventListener("message", receiveMessage, false);




        	//FOR TESTING: because of nested index.html
        	$("#checkout-button").remove()


        	console.log("the iframe directive link is running")

   //     		//BUILDING THE TRANSACTION OBJECT (SEND TO TCHOPAY)

			// var apiPublicKey = document.getElementById("tchopay-script").getAttribute("data-key")
			// var amount = document.getElementById("tchopay-script").getAttribute("data-amount")
			// var timestamped = document.getElementById("tchopay-script").getAttribute("data-timestamp")
			// var transactionHash = document.getElementById("tchopay-script").getAttribute("data-transactionhashvalue")


			//checkoutComplete function to call on transaction outcome
			// window.parent.checkoutComplete

			// console.log(timestamp)
			// console.log(transAuthId)
			
	

			// console.log(document.getElementById("tchopay-script"))
			// console.log(amount)
			// console.log(apiPublicKey)
			// console.log(timestamped)
			// console.log(transactionHash)

		

		   
		    //Build Transaction Object Scaffold
		    scope.iframe = {};

		    
		    // scope.iframe.webAppDomain = "http://localhost:1337"
		    // if(angular.element(window.parent.window.location)[0]['origin'] === scope.iframe.webAppDomain) scope.enterinfo = true;
		    // if(angular.element(window.parent.window.location)[0]['origin'] !== scope.iframe.webAppDomain) scope.merchanterror = true;
		    
		    //State Changes (ng-if) All falsey values.
		    scope.authorizing 
		    scope.merchanterror
		    scope.paymenterror
		    scope.paymentprocessed

			    //hide navbar
			    // angular.element(window.document['body']['childNodes'][1]).remove()

		    

	        // console.log("iframe object", scope.iframe)



		    //Pull rest of properties from iframe
		    scope.iframe.buyerAccount
		    scope.iframe.pin

		    //Get buyer location
		    navigator.geolocation.getCurrentPosition(function(geo){
		        console.log(geo)
		        scope.iframe.location = geo
		    })    

		    // console.log($(window.parent))
		    


		    // scope.closeIframe = function(){

		    // 	console.log("you just clicked the close button")
		    	
		    // 	// $(window.parent.window.document.all[45]).animate({top: "100%", opacity: 0}, 500, 'easeInOutBack')
		    // 	$(window.parent.window.document.all[46]).animate({top: "100%", opacity: 0}, 500, 'easeInOutBack');
		    // 	var close = function(){
		    // 		$(window.parent.window.document.all[46]).remove()
		    // 		//TO DO REMOVE BACKGROUND DIV
		    // 		// $(window.parent.window.document.children[0].children[2].context).remove()
		    // 	}
		    // 	setTimeout(close, 900)
		    // }

		    // .toggleClass("iframe-fadein iframe-fadeout")



		    scope.someFunc = function(){
		        //create a JSON object from this
		        //send api call to backend, create and save a database object 
		        //take API key and search database

		        //set timestamp on transaction
		        //OUTDATED with new transauth hash
		        // scope.iframe.timestamp = Date.now().toString()
		        
		        //hide enterinfo show authorizing transaction
	        	scope.enterinfo = false;
	        	scope.authorizing = true;

		        console.log("transaction object to be submitted to database", scope.iframe)

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
							//TO DO

							console.log("tchopay iframe received outcome object from tchopay back end: ", response.data)

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