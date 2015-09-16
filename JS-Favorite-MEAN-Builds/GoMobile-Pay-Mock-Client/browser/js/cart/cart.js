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

    // $("#checkout-button").on('click', function(){
    //     $('html').append('<link rel="stylesheet" href="http://192.168.1.148:1337/iframe.css" type="text/css"/>')
    //    $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()     
    //    var framein = function(){
    //        $("<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='http://192.168.1.148:1337/checkout'></iframe>").appendTo($('html')).animate({top: "+10%"}, 500, 'easeInOutBack')
    //        // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
    //            var test = "test";
    //            // console.log("frame domain", frame.contentWindow.document.domain)
    //            // debugger;
    //            var func = function(){

    //                var frame = document.getElementById('tchopay-iframe');
    //                console.log(frame.contentWindow)
    //                frame.contentWindow.postMessage(test, 'http://192.168.1.148:1337/');
    //            }
    //            setTimeout(func, 2000)


    //    }    
    //    setTimeout(framein, 500)

    // })


    var tchoPayInit = function () {
      return $http.get('/api/orders/init')
      .then(function (response) {
        
        //select stuff on dom.... we will first put button on dom
        
        var initObj = response.data
        
        $("#tchopay-script").attr("data-transactionHashValue", initObj.transactionHash)
        $("#tchopay-script").attr("data-timestamp", initObj.timestamp)

        console.log("init http response", response)

        return response.data;

      });  
    }
    tchoPayInit()



//extract timestamp and hash and set on button script data-attributes





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