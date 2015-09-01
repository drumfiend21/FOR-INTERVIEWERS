app.config(function ($stateProvider) {

    $stateProvider.state('cart', {
        url: '/cart',
        templateUrl: 'js/cart/cart.html',
        controller: 'CartCtrl',
        resolve: {

        	getCartOfCakes: function (AuthService, $localStorage, $q, CakeFactory, CartFactory) {

                return AuthService.getLoggedInUser().then(function (user) {

                    if (user) {
                        return CartFactory.getCartByUser(user);
                    } else {
                        return $localStorage.cart;
                    }

                }).then(function (userCart) {

                    if (userCart.cakes) {

                        var cakes = userCart.cakes.map(function (cake) {
                            return CakeFactory.getCakes(cake);
                        });

                        return $q.all(cakes);

                    } else {
                        return userCart;
                    }

                }).then(function (cakes) {
                    return cakes;
                });
            },

        	isAuthenticated: function (AuthService) {

        		return AuthService.isAuthenticated();
        	}
        }
    });

});


app.controller('CartCtrl', function ($scope, CakeFactory, $rootScope, $state, $stateParams, $localStorage, CartFactory, OrderFactory, getCartOfCakes, AuthService, isAuthenticated) {

    $scope.cart = getCartOfCakes;

    $scope.localCart = $localStorage.cart

    $scope.checkingOut = $localStorage.checkingOut

    console.log('scope.cart', $scope.cart);

    $scope.price = CartFactory.calculateCart($scope.cart);

    $scope.currentStore = $localStorage.currentStore;

    $scope.checkout = function (cart) {

        if(!AuthService.isAuthenticated()){
            $state.go("signup")
        }

        var store = cart[0].storeId;

        var cakes = cart.map(function (cake) {
            return cake._id;
        });

        console.log("arrayed cakes", cakes)
        console.log("authenticated?", AuthService.isAuthenticated() )

        if (AuthService.isAuthenticated()) {
            OrderFactory.createNewOrder(store, cakes, $scope.price).then(function(order){
                console.log(order)
                delete $scope.cart
            // $state.go()
            })
    	}
        
    	
    };

    $scope.calculateOrders = function (cakeArray) {
        var retArr = [];
        var orderObj = function(storeId) {
            this.storeId = storeId;
            this.cakes = [];
            this.total = 0;
        }
        cakeArray.forEach(function (cake) {
            if(!retArr.length) {
                retArr.push(new orderObj(cake.storeId.toString()));
                retArr[0].cakes.push(cake._id);
                retArr[0].total += cake.price;
            }
            else {
                var exists = false;
                var index = null;
                for(var i=0; i < retArr.length;i++) {
                    if(retArr[i].storeId === cake.storeId.toString()) {
                        exists = true;
                        retArr[i].cakes.push(cake._id);
                        retArr[i].total += cake.price;
                    }
                }
                if(!exists) {
                    retArr.push(new orderObj(cake.storeId.toString()));
                    retArr[retArr.length-1].cakes.push(cake._id);
                    retArr[retArr.length-1].total += cake.price;
                }
            }
        });
        console.log('ORDER ARRAY', retArr);
    }


});