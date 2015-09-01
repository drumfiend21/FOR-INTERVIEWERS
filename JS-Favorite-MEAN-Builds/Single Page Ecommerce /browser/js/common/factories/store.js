app.factory('StoreFCT', function ($http) {

    var getOne = function (cakeId) {
        return $http.get('/api/store/' + cakeId, function (response) {
            return response;
        });
    };

    var getColorScheme = function (store) {
        return $http.get('/api/store/colors/' + store).then(function(response){
            return response.data;
        });
    };

    
    var addToAuthCart = function (user, cake, CartFactory) {
        
        CartFactory.updateCart(cake, user);

    };

    var removeFromAuthCart = function (user, cake, CartFactory) {

        CartFactory.deleteFromCart(cake);

    };

    var addToUnauthCart = function ($localStorage, cartData, cake) {

        if ($localStorage.cart) {
            cartData = $localStorage.cart;
        }

        cartData.push(cake);

        $localStorage.cart = cartData;
    };

    var removeFromUnauthCart = function ($localStorage, cartData, cake) {

        if (!$localStorage.cart) return;

        for (var i = 0; i < $localStorage.cart.length; i++) {
            if ($localStorage.cart[i]._id === cake._id) {
                $localStorage.cart.splice(i, 1);
            }
        }
    };

    var createNewStore = function (store) {
        
        console.log("hit create store function, here is store", store)
        return $http.post('/api/create/store', store, function (data){
            return data;
        });
    }

    var getAllStores = function() {
        return $http.get('/api/store/').then(function(response) {
            return response.data;
        });
    }

    return {

        getOne: getOne,
        getColorScheme: getColorScheme,
        addToAuthCart: addToAuthCart,
        addToUnauthCart: addToUnauthCart,
        removeFromAuthCart: removeFromAuthCart,
        removeFromUnauthCart: removeFromUnauthCart,
        createNewStore: createNewStore,
        getAllStores: getAllStores
    };

});
