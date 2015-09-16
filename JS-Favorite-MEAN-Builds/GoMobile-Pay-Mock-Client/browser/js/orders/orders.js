app.config(function ($stateProvider) {

    // Register our *orders* state.
    $stateProvider.state('orders', {
        url: '/orders',
        controller: 'OrdersController',
        templateUrl: 'js/orders/orders.html'
    });

});

app.controller('OrdersController', function ($scope, OrdersFactory, BlendsFactory){

	$scope.allOrders = null;
	$scope.microName = null;
	$scope.randomMicro = null;
	$scope.recommendedBlend = null;
	$scope.orderIds = [];
	// $scope.showRecommendation = false;

	OrdersFactory.getAllOrders().then(function (orders) {
		$scope.allOrders = orders;
		if(orders.length) { 
			// $scope.showRecommendation = true;
		}
	});

	$scope.showOrders = function () {
		OrdersFactory.getAllOrders().then(function (orders) {
			console.log('orders argument', orders);
			$scope.orderIds = orders.map(function(obj) { return obj._id });
			console.log('these are orderIds', $scope.orderIds)
			$scope.orderIds.forEach(function(orderid){

				OrdersFactory.getOrderById(orderid).then(function (order) {
					console.log('the order:', order);
					$scope.order = order;
					BlendsFactory.getBlendById(order.blend[0].typeofblend)
					.then(function (blend) {
						
						console.log('the micro array', blend.micros);
						
						$scope.microName = blend.micros.map(function(obj){
							return obj.name;
						})

						$scope.randomMicro = $scope.microName[Math.floor(Math.random()*$scope.microName.length)];
						console.log('this is blend ordered', blend)

						BlendsFactory.getAllBlends().then(function (blends) {
							console.log('all the blends', blends);
							
							$scope.matchedBlends = blends.filter(function(blend){
								var hasRandomMicro = false;
								blend.micros.forEach(function(micro){
									if(micro.name === $scope.randomMicro){
										hasRandomMicro = true;
									}
								})
								return hasRandomMicro
							}
							);
							
							$scope.recommendedBlend = $scope.matchedBlends[Math.floor(Math.random()*$scope.matchedBlends.length)]
						})
					})
				});
			})
			$scope.orders = orders;
			// $scope.showRecommendation = true;
		});
	};

	$scope.showOrdersById = function (orderid) {
		OrdersFactory.getOrderById(orderid).then(function (order) {
			$scope.orders = order;
		})

	};

	$scope.loadOrderToEdit = function (id) {
		OrdersFactory.getOrderById(id).then(function (order) {
			$scope.editedOrder = order;
		});
	};

	$scope.editOrder = function (id, order) {
		//console.log('editOrder', order.status);
		OrdersFactory.editOrderById(id, order.status).then(function (order) {
			//console.log('after editing ', order);
			$scope.editedOrder = order;
			
		});
	};

	$scope.deleteOrder = function (id) {
		OrdersFactory.deleteOrderById(id).then(function(){

	        OrdersFactory.getAllOrders().then(function (orders) {
				$scope.allOrders = orders;
			});
			return;
		});
	};

	$scope.showOrders();
});

