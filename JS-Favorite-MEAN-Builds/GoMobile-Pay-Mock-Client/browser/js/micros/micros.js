app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('micros', {
        url: '/micros',
        controller: 'MicrosController',
        templateUrl: 'js/micros/micros.html'
    });

});

app.controller('MicrosController', function ($scope, MicrosFactory, AuthService) {

    // $scope.micros;
    // $scope.image;
    $scope.whichName = null;

    $scope.levels = [
        'mild',
        'medium',
        'medium-spicy',
        'spicy'
    ];

    AuthService.getLoggedInUser().then(function (currUser){
            $scope.isAdmin = currUser.admin;
    });

    $scope.showAllMicros = function () {
        MicrosFactory.getAllMicros().then(function (micros) {
            $scope.micros = micros;
        });
    };
    $scope.showMicroById = function(microid) {
        MicrosFactory.getMicroById(microid).then(function (micro){
            $scope.micros = [micro];
        });
    };
    $scope.showMicroByName = function(microname) {
        MicrosFactory.getMicroByName(microname).then(function (micro){
            $scope.micros = [micro];
            $scope.image = micro.image;
        });
    };

    $scope.showMicrosBySpice = function (spicelevel) {
        MicrosFactory.getMicrosBySpice(spicelevel).then(function (micros){
            $scope.micros = micros;
        }).catch(function (err) {console.log(err);});
    };
    $scope.addMicro = function (micro) {
        console.log("in add micro");
        MicrosFactory.createMicro(micro).then(function (newMicro){
            $scope.newMicro = {
                name: null,
                spice: null,
                price: null,
                description: null,
                image: null,
                inventory: null
            };
        });
    };
    $scope.deleteMicro = function (id){
        MicrosFactory.deleteMicroById(id).then(function(){
            return;
        });
    };
    
    $scope.showAllMicros();

});