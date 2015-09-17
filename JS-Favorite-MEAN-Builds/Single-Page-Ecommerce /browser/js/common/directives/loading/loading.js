app.directive('loadingGif', function ($rootScope) {
    return {
        restrict: 'E',
        template: '<div id="loader-container"><img src="http://www.sherv.net/cm/emoticons/eating/eating-a-whole-cake-smiley-emoticon.gif"></div>',
    };
});