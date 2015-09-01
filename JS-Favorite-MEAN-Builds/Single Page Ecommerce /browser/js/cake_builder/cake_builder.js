app.config(function ($stateProvider, $urlRouterProvider) {
    $stateProvider.state('cake-builder', {
        url: '/store/:storeId/cake-builder',
        templateUrl: 'js/cake_builder/cake_builder.html',
        controller: 'CakeBuilderCtrl'
    });
        // nested states 
    // each of these sections will have their own view
    // url will be nested (/form/profile)
    $stateProvider.state('cake-builder.first', {
        url: '/first',
        templateUrl: 'js/common/directives/cake-builder-form/wizard/layers.html'
    })
    
    // url will be /form/interests
    $stateProvider.state('cake-builder.second', {
        url: '/second',
        templateUrl: 'js/common/directives/cake-builder-form/wizard/icing-fillings.html'
    })
    
    // url will be /form/payment
    $stateProvider.state('cake-builder.third', {
        url: '/third',
        templateUrl: 'js/common/directives/cake-builder-form/wizard/finalize.html'
    });
        
    // catch all route
    // send users to the form page 
    $urlRouterProvider.otherwise('/store/:storeId/cake-builder/first');

});

app.controller('CakeBuilderCtrl', function ($scope, AuthService, $state, CakeFactory) {


});