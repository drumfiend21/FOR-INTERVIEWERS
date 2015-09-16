app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });

});

app.controller('LoginCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.isCollapsed = true;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

/*if the user needs to change their password they will be redirected to the "reset password" view once they log in.
Otherwise, they will be redirected to the "home" view once they log in.*/

        AuthService.login(loginInfo)
        .then(function (user) {
            if(user.changepassword) {
                $state.go('reset');
            } else {
                $state.go('home');
            }
        })
        .catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };

    $scope.resetpassword = function () {
        $state.go('reset');
    };
});