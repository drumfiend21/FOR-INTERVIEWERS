app.config(function ($stateProvider) {

    $stateProvider.state('checkout', {
        url: '/checkout',
        templateUrl: 'js/iframe/iframe.html',
        controller: 'iframeCtrl'
        // ,
        // data: {
        // 	authenticate: true
        // }
    });

});

app.controller('iframeCtrl', function ($scope, AuthService, $state) {



});