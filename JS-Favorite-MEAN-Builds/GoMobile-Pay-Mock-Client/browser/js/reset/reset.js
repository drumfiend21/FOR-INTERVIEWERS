app.config(function ($stateProvider) {

    $stateProvider.state('reset', {
        url: '/reset/:id',
        templateUrl: 'js/reset/reset.html',
        controller: 'ResetPasswordCtrl'
    });

});

app.controller('ResetPasswordCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.reset = {};
    $scope.error = null;

/*By submitting the form, user's password will be changed in the database.
The user's changePasswordStatus in the database will also be changed to false once the password change is made.*/

    $scope.resetUserPassword = function (info) {

        $scope.error = null;
        
        AuthService.getLoggedInUser().then(function (user) {
                
            UserFactory.resetUserPassword(user._id, info)
            .then(function () {
                $state.go('home');
            })
            .catch(function () {
                $scope.error = 'Invalid reset credentials.';
            });
        });
    };
});