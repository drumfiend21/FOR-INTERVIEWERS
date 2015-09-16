app.config(function ($stateProvider) {

    $stateProvider.state('callbackUrl-edit', {
        url: '/callbackUrl-edit',
        templateUrl: 'js/edit/callbackUrl-edit/callbackUrl-edit.html',
        controller: 'CallbackUrlEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('CallbackUrlEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

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
		$scope.user.callbackUrl
		$scope.user.property = "callbackUrl"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});