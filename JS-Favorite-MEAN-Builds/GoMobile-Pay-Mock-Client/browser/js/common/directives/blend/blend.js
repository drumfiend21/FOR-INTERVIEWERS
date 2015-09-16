app.directive('blend', function (CartFactory, BlendsFactory, AuthService) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/blend/blend.html',
        scope: {
            blend: '=',
            isNewBlendFormOpen: '=',
            deleteblend: '&'
        },
        link: function (scope) {
        	scope.quantity = 1;
          scope.isAdmin = false; 
          scope.addToCart = function(blend, quantity) {
          	var blendWithQuantity = blend;
          	blendWithQuantity.quantity = quantity;
          	console.log("blend with quantity", blendWithQuantity); 
            CartFactory.saveCart(blend.name, blendWithQuantity);
          };
          AuthService.getLoggedInUser()
          .then(
            function (user){
            if (user) scope.isAdmin = user.admin;
          });
        }
    };
});