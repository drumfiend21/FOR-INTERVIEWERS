app.config(function ($stateProvider) {

    $stateProvider.state('password-edit', {
        url: '/password-edit',
        templateUrl: 'js/edit/password-edit/password-edit.html',
        controller: 'passwordEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('passwordEditCtrl', function ($scope, Session, AuthService, $state, $localStorage, AccountFactory) {

	AuthService.getLoggedInUser().then(function (user){
		
		console.log($scope.registrationForm)

		//to display in edit form
		$scope.currentProperty = Session.user.email
		$scope.passCheck = false;
		
		//populated from session
		$scope.user = {};
		$scope.user.tchoPayId = user.tchoPayId
		$scope.user.email = user.email
		
		//populated by edit form
		$scope.user.password
		$scope.user.newPasswordOne
		$scope.user.newPasswordTwo
		$scope.user.property = "password"

		//submit the edited account info
		$scope.submitEditCard = function(){

			if($scope.user.newPasswordOne !== $scope.user.newPasswordTwo){
				$scope.passCheck = true;
				return
			}
			else{
				delete $scope.user.newPasswordTwo
				AccountFactory.submitEditCard($scope.user, $scope)			
			}

		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});