app.config(function ($stateProvider) {

    $stateProvider.state('merchantId-edit', {
        url: '/merchantId-edit',
        templateUrl: 'js/edit/merchantId-edit/merchantId-edit.html',
        controller: 'MerchantIdEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('MerchantIdEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

	AuthService.getLoggedInUser().then(function (user){
		
		//to display in edit form
		$scope.currentProperty = $localStorage.currentProperty
		
		//populated from session
		$scope.user = {};
		$scope.user.tchoPayId = user.tchoPayId
		$scope.user.email = user.email
		
		//populated by edit form
		$scope.user.password

		//UNIQUE PROPERTY TO EDIT
		$scope.user.merchantId
		$scope.user.property = "merchantId"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});