app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/register',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignUpCtrl'
    });

});

app.controller('SignUpCtrl', function ($scope, AuthService, $state, $http) {
    
    $scope.error = null;

    $scope.sendLogin = function (signupInfo) {
        $scope.error = null;        
        AuthService.signup(signupInfo).then(function (user) {
            $state.go('account');
        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });
    };

    $http.get('/api/register/mock-hash').then(function(response){
            return response.data;
    })

});