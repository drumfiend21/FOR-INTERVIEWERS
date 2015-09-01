app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/register',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignUpCtrl'
    });

});

app.controller('SignUpCtrl', function ($scope, AuthService, $state, $http) {

    console.log("you've hit the signupCtrl")
    $scope.error = null;

    $scope.sendLogin = function (signupInfo) {

        $scope.error = null;

        console.log("signup object,", signupInfo )

        console.log("AuthService", AuthService)

        // authFCT.postSignUpForm(signupInfo)
        
        AuthService.signup(signupInfo).then(function (user) {

            $state.go('acccount');

        }).catch(function () {
            $scope.error = 'Invalid login credentials.';
        });

    };

    $http.get('/api/register/mock-hash').then(function(response){
           
            return response.data;
    
    })

});