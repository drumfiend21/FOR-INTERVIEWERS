app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });

});

app.controller('SignupCtrl', function ($scope, UserFactory, AuthService, $state) {

    $scope.signup = {};
    $scope.error = null;

    $scope.createUser = function (user) {

        $scope.error = null;

        UserFactory.createUser(user)
        .then(function() {
            return AuthService.login(user);
        })
        .then(function () {
            $state.go('home');
        }).catch(function () {
            $scope.error = 'Invalid signup credentials.';
        });
    };

});