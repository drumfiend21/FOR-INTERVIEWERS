app.factory('CheckoutFactory', function ($http, $state, AuthService, Session, $localStorage) {



	var submitTransaction = function(transactionObject, browserDomain){
		return $http.post('/api/checkout/validate', 
			{
				transactionObject: transactionObject, 
				browserDomain: browserDomain

			}).then(function(response){
				//TO DO
				return response.data
		})
	}

	return {
	        submitTransaction: submitTransaction        
	};

});