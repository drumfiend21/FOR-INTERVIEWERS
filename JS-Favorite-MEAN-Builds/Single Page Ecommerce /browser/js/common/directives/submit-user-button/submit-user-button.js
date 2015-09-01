app.directive('submitUserButton', function (CakeFactory, $rootScope, $localStorage, $stateParams, $state, CartFactory, StoreSingleFCT) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/submit-user-button/submit-user-button.html',
        link: function (scope) {
                scope.checkOut = $localStorage.checkOut
                scope.cart = $localStorage.cart
                scope.currentStore = $localStorage.currentStore._id
                console.log("cart should be full", scope.cart)
                console.log("this hsould be the curentStore", scope.currentStore)
        

        }
    };

});