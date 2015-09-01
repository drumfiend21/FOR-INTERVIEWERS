app.directive("border", function(FlashCardsFactory, ScoreFactory){
	return{
		restrict: 'A',
		scope:{
			border: '=',
		},
		link: function(scope, element, attrs){


				element.on('mouseenter', function () {
					// angular.element(this).toggleClass("border")
					// angular.element(this).css("border","10px solid black");
					angular.element(this).css("box-shadow","0 0 0 2px black inset");

				});
				element.on('mouseleave', function () {
					// angular.element(this).toggleClass("border")
					// angular.element(this).css("border","1px solid black");
					angular.element(this).css("box-shadow","none");

				});

		}
	};
});