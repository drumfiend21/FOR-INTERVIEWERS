app.config(function ($stateProvider) {

    $stateProvider.state('description-edit', {
        url: '/description-edit',
        templateUrl: 'js/edit/description-edit/description-edit.html',
        controller: 'DescriptionEditCtrl',
        data: {
        	authenticate: true
        }
    });

});

app.controller('DescriptionEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

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
		$scope.user.description
		$scope.user.property = "description"

		//submit the edited account info
		$scope.submitEditCard = function(){
			AccountFactory.submitEditCard($scope.user, $scope)			
		}
		
		$scope.cancelEdit = AccountFactory.cancelEdit

	});
});