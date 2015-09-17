app.config(function ($stateProvider) {

    $stateProvider.state('store', {
        url: '/store',
        templateUrl: 'js/store/store.html',
        controller: 'StoreCtrl',
    });

    $stateProvider.state('custom', {
        url: '/custom',
        templateUrl: 'js/store/store.html',
        controller: 'StoreCtrl',
    });

    $stateProvider.state('storeViewProducts', {
        url: '/store/:storeId',
        templateUrl: 'js/store/storeSingle.html',
        controller: 'StoreSingleCtrl',
        resolve: {

            getColorScheme: function ($rootScope, $stateParams, StoreFCT) {
                return StoreFCT.getColorScheme($stateParams.storeId).then(function (colors) {
                    $rootScope.colorScheme = colors;
                    return colors;
                });
            }
        }
    });

});


app.controller('StoreSingleCtrl', function ($rootScope, $scope, $q, AuthService, $state, StoreFCT, StoreSingleFCT, $stateParams, $localStorage, CakeFactory, getColorScheme, $modal, $log) {

    $scope.currentStore = $localStorage.currentStore;

    $scope.animationsEnabled = true;

    $scope.open = function (cake) {

        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'myModalContent.html',
          controller: 'ModalInstanceCtrl',
          resolve: {
            cake: function () {
                return cake;
            },
            colorScheme: function () {
                return $scope.colorScheme;
            }
          }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    $scope.toggleAnimation = function () {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };

    var stores = [];


    CakeFactory.getAllCakes().then(function (allcakes) {

        $scope.products = allcakes;
        return allcakes;

    }).then(function (allcakes) {

        allcakes.forEach(function (cake) {
            stores.push(cake.storeId);
        });

        $scope.stores = _.uniq(stores, 'name');

    });

    CakeFactory.getAllStoreCakes($scope.currentStore).then(function (allcakes) {
        $scope.currentProducts = allcakes;
        return allcakes;
    })
    
 
    $scope.addToCart = StoreSingleFCT.addToCart;

    $scope.removeFromCart = StoreSingleFCT.removeFromCart;

    $scope.colorScheme = getColorScheme;

    $scope.setStore = function (store) {

        $scope.currentProducts = _.filter($scope.products, function (ele) {
            return ele.storeId._id === store._id;
        });

    }


});


app.controller('ModalInstanceCtrl', function ($scope, $modalInstance, cake, colorScheme, StoreSingleFCT) {

  $scope.cake = cake;

  $scope.addToCart = StoreSingleFCT.addToCart;

  $scope.removeFromCart = StoreSingleFCT.removeFromCart;

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

app.controller('StoreCtrl', function ($rootScope, $scope, AuthService, $state, StoreFCT, $localStorage, CartFactory, $location) {

    $scope.location = $location.$$url;

    if ($scope.location === '/custom') {
        $scope.customStores = true;
    }

    $localStorage.currentStore = undefined;

    $scope.storeCast = function(store){        
        $localStorage.currentStore = store;
    }

    StoreFCT.getAllStores().then(function (response) {
        $scope.storeArray = response;
    });


});