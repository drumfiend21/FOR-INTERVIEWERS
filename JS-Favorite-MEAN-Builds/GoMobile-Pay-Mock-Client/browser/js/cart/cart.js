app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('cart', {
        url: '/cart',
        controller: 'CartController',
        templateUrl: 'js/cart/cart.html'
    });

});

app.controller('CartController', function ($q, $scope, AuthService, UserFactory, CartFactory, OrdersFactory, $state, $http) {
//TCHOPAY MOCKUP

    var tchoPayInit = function () {
      return $http.get('/api/orders/init')
      .then(function (response) {
        
        var initObj = response.data
        
        //extract timestamp and hash and set on button script data-attributes
        $("#tchopay-script").attr("data-transactionHashValue", initObj.transactionHash)
        $("#tchopay-script").attr("data-timestamp", initObj.timestamp)

        return response.data;

      });  
    }
    tchoPayInit()

////////////////////////////////////////////////////////

    $scope.logThis = function(something){
        console.log(something);
    };
    //$scope.items is an array of objects from localStorage
    $scope.items = CartFactory.getCart();

    $scope.removeItem = function (index){
        CartFactory.deleteItem($scope.items[index].name);
        $scope.items.splice(index, 1);
    };

    $scope.clearCart = function () {
        console.log('hello cart');
        CartFactory.clearAllinCart();
        $scope.items = CartFactory.getCart();
        
    };

// use reduce
    $scope.total = function() {
        var total = 0;
        angular.forEach($scope.items, function(blend) {
            total += blend.quantity * blend.price;
        });
        return total;
    };


    $scope.checkout = function(order) {
        console.log("order is ", order)
        if(!AuthService.isAuthenticated()) return $state.go('login');

        var userIdPromise = AuthService.getLoggedInUser().then(function (user) {
            console.log('this is user logged in from checkout', user)
            return user._id;
        });

        var formattedObj = order.map(
            function(obj){
                return {typeofblend: obj._id, quantity: obj.quantity, name: obj.name};
            }
        );
        order = formattedObj;
    
        var toSubmit = {blend: order, status: "created"}
        console.log(toSubmit);
        
        $q.all([OrdersFactory.createOrder(toSubmit), userIdPromise])
        .then(function (results) {
            var createdOrder = results[0]
            console.log('this is createdOrder', createdOrder)
            var userId = results[1]
            console.log('this is userId', userId)            
            CartFactory.clearAllinCart()
            $scope.items = CartFactory.getCart()
            return UserFactory.putOrderOnUser(userId, createdOrder._id)
        })
        .then(function() {
            $state.go('orders');
        })
        .catch(console.error);

    };
});