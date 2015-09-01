app.config(function ($stateProvider) {

    $stateProvider.state('sellerAccount-edit', {
        url: '/sellerAccount-edit',
        templateUrl: 'js/edit/sellerAccount-edit/sellerAccount-edit.html',
        controller: 'sellerAccountEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('sellerAccountEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

	AuthService.getLoggedInUser().then(function (user){
		
		//to display in edit form
		$scope.currentProperty = $localStorage.currentProperty
		
		//populated from session
		$scope.user = {};
		$scope.user.tchoPayId = user.tchoPayId
		$scope.user.email = user.email

		//populated by edit form
		$scope.user.password
		$scope.user.sellerAccount
		$scope.user.property = "sellerAccount"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});