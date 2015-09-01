app.controller('MainController', function ($scope, FlashCardsFactory, ScoreFactory) {

	$scope.categories = [
    'MongoDB',
    'Express',
    'Angular',
    'Node'
	];
	

	$scope.getCategoryCards = function(category){
		

		$scope.category = category

		$scope.Angular 
		category === "Angular"
		$scope.Express
		 category === "Express"
		$scope.Node 
		category === "Node"

		
		$scope.results = FlashCardsFactory.getFlashCards(category);
	
		$scope.flashCards = $scope.results.then(function(data){
			$scope.flashCards = data;	
		})

		//add class to button div

	};	

	$scope.getCategoryCards();

	$scope.answerQuestion = function (answer, flashCard) {
		if (!flashCard.answered) {
			flashCard.answered = true;
			flashCard.answeredCorrectly = answer.correct;
			answer.correct ? ScoreFactory.correct++ : ScoreFactory.incorrect ++;
				

		}
	}

	// $scope.fn = return 
});

