app.factory('StoreSingleFCT', function ($http, $state, $rootScope, AuthService, StoreFCT, $localStorage, CartFactory) {

    var getAll = function(storeId) {
        return $http.get('/api/store/' + storeId, function (data) {
            return data;
        });
    };


    var addToCart = function (cake) {
    
        console.log('$localStorage', $localStorage);

        if (AuthService.isAuthenticated()) {
            AuthService.getLoggedInUser().then(function (user) {
                
                StoreFCT.addToAuthCart(user, cake, CartFactory);
 
                CartFactory.getCartByUser(user).then(function (cart) {
                    $rootScope.numCartCakes = cart.cakes.length;
                    $rootScope.$broadcast( "numCartCakes", cart.cakes.length );
                });
                
                $localStorage.lastCake = cake;
            });
        } else {
            var cartData = [];
            StoreFCT.addToUnauthCart($localStorage, cartData, cake);
            $rootScope.$broadcast( "numCartCakes", $localStorage.cart.length );
            $rootScope.numCartCakes = $localStorage.cart.length;
        }
        $state.go("added-item")
    };


    var removeFromCart = function (cake) {
        if (AuthService.isAuthenticated()) {
            AuthService.getLoggedInUser().then(function (user) {
                StoreFCT.removeFromAuthCart(user, cake, CartFactory);
            });
        } else {
            var cartData = [];
            StoreFCT.removeFromUnauthCart($localStorage, cartData, cake);
        }
    };


    return {
        getAll: getAll,
        addToCart: addToCart,
        removeFromCart: removeFromCart
    };



});