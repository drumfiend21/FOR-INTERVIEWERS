app.controller('MainController', function ($scope, FlashCardsFactory, ScoreFactory, $rootScope) {

	$scope.categories = [
    'MongoDB',
    'Express',
    'Angular',
    'Node'
	];
	

	$scope.getCategoryCards = function(category){
		
		// $scope.loadCheck = FlashCardsFactory.loadcheck;
		$scope.loadCheck = true;
		console.log("I AM BEING CALLED", $scope.loadCheck)

		$scope.category = category

		// $scope.Angular 
		// category === "Angular"
		// $scope.Express
		//  category === "Express"
		// $scope.Node 
		// category === "Node"


		
		$scope.results = FlashCardsFactory.getFlashCards(category)
	
		$scope.results.then(function(data){
			$rootScope.flashCards = data;	
			console.log($rootScope.flashCards, "retrieved cards")
			$scope.loadCheck = false;
			// console.log("get cards was called" , $scope.loadCheck)
		})

		//add class to button div

	};	

	

	$scope.getCategoryCards();



	// $scope.answerQuestion = function (answer, flashCard) {
	// 	if (!flashCard.answered) {
	// 		flashCard.answered = true;
	// 		flashCard.answeredCorrectly = answer.correct;
	// 		answer.correct ? ScoreFactory.correct++ : ScoreFactory.incorrect ++;
				

	// 	}
	// }

	// $scope.fn = return 
});