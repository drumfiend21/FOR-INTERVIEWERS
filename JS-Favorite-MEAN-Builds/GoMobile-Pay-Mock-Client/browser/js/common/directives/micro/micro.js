app.directive('micro', function (AuthService, MicrosFactory) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/micro/micro.html',
        scope: {
            micro: '='
        },
        link: function (scope) {
        	//checks if current user is admin
            AuthService.getLoggedInUser().then(function (currUser){
                scope.isAdmin = currUser.admin;
            });

            scope.isCollapsed = true;

            scope.editMicro = function (inventory, price) {
                MicrosFactory.editMicroById(scope.micro._id, {inventory: inventory, price: price}).then(function (response){
                    console.log('Inventory Changed!');
                });
            };

		}
    };

});