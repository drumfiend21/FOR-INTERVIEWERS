
app.factory('CartFactory', function ($http, AuthService, StoreFCT, $localStorage, $state) {

    return {
    	getCartByUser: function (user) {
    		return $http.get('/api/cart/' + user._id).then(function(response){
                console.log('response', response.data);
                return response.data;
            });	
    	},
    	createNewCart: function (cart, user) {
            console.log("here: creating a new cart")
            console.log("cart and user", cart, user)
            return $http.post('/api/cart/add', { cart : cart, user : user }, function (response) {
	            console.log('response', response);
	            // return response; 
	        });
    	},
        updateCart: function (cake, user) {
            console.log("here: store cake in auth cart")
            console.log("cake and user", cake, user)
            return $http.put('/api/cart/update', { cakes : cake, user : user }, function (response) {
	            console.log('response', response);
	            // return response; 
	        });
        },
        deleteFromCart: function (cake) {
            return $http.delete('/api/cart/' + cake._id).then(function(response){
                console.log('response', response);
                // return response;
            });	
        },
        calculateCart: function(cart){
            var cartPrice = 0;
            if(cart !== undefined){
                cart.forEach(function(cake){
                    cartPrice += cake.price;
                })
            }
            return cartPrice;
        },
        // checkOutCart: function(cart){

        //     console.log("now checking out cart", cart)
        //     // $localStorage.checkOut = true

        //     // // $state.go()
        //     var store = cart[0].storeId;

        //     var cakes = cart.map(function (cake) {
        //         return cake._id;
        //     });

        //     console.log("cake sthat just got checked out",cakes)

        //     if (isAuthenticated) {
        //         OrderFactory.createNewOrder(store, cakes, $scope.price);    
        //     }
                
            
        // },
        


   };

});