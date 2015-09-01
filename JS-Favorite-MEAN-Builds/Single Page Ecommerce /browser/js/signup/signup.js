app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignUpCtrl'
    });

});

app.controller('SignUpCtrl', function ($scope, AuthService, $state, OrderFactory, $localStorage, CartFactory) {

    $scope.login = {};
    $scope.error = null;

    $scope.checkingOut = $localStorage.checkingOut
    console.log("local storage currentstore",$localStorage.currentStore)

    $scope.sendLogin = function (signupInfo) {

        $scope.error = null;
        
        AuthService.signup(signupInfo).then(function (user) {
        if($localStorage.cart === undefined) $localStorage.cart = []
                return OrderFactory.parseAndCreateCart($localStorage.cart, user)
        }).then(function () {
            $localStorage.cart = [];

            if($scope.checkingOut === true){
                $state.go('cart')
            }

            $state.go('store');

        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

});