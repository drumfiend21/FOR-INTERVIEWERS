
var app = angular.module('flashCards', ['ui.router']);

app.filter("cheat" , function(){
    console.log('filter registering...');

    return function(collection){
        console.log('filter running...');
        return collection.filter(function(answer){
            return answer.correct === true;
        });
        
    };
});





app.config(function ($stateProvider) {

	console.log("config was hit")

    $stateProvider.state('newCardForm', {
        url: '/newcard',
        templateUrl: '/templates/newCardForm.html',
        controller: 'NewCardController'
    });

    $stateProvider.state('statisticsPanel', {
        url: '/stats',
        templateUrl: '/templates/statsController.html',
        controller: 'StatsController'
    });

    $stateProvider.state('allFlashCards', {
        url: '/',
        templateUrl: '/templates/flashCard.html',
        controller: 'MainController'
    });

    $stateProvider.state('editCard', {
        url: '/editCard/:id',
        templateUrl: '/templates/editCard.html',
        controller: 'editCardController'
    });



});