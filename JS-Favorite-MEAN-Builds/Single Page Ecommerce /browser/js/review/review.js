app.config(function ($stateProvider) {
	$stateProvider.state('reviewProduct', {
		url:'/:userId/review/:type/:productId',
		templateUrl: 'js/review/review.html',
		controller: 'reviewFormCtrl',
		resolve: {
			isAuthenticated: function (AuthService) {
				return AuthService.isAuthenticated();
			}
		}
	});
});

app.controller('reviewFormCtrl', function ($scope, AuthService, $state, $stateParams, reviewFCT) {
	// if(isAuthenticated()) {
	// 	console.log('INSIDE');
	// }
	// } else {
	// 	$state.go('login');
	// }
	$scope.review = {};
	$scope.review.user = $stateParams.userId;
	$scope.review.productId = $stateParams.productId;
	$scope.review.category = $stateParams.type;

	$scope.saveReview = function (review) {
		console.log('review', review);

		// reviewFCT.
	}
});