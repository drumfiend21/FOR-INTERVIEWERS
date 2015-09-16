app.factory('AccountFactory', function ($http, $state, AuthService, Session, $localStorage) {

	var getAccountInfo = function(user){
		return $http.get('/api/account/' + user.tchoPayId).then(function(response){
			console.log(response.data)
			return response.data;
		})
	}

	var editAccount = function(property){
		if(property === 'merchantId') $state.go("merchantId-edit");
		if(property === "email") $state.go("email-edit");
		if(property === "phone") $state.go("phone-edit");
		if(property === "description") $state.go("description-edit");
		if(property === "callbackUrl") $state.go("callbackUrl-edit");
		if(property === "sellerAccount") $state.go("sellerAccount-edit");
		if(property === "password") $state.go("password-edit");
		if(property === "webAppDomain") $state.go("webAppDomain-edit");


	}

	var cancelEdit = function(){
		delete $localStorage.currentProperty
		$state.go('account')
		return
	}

	var submitEditCard = function(user, scope){
		
		var loginUser = {
			email: user.email, 
			password: user.password
		}

		//if user.property === "email" || user.property === "password"
		//log out event
		//state change to login

		return $http.put('/api/account/edit', user).then(function(response){

			if(response.data.error === "invalid password"){
				//set some variable to true, link it to ng-show of password alert element
				//state.go same page
				scope.failPass = true;
				$state.go(user.property+"-edit");
				return 

			}
			else{

				Session.user = response.data
				delete $localStorage.currentProperty

		    	if(user.property === "email" || user.property === "password"){
					AuthService.logout().then(function(){

						$state.go('login');		    		
			    		return

					})
		    	}
		    	else{

					$state.go('account');
		            return 
		    		
		    	}



		    }

		})

		//once this call to route and save has occured
		//route returns new user object
		//initiate new Log in event to persist updated user info on session
		//state.go("account")
	}

	return {
	        getAccountInfo: getAccountInfo,
	        editAccount: editAccount,	
	        submitEditCard: submitEditCard,
	        cancelEdit: cancelEdit          
	};

});