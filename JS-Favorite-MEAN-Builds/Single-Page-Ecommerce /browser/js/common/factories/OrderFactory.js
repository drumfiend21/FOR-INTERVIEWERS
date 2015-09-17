app.factory('OrderFactory', function ($http, StoreFCT, AuthService, $rootScope, $localStorage, CartFactory, CakeFactory) {

   return {
       createNewOrder: function (store, cakes, total) {
           return $http.post('/api/order/', { store : store, cakes : cakes, total : total }, function (response) {
                console.log('response', response);
                $rootScope.numCartCakes = 0;

                return response.data; 
           });
       },
       completeOrder: function (orderId, storeId) {
          return $http.put('/api/store/'+storeId+'/order/'+orderId+'/complete', {status: 'Complete'}, function (data) {
            return data.data;
          });
       },

		parseAndCreateCart: function(scope, user){

            var reCombinedCakes = []
            var stockCakes = []
            var customCakes = []
       

            //IMPLEMENT THE PARSING CUSTOM CAKES AND SAVE THEM TO DATABASE
            if($localStorage.length !== 0){

                var cartParseSave = function(locCart){
                    //address quantity for stock cakes
                    //address saving custom cakes

                    //parse cakes
                    
                    for(var i = 0; i<locCart.length; i++){
                        if(!locCart[i]._id) customCakes.push(locCart[i])
                        if(locCart[i]._id) stockCakes.push(locCart[i])
                    }
                    console.log("locCart preparsed", locCart)
                    console.log("custom cakes parsed", customCakes)
                    console.log("stock cakes parsed", stockCakes)
                    
                    //store custom cakes
                    // CakeFactory.storeManyCakes(customCakes).then(function(customCakes){
                    //     console.log("customCakes returned from storeManyCakes",customCakes)
                    //     reCombinedCakes.push(customCakes)
                    // })


                }
                cartParseSave($localStorage.cart)

                //still have to do inventory recalculation
                // var recalculateInventory = function(stockCakes){
     

                // }
                
            }
           
          
           
                
            return CakeFactory.storeManyCakes(customCakes)
            .then(function(customCakes){
                    console.log("now we're here, completed save")
                    console.log("customCakes returned from storeManyCakes",customCakes)
                    customCakes.forEach(function(cake){
                        stockCakes.push(cake)
                    })
                    console.log("recombined Cakes (new stock array) ", stockCakes)
                    return user;
                
            })
            .then(function (user) {
                console.log("create new Cart Ran now!")
                return CartFactory.createNewCart(stockCakes, user)
            })
            .then(function(cart){

                // if($localStorage.cart.length !== 0 && $scope.checkingOut === undefined){
                //     $state.go("storeViewProducts",{storeId : $scope.currentStore})
                // }
            
                // else if($scope.checkingOut){
                    
                //     $state.go("cart")
                // }
                // else{
                //     $state.go('home');
                    
                // }
                $localStorage.cart = [];
                return cart

            }).catch(function () {
                scope.error = 'Invalid login credentials.';
            });
        },
        parseAndUpdateCart: function(scope, user){
            var reCombinedCakes = []
            var stockCakes = []
            var customCakes = []
     

            //IMPLEMENT THE PARSING CUSTOM CAKES AND SAVE THEM TO DATABASE
            if($localStorage.length !== 0){

                var cartParseSave = function(locCart){
                    //address quantity for stock cakes
                    //address saving custom cakes

                    //parse cakes
                    
                    for(var i = 0; i<locCart.length; i++){
                        if(!locCart[i]._id) customCakes.push(locCart[i])
                        if(locCart[i]._id) stockCakes.push(locCart[i])
                    }
                    console.log("locCart preparsed", locCart)
                    console.log("custom cakes parsed", customCakes)
                    console.log("stock cakes parsed", stockCakes)
                    
                    //store custom cakes
                    // CakeFactory.storeManyCakes(customCakes).then(function(customCakes){
                    //     console.log("customCakes returned from storeManyCakes",customCakes)
                    //     reCombinedCakes.push(customCakes)
                    // })


                }
                cartParseSave($localStorage.cart)

                //still have to do inventory recalculation
                // var recalculateInventory = function(stockCakes){
     

                // }
                
            }
            
          
           
                
             return CakeFactory.storeManyCakes(customCakes)
            .then(function(customCakes){
                    console.log("now we're here, completed save")
                    console.log("customCakes returned from storeManyCakes",customCakes)
                    customCakes.forEach(function(cake){
                        stockCakes.push(cake)
                    })
                    console.log("recombined Cakes (new stock array) ", stockCakes)
                    return user
                
            })
            .then(function (user) {
                console.log("update cart ran now!")
                return CartFactory.updateCart(stockCakes, user)
            })
            .then(function(cart){

                // if($localStorage.cart.length !== 0 && $scope.checkingOut === undefined){
                //     $state.go("storeViewProducts",{storeId : $scope.currentStore})
                // }
            
                // else if($scope.checkingOut){
                    
                //     $state.go("cart")
                // }
                // else{
                //     $state.go('home');
                    
                // }
                $localStorage.cart = [];
                return cart

            })
            .catch(function () {
                scope.error = 'Invalid login credentials.';
            });

        }
   };

});