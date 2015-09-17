app.directive('buildForm', function (CakeFactory, $rootScope, $localStorage, $stateParams, $state, CartFactory, StoreSingleFCT) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/cake-builder-form/cake-builder-form.html',
        link: function (scope) {
                CakeFactory.getAllIngredients($stateParams.storeId).then(function(ingredients){

                    //make ingredients available on scope
                    scope.fillings = ingredients.data[0]
                    scope.icings = ingredients.data[1]
                    scope.shapes = ingredients.data[2]
                    scope.reviews = ingredients.data[4]

                    

                    //set scope properties
                    CakeFactory.setScopeProps(scope)

                    //bring storeCake function to scope
                    scope.storeCake = CakeFactory.storeCake

                    //set user on scope
                    
                    CakeFactory.getUserInfo(scope);


                    //to update cake object properties
                    scope.update = function(propName, propObj, layerNum){

                        
                        //set scope.cake property
                        if(propName === "selectedNumLayers"){
                            scope.cake.selectedNumLayers = propObj
                            scope.currentPrices.selectedNumLayers = propObj
                        }

                        //set properties on cake object and cake pricing object
                        
                        if(propName === "numOrdered"){
                            scope.currentPrices[propName] = scope.cake.numOrdered
                            console.log("to see numOrdered", scope.cake)
                        }

                        if(propName === "shape" || propName === "icing"){
                            
                            scope.cake[propName] = propObj._id
                            
                            scope.currentPrices[propName] = propObj
                            console.log("scope.currentPrices",scope.currentPrices)
                            
                        }

                        if(layerNum === '1' || layerNum === '2' || layerNum === '3' ){
                            
                            scope.cake[propName][layerNum-1]['filling'] = propObj._id
                           
                            scope.currentPrices[propName][layerNum-1]['filling'] = propObj

                            scope.colors[layerNum-1].color = propObj.color

                            console.log("colors", scope.colors[0], scope.colors[1],scope.colors[2])
                          
                        }



                        //check for layers desired and modify scope.cake.layers
                        
                        if(propName === "selectedNumLayers"){
                            // console.log(propObj)
                            if(propObj=== 1) {
                                if(scope.cake.layers[1].filling !== null){
                                    scope.cake.layers[1].filling = null;
                                }
                                if(scope.cake.layers[2].filling !== null){
                                    scope.cake.layers[2].filling = null;
                                }
                                //show layers if applicable
                                $localStorage.currentPrices.layerTwo = false
                                $localStorage.currentPrices.layerThree= false

                            }

                            if(propObj=== 2) {
                                if(scope.cake.layers[2].filling !== null){
                                    scope.cake.layers[2].filling = null;
                                }
                                $localStorage.currentPrices.layerTwo = true
                                $localStorage.currentPrices.layerThree= false
                                
                            }
                            if(propObj=== 3) {
                                $localStorage.currentPrices.layerTwo = true
                                $localStorage.currentPrices.layerThree= true
         
                            }
                        }

                        //update localStorage when we change the cake
                        CakeFactory.setCakeLocal(scope.cake, scope.currentPrices)


     
                        //regenerate prices when we change the cake
                        CakeFactory.updatePrice(scope)
                    }



                    //persist cake in progress from local storage
                    CakeFactory.loadCakeFromLocal(scope);

                });

        }

    };

});