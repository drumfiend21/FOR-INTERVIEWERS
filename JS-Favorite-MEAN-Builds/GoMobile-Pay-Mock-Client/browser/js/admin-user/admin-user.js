app.config(function ($stateProvider) {

    $stateProvider.state('admin-user', {
        url: '/admin-user',
        templateUrl: 'js/admin-user/admin-user.html',
        controller: 'ManageUserCtrl'
    });

});

app.controller('ManageUserCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.error = null;
    $scope.searchingUser = false;
    $scope.userlist = null;
    $scope.promoteBool = null;

//checks if current user is admin
    AuthService.getLoggedInUser().then(function (currUser){
            $scope.isAdmin = currUser.admin;
    });

//lists all users
    $scope.getAllUsers = function () {

        UserFactory.getAllUsers()
        .then(function (users) {
            $scope.userlist = users;
        })
        .catch(function () {
            $scope.error = 'Invalid action of listing all users.';
        });    
    };

//lists a user by id
    $scope.getUserById = function (id, info) {

        UserFactory.getUserById(id)
        .then(function (user) {
            $scope.userlist = user;
        })
        .catch(function () {
            $scope.error = 'Invalid action of listing a particular user.';
        });
    };

//get user by email
    $scope.getUserByEmail = function (email) {
        $scope.searchingUser = true;
        UserFactory.getUserByEmail(email)
        .then(function (user) {
            console.log(user);
            $scope.foundUser = user;
        });
    };

//promotes user to admin; needs to be checked if working
    $scope.promoteToAdmin = function (adminBool) {



        console.log('THIS IS FOUND USER!!!!!', $scope.foundUser.user._id);

        UserFactory.promoteUserStatus($scope.foundUser.user._id, {admin: adminBool}).then(function (response) {
            console.log('ADMIN STATUS CHANGED!');
        });

    };

    $scope.resetPassword = function (resetBool) {

        UserFactory.triggerReset($scope.foundUser.user.email, {changepassword: resetBool})
        .then(function (response) {
            console.log('Password reset triggerred!', $scope.foundUser.user);
        })

    }

//deletes a user
    $scope.deleteUser = function (userId) {

        userId = $scope.foundUser.user._id;

        UserFactory.deleteUserById(userId)
        .then(function (response) {
            console.log('USER DELETED!!!');
        })
        .catch(function () {
            $scope.error = 'Invalid action of deleting a user.';
        });
    };
});