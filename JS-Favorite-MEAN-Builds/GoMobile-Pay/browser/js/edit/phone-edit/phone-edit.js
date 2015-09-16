app.config(function ($stateProvider) {

    $stateProvider.state('phone-edit', {
        url: '/phone-edit',
        templateUrl: 'js/edit/phone-edit/phone-edit.html',
        controller: 'PhoneEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('PhoneEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

	AuthService.getLoggedInUser().then(function (user){
		
		//to display in edit form
		$scope.currentProperty = $localStorage.currentProperty
		
		//populated from session
		$scope.user = {};
		$scope.user.tchoPayId = user.tchoPayId
		$scope.user.email = user.email
		
		//populated by edit form
		$scope.user.password
		$scope.user.phone
		$scope.user.property = "phone"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});