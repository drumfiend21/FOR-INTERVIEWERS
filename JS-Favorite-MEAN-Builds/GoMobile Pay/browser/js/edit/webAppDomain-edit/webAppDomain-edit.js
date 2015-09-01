app.config(function ($stateProvider) {

    $stateProvider.state('webAppDomain-edit', {
        url: '/webAppDomain-edit',
        templateUrl: 'js/edit/webAppDomain-edit/webAppDomain-edit.html',
        controller: 'webAppDomainEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('webAppDomainEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

	AuthService.getLoggedInUser().then(function (user){
		
		//to display in edit form
		$scope.currentProperty = $localStorage.currentProperty
		
		//populated from session
		$scope.user = {};
		$scope.user.tchoPayId = user.tchoPayId
		$scope.user.email = user.email

		//populated by edit form
		$scope.user.password
		$scope.user.webAppDomain
		$scope.user.property = "webAppDomain"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}

		$scope.cancelEdit = AccountFactory.cancelEdit

	});

});