app.config(function ($stateProvider) {


    $stateProvider.state('adminStockCakes', {
        url: '/store/:storeId/admin/cake',
        templateUrl: 'js/admin/cake/list.html',
        controller: 'AdminCakeCtrl',
        data: { adminAuthenticate: true }
    });

    $stateProvider.state('adminUsers', {
        url: '/store/:storeId/admin/users',
        templateUrl: 'js/admin/users.html',
        controller: 'AdminUsersCtrl',
        data: { adminAuthenticate: true }
    });

    // $stateProvider.state('adminStockCakes.outOfStock', {
    //     url: '/store/:storeId/admin/cake/out',
    //     templateUrl: 'js/admin/cake/list.html',
    //     controller: 'AdminCakeQuantityCtrl',
    //     data: { adminAuthenticate: true }
    // });


    $stateProvider.state('adminOrders', {
        url: '/store/:storeId/admin/orders',
        templateUrl: 'js/admin/orders/list.html',
        controller: 'AdminOrderCtrl',
        data: { adminAuthenticate: true }
    });

    $stateProvider.state('adminHome', {
        url: '/store/:storeId/adminHome',
        templateUrl: 'js/admin/home.html',
        controller: 'AdminCtrl',
        data: { adminAuthenticate: true }
    });

    $stateProvider.state('adminCategory', {
        url: '/store/:storeId/admin/category/:category',
        templateUrl: 'js/admin/list.html',
        controller: 'AdminCateogryCtrl',
        data: { adminAuthenticate: true }
    });
});

app.controller('AdminCtrl', function ($scope, $state, AdminFCT, $stateParams) {
    console.log('blah');
    AdminFCT.getStoreInfo($stateParams.storeId).then(function (data) {
        $scope.storeName = data.data.name;
        console.log('DATA', data);
    });

    $scope.storeId = $stateParams.storeId;
});




app.controller('AdminUsersCtrl', function ($scope, $state, AdminFCT, AuthService, $stateParams) {
    $scope.loading = true;
    $scope.storeId = $stateParams.storeId;
    $scope.searchInput = false;
    AuthService.getLoggedInUser($stateParams.storeId).then(function (user){
        setTimeout(function() {
            $scope.theUser = user;
            $scope.loading = false;
            $scope.$digest();
        }, 2000);
    });

    AdminFCT.getAdminUsers($stateParams.storeId).then(function (data){
        $scope.userList = data.data;
    });

    $scope.removeAdminStatus = function (userId) {
        AdminFCT.removeAdminStatus($stateParams.storeId, userId).then(function (){
            $scope.userList = $scope.userList.filter(function (user){
                if(user._id !== userId) return user;
            });
        });
    };

    $scope.searchNonAdminUser = function () {
        $scope.searchInput = true;
        $scope.searchReturn = [];
    };

    $scope.searchUser = function (email) {
        $scope.loading = true;
        AdminFCT.searchNonAdminUser($stateParams.storeId, email).then(function (data) {
            setTimeout(function() {
                $scope.searchReturn = data.data;
                $scope.loading = false;
                $scope.$digest();
            }, 2000);
        });
    };

    $scope.makeAdmin = function (userId) {
        AdminFCT.makeAdminUser($stateParams.storeId, userId).then(function (data) {
            $scope.searchReturn = [];
            $scope.searchInput = false;
            $scope.userList.push(data.data);
        });
    };

});

// app.filter('adminCakes', function () {
//     console.log(arguments);
//     // return function (cake, state) {
//         // console.log(args);
//         // console.log('CAke',cake);
//         // console.log('State',state);
//         // if(cake.quantity < 5) {
//             // return cake
//         // }
//         // return cake;
//     // }
// });


app.controller('AdminOrderCtrl', function ($scope, AdminFCT, OrderFactory, $stateParams) {
    $scope.storeId = $stateParams.storeId;
    AdminFCT.getAllOrders($stateParams.storeId).then(function (data) {
        console.log('ORDERS', data.data)
        $scope.orderList = data.data;
    });

    

    $scope.completeOrder = function(orderId) {
        OrderFactory.completeOrder(orderId, $scope.storeId).then(function (data){
            console.log('data', data);
        });
        
        console.log('completeOrder RETURN', orderId);
    }
});

app.controller('AdminCakeCtrl', function ($scope, $state, AdminFCT, $stateParams, StoreSingleFCT) {
    // console.log("You are in AdminCakeCtrl")
    $scope.storeId = $stateParams.storeId;
    // console.log("this hsould be store ID", $scope.storeId)
    StoreSingleFCT.getAll($stateParams.storeId).then(function (data) {
        $scope.cakeList = data.data;
        console.log("here are the cakes you should see", data)
    });



    $scope.newCake = false;
    $scope.activeCakeEditId = '';
    // $scope.cake.layers = [{number: 1, filling: undefined},{number: 2, filling: undefined},{number: 3, filling: undefined}];

    $scope.changeLayerNum = function(number) {
        // console.log('Layers', number);
        // for(var i = 1; i <= number;i++) {
        //     $scope.cake.layers[i].filling = null;
        // }
        // $scope.apply();
    };

    $scope.showEditCake = function(cakeId) {
        $scope.newCake = false;
        $scope.activeCakeEditId = cakeId;
    };

    $scope.deleteCake = function(itemId) {
        // AdminFCT.deleteIcing(itemId).then(function (data) {
        //     $scope.itemList = $scope.itemList.filter(function (obj) {
        //         if(obj._id !== itemId) return obj;
        //     });
        // });
    };
});

var firstCap = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

app.controller('AdminCateogryCtrl', function ($scope, $state, AdminFCT, $stateParams) {
    $scope.loading = true;
    $scope.storeId = $stateParams.storeId;
    $scope.activeEditId = '';
    AdminFCT.getAllCategory($stateParams.storeId, $stateParams.category).then(function (data) {
        $scope.cateName = firstCap($stateParams.category);
        setTimeout(function() {
            console.log('SCOPE LOADING',$scope.loading);
            $scope.loading = false;
            console.log('SCOPE LOADING',$scope.loading);
            $scope.itemList = data.data;
            $scope.$digest();
        }, 8000);
    });


    $scope.saveItem = function(item) {

        if(item._id) {
            AdminFCT.postEditCategory($stateParams.storeId, $stateParams.category, item).then(function (data) {
                $scope.itemList.map(function (obj) {
                    if(obj._id === item._id) return data.data;
                    else return obj;
                });
            });
        } else {
            AdminFCT.postNewCategory($stateParams.storeId, $stateParams.category, item).then(function (data) {
                $scope.itemList.push(data.data); 
            });
        }

        $scope.activeEditId = '';
        $scope.item = {};
        $scope.newItem = false;
    };
    $scope.deleteItem = function(itemId) {
        AdminFCT.deleteCategory($stateParams.storeId, $stateParams.category, itemId).then(function (data) {
            $scope.itemList = $scope.itemList.filter(function (obj) {
                if(obj._id !== itemId) return obj;
            });
        });
    };



    $scope.showEditItem = function(itemId) {
        $scope.newItem = false;
        $scope.activeEditId = itemId;
    };

    $scope.removeForm = function() {
        console.log('fire');
        $scope.newItem = false;
        $scope.activeEditId = '';

    };
});