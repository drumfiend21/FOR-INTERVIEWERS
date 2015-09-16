app.directive('order', function (OrdersFactory, AuthService) {
	return {
		restrict: 'E',
		templateUrl: 'js/common/directives/orders/order.html',
		scope: {
			order: '=',
			deleteorder: '&',
			editorder: '&'
		},
		link: function (scope) {

			AuthService.getLoggedInUser().then(function (currUser){
                scope.isAdmin = currUser.admin;
            });

			scope.orderStatus = [
				'created',
				'processing',
				'cancelled',
				'completed'
			];

		}
	};
});