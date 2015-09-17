app.controller('editCardController', function ($scope, FlashCardsFactory, ScoreFactory, $state, $rootScope, $stateParams) {


	$scope.editCheck = false;

	$scope.hideCard = false;

	$scope.editedCard;

	$scope.editCardForm

	$scope.mockCard;

	// $scope.editCard = function(carde){

	// 	console.log("editCard method was hit", carde)
	// 	$scope.editedCard = carde;

	// 	$scope.editCheck = true;


	// }


	$scope.editedCard = FlashCardsFactory.cardToBeEdited;

	$scope.submitEditCard=function(){

		FlashCardsFactory.addNewCard($scope.editedCard).then(function(data){
			$scope.editCheck = false;
		})
		FlashCardsFactory.getFlashCards().then(function(cards){
				$rootScope.flashCards = cards
				if(FlashCardsFactory.cardToBeEdited.answered) {
					console.log("score reset",FlashCardsFactory.cardToBeEdited.answeredCorrectly)
					console.log(FlashCardsFactory.cardToBeEdited.answeredCorrectly === true)
					if(FlashCardsFactory.cardToBeEdited.answeredCorrectly === true) ScoreFactory.correct --;
					if(FlashCardsFactory.cardToBeEdited.answeredCorrectly === false) ScoreFactory.incorrect --;


				}
				$state.go("allFlashCards")

			})

	}

	$scope.deleteCard = function(){

		FlashCardsFactory.deleteCard($scope.editedCard).then(function(){
		})
			
			$scope.hideCard = true;
			FlashCardsFactory.getFlashCards().then(function(cards){
				$rootScope.flashCards = cards
				$state.go("allFlashCards")
				$rootScope.flashCards = $rootScope.flashCards.map(function(el){
					if (el._id !== $scope.editedCard._id) return el;
				})
			})

			
	}

	$scope.cancelEdit = function(){
		$scope.editCheck = false;
		$state.go("allFlashCards")
	}

	FlashCardsFactory.getFlashCards().then(function(cards){
		cards.forEach(function(card){
			if(card._id === $stateParams.id) $scope.editedCard = card 
		})
	})



});