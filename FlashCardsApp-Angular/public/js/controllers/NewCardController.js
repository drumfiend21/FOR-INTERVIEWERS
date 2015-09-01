app.controller('NewCardController', function ($scope, $http, $rootScope, $state) {
	console.log("NewCardController was hit")
	$scope.newCard = {
	    question: null,
	    category: null,
	    answers: [
	        { text: null, correct: false },
	        { text: null, correct: false },
	        { text: null, correct: false }
	    ]
	}

	$scope.submitCard = function(){
		//ajax call

		$http.post('/cards', $scope.newCard).then(function(data){

			$rootScope.flashCards.push(data.data);

			$scope.newCard= {};
			$scope.newCardForm.category.$touched = false;
			$scope.newCardForm.question.$touched = false;
			$state.go("allFlashCards")

		});
	}




});