app.factory('OrdersFactory', function ($http){
	return {
		getAllOrders: function (){
			return $http.get("/api/orders")
			.then(function (response){
				return response.data;
			});
		},
		getOrderById: function (orderid){
			return $http.get("/api/orders/" + orderid)
			.then(function (response){
				return response.data;
			});
		},
		createOrder: function (order) {
			return $http.post("/api/orders", order)
			.then(function (response) {
				return response.data;
			});
		},
		editOrderById: function (id, order) {
			//console.log("in the factory order is ", order);
			return $http.put('/api/orders/' + id, {"_id": order})
			.then(function (response) {
				return response.data;
			});
		},
		deleteOrderById: function (id) {
			return $http.delete('/api/orders/' + id);
		}
	};
});