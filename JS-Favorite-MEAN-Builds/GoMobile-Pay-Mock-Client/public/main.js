'use strict';
window.app = angular.module('FullstackGeneratedApp', ['ui.router', 'ui.bootstrap', 'fsaPreBuilt']);

app.config(function ($urlRouterProvider, $locationProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

    // The given state requires an authenticated user.
    var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
        return state.data && state.data.authenticate;
    };

    // $stateChangeStart is an event fired
    // whenever the process of changing a state begins.
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

        if (!destinationStateRequiresAuth(toState)) {
            // The destination state does not require authentication
            // Short circuit with return.
            return;
        }

        if (AuthService.isAuthenticated()) {
            // The user is authenticated.
            // Short circuit with return.
            return;
        }

        // Cancel navigating to new state.
        event.preventDefault();

        AuthService.getLoggedInUser().then(function (user) {
            // If a user is retrieved, then renavigate to the destination
            // (the second time, AuthService.isAuthenticated() will work)
            // otherwise, if no user is logged in, go to "login" state.
            if (user) {
                $state.go(toState.name, toParams);
            } else {
                $state.go('login');
            }
        });
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('admin-user', {
        url: '/admin-user',
        templateUrl: 'js/admin-user/admin-user.html',
        controller: 'ManageUserCtrl'
    });
});

app.controller('ManageUserCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.error = null;
    $scope.searchingUser = false;
    $scope.userlist = null;
    $scope.promoteBool = null;

    //checks if current user is admin
    AuthService.getLoggedInUser().then(function (currUser) {
        $scope.isAdmin = currUser.admin;
    });

    //lists all users
    $scope.getAllUsers = function () {

        UserFactory.getAllUsers().then(function (users) {
            $scope.userlist = users;
        })['catch'](function () {
            $scope.error = 'Invalid action of listing all users.';
        });
    };

    //lists a user by id
    $scope.getUserById = function (id, info) {

        UserFactory.getUserById(id).then(function (user) {
            $scope.userlist = user;
        })['catch'](function () {
            $scope.error = 'Invalid action of listing a particular user.';
        });
    };

    //get user by email
    $scope.getUserByEmail = function (email) {
        $scope.searchingUser = true;
        UserFactory.getUserByEmail(email).then(function (user) {
            console.log(user);
            $scope.foundUser = user;
        });
    };

    //promotes user to admin; needs to be checked if working
    $scope.promoteToAdmin = function (adminBool) {

        console.log('THIS IS FOUND USER!!!!!', $scope.foundUser.user._id);

        UserFactory.promoteUserStatus($scope.foundUser.user._id, { admin: adminBool }).then(function (response) {
            console.log('ADMIN STATUS CHANGED!');
        });
    };

    $scope.resetPassword = function (resetBool) {

        UserFactory.triggerReset($scope.foundUser.user.email, { changepassword: resetBool }).then(function (response) {
            console.log('Password reset triggerred!', $scope.foundUser.user);
        });
    };

    //deletes a user
    $scope.deleteUser = function (userId) {

        userId = $scope.foundUser.user._id;

        UserFactory.deleteUserById(userId).then(function (response) {
            console.log('USER DELETED!!!');
        })['catch'](function () {
            $scope.error = 'Invalid action of deleting a user.';
        });
    };
});
app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('blends', {
        url: '/blends',
        controller: 'BlendsController',
        templateUrl: 'js/blends/blends.html'
    });
});

app.controller('BlendsController', function ($scope, BlendsFactory, MicrosFactory, CartFactory) {
    $scope.allBlends = null;
    $scope.allMicros = null;
    $scope.selectedMicros = [];
    $scope.blends = null;
    $scope.editedBlend = null;
    $scope.whichNameToGet = null;
    $scope.whichToEdit = null;
    $scope.isNewBlendFormOpen = false;
    $scope.newBlend = {
        name: null,
        micros: [],
        price: null
    };

    BlendsFactory.getAllBlends().then(function (blends) {
        $scope.allBlends = $scope.blends = blends;
    });

    MicrosFactory.getAllMicros().then(function (micros) {
        $scope.allMicros = micros;
        for (var i = 0; i < $scope.allMicros.length; i++) {
            var microObject = {
                id: $scope.allMicros[i]._id,
                selected: false
            };
            $scope.selectedMicros.push(microObject);
        }
    });

    $scope.logThis = function (something) {
        console.log(something);
    };
    $scope.showAllBlends = function () {
        BlendsFactory.getAllBlends().then(function (blends) {
            $scope.isNewBlendFormOpen = false;
            $scope.allBlends = $scope.blends = blends;
        });
    };
    $scope.showBlendById = function (blendid) {
        BlendsFactory.getBlendById(blendid).then(function (blend) {
            $scope.blends = blend;
        });
    };
    $scope.showBlendByName = function (blendname) {
        BlendsFactory.getBlendByName(blendname).then(function (blend) {
            $scope.blends = [blend];
            // $scope.image = blend.image;
        });
    };
    $scope.addBlend = function (blend) {
        var justIds = blend.micros.map(function (obj) {
            return obj._id;
        });
        blend.micros = justIds;
        BlendsFactory.createBlend(blend).then(function (newBlend) {
            $scope.newBlend = {
                name: null,
                micros: [],
                price: null
            };
            CartFactory.saveCart(newBlend.name, newBlend);
            $scope.showAllBlends();
            // BlendsFactory.getAllBlends().then(function (blends) {
            //     $scope.allBlends = blends;
            // }); 
        });
    };
    $scope.deleteBlend = function (id) {
        BlendsFactory.deleteBlendById(id).then(function () {
            return BlendsFactory.getAllBlends();
        }).then(function (blends) {
            $scope.blends = $scope.allBlends = blends;
        });
    };
    $scope.loadBlendToEdit = function (id) {
        BlendsFactory.getBlendById(id).then(function (blend) {
            $scope.editedBlend = blend;
        });
    };
    $scope.editBlend = function (id, blend) {
        BlendsFactory.editBlendById(id, blend).then(function (blend) {
            $scope.editedBlend = blend;
        });
    };

    $scope.refreshNewBlend = function (selectedMicro) {
        var allMicrosIndexOfObject = null;
        for (var i = 0; i < $scope.allMicros.length; i++) {
            if ($scope.allMicros[i]._id === selectedMicro.id) {
                allMicrosIndexOfObject = i;
            }
        }
        var indexOfSelectedMicro = $scope.newBlend.micros.indexOf($scope.allMicros[allMicrosIndexOfObject]);
        if (selectedMicro.selected) {
            if (indexOfSelectedMicro === -1) {
                for (var j = 0; j < $scope.allMicros.length; j++) {
                    if ($scope.allMicros[j]._id === selectedMicro.id) {
                        $scope.newBlend.micros.push($scope.allMicros[j]);
                    }
                }
            }
        } else {
            if (indexOfSelectedMicro !== -1) {
                $scope.newBlend.micros.splice(indexOfSelectedMicro, 1);
            }
        }
    };
    $scope.setPrice = function (price) {
        $scope.newBlend.price = price;
    };
});
app.config(function ($stateProvider) {

    // Register our *about* state.
    $stateProvider.state('cart', {
        url: '/cart',
        controller: 'CartController',
        templateUrl: 'js/cart/cart.html'
    });
});

app.controller('CartController', function ($q, $scope, AuthService, UserFactory, CartFactory, OrdersFactory, $state, $http) {
    //TCHOPAY MOCKUP

    // $("#checkout-button").on('click', function(){
    //     $('html').append('<link rel="stylesheet" href="http://192.168.1.148:1337/iframe.css" type="text/css"/>')
    //    $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()    
    //    var framein = function(){
    //        $("<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='http://192.168.1.148:1337/checkout'></iframe>").appendTo($('html')).animate({top: "+10%"}, 500, 'easeInOutBack')
    //        // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
    //            var test = "test";
    //            // console.log("frame domain", frame.contentWindow.document.domain)
    //            // debugger;
    //            var func = function(){

    //                var frame = document.getElementById('tchopay-iframe');
    //                console.log(frame.contentWindow)
    //                frame.contentWindow.postMessage(test, 'http://192.168.1.148:1337/');
    //            }
    //            setTimeout(func, 2000)

    //    }   
    //    setTimeout(framein, 500)

    // })

    var tchoPayInit = function tchoPayInit() {
        return $http.get('/api/orders/init').then(function (response) {

            //select stuff on dom.... we will first put button on dom

            var initObj = response.data;

            $("#tchopay-script").attr("data-transactionHashValue", initObj.transactionHash);
            $("#tchopay-script").attr("data-timestamp", initObj.timestamp);

            console.log("init http response", response);

            return response.data;
        });
    };
    tchoPayInit();

    //extract timestamp and hash and set on button script data-attributes

    ////////////////////////////////////////////////////////

    $scope.logThis = function (something) {
        console.log(something);
    };
    //$scope.items is an array of objects from localStorage
    $scope.items = CartFactory.getCart();

    $scope.removeItem = function (index) {
        CartFactory.deleteItem($scope.items[index].name);
        $scope.items.splice(index, 1);
    };

    $scope.clearCart = function () {
        console.log('hello cart');
        CartFactory.clearAllinCart();
        $scope.items = CartFactory.getCart();
    };

    // use reduce
    $scope.total = function () {
        var total = 0;
        angular.forEach($scope.items, function (blend) {
            total += blend.quantity * blend.price;
        });
        return total;
    };

    $scope.checkout = function (order) {
        console.log("order is ", order);
        if (!AuthService.isAuthenticated()) return $state.go('login');

        var userIdPromise = AuthService.getLoggedInUser().then(function (user) {
            console.log('this is user logged in from checkout', user);
            return user._id;
        });

        var formattedObj = order.map(function (obj) {
            return { typeofblend: obj._id, quantity: obj.quantity, name: obj.name };
        });
        order = formattedObj;

        var toSubmit = { blend: order, status: "created" };
        console.log(toSubmit);

        $q.all([OrdersFactory.createOrder(toSubmit), userIdPromise]).then(function (results) {
            var createdOrder = results[0];
            console.log('this is createdOrder', createdOrder);
            var userId = results[1];
            console.log('this is userId', userId);
            CartFactory.clearAllinCart();
            $scope.items = CartFactory.getCart();
            return UserFactory.putOrderOnUser(userId, createdOrder._id);
        }).then(function () {
            $state.go('orders');
        })['catch'](console.error);
    };
});
(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function ($location) {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    // AUTH_EVENTS is used throughout our app to
    // broadcast and listen from and to the $rootScope
    // for important events about authentication flow.
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated',
        notAuthorized: 'auth-not-authorized'
    });

    app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
        var statusDict = {
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
        };
        return {
            responseError: function responseError(response) {
                $rootScope.$broadcast(statusDict[response.status], response);
                return $q.reject(response);
            }
        };
    });

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push(['$injector', function ($injector) {
            return $injector.get('AuthInterceptor');
        }]);
    });

    app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

        // Uses the session factory to see if an
        // authenticated user is currently registered.
        this.isAuthenticated = function () {
            return !!Session.user;
        };

        this.getLoggedInUser = function () {

            // If an authenticated session exists, we
            // return the user attached to that session
            // with a promise. This ensures that we can
            // always interface with this method asynchronously.
            if (this.isAuthenticated()) {
                return $q.when(Session.user);
            }

            // Make request GET /session.
            // If it returns a user, call onSuccessfulLogin with the response.
            // If it returns a 401 response, we catch it and instead resolve to null.
            return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
                return null;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function (response) {
                console.log('this is the response from login', response);
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };

        function onSuccessfulLogin(response) {
            console.log('this calls the onSuccessfulLogin function');
            var data = response.data;
            Session.create(data.id, data.user);
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }
    });

    app.service('Session', function ($rootScope, AUTH_EVENTS) {

        var self = this;

        $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
            self.destroy();
        });

        $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
            self.destroy();
        });

        this.id = null;
        this.user = null;

        this.create = function (sessionId, user) {
            this.id = sessionId;
            this.user = user;
        };

        this.destroy = function () {
            this.id = null;
            this.user = null;
        };
    });
})();
app.config(function ($stateProvider) {
    $stateProvider.state('home', {
        url: '/',
        templateUrl: 'js/home/home.html'
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.isCollapsed = true;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        /*if the user needs to change their password they will be redirected to the "reset password" view once they log in.
        Otherwise, they will be redirected to the "home" view once they log in.*/

        AuthService.login(loginInfo).then(function (user) {
            if (user.changepassword) {
                $state.go('reset');
            } else {
                $state.go('home');
            }
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };

    $scope.resetpassword = function () {
        $state.go('reset');
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('adminsOnly', {
        url: '/admins-area',
        template: '<img ng-repeat="item in stash" width="300" ng-src="{{ item }}" />',
        controller: function controller($scope, SecretStash) {
            SecretStash.getStash().then(function (stash) {
                $scope.stash = stash;
            });
        },
        // The following data.authenticate is read by an event listener
        // that controls access to this state. Refer to app.js.
        data: {
            authenticate: true
        }
    });
});

app.factory('SecretStash', function ($http) {

    var getStash = function getStash() {
        return $http.get('/api/members/secret-stash').then(function (response) {
            return response.data;
        });
    };

    return {
        getStash: getStash
    };
});
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

    $scope.levels = ['mild', 'medium', 'medium-spicy', 'spicy'];

    AuthService.getLoggedInUser().then(function (currUser) {
        $scope.isAdmin = currUser.admin;
    });

    $scope.showAllMicros = function () {
        MicrosFactory.getAllMicros().then(function (micros) {
            $scope.micros = micros;
        });
    };
    $scope.showMicroById = function (microid) {
        MicrosFactory.getMicroById(microid).then(function (micro) {
            $scope.micros = [micro];
        });
    };
    $scope.showMicroByName = function (microname) {
        MicrosFactory.getMicroByName(microname).then(function (micro) {
            $scope.micros = [micro];
            $scope.image = micro.image;
        });
    };

    $scope.showMicrosBySpice = function (spicelevel) {
        MicrosFactory.getMicrosBySpice(spicelevel).then(function (micros) {
            $scope.micros = micros;
        })['catch'](function (err) {
            console.log(err);
        });
    };
    $scope.addMicro = function (micro) {
        console.log("in add micro");
        MicrosFactory.createMicro(micro).then(function (newMicro) {
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
    $scope.deleteMicro = function (id) {
        MicrosFactory.deleteMicroById(id).then(function () {
            return;
        });
    };

    $scope.showAllMicros();
});
app.config(function ($stateProvider) {

    // Register our *orders* state.
    $stateProvider.state('orders', {
        url: '/orders',
        controller: 'OrdersController',
        templateUrl: 'js/orders/orders.html'
    });
});

app.controller('OrdersController', function ($scope, OrdersFactory, BlendsFactory) {

    $scope.allOrders = null;
    $scope.microName = null;
    $scope.randomMicro = null;
    $scope.recommendedBlend = null;
    $scope.orderIds = [];
    // $scope.showRecommendation = false;

    OrdersFactory.getAllOrders().then(function (orders) {
        $scope.allOrders = orders;
        if (orders.length) {
            // $scope.showRecommendation = true;
        }
    });

    $scope.showOrders = function () {
        OrdersFactory.getAllOrders().then(function (orders) {
            console.log('orders argument', orders);
            $scope.orderIds = orders.map(function (obj) {
                return obj._id;
            });
            console.log('these are orderIds', $scope.orderIds);
            $scope.orderIds.forEach(function (orderid) {

                OrdersFactory.getOrderById(orderid).then(function (order) {
                    console.log('the order:', order);
                    $scope.order = order;
                    BlendsFactory.getBlendById(order.blend[0].typeofblend).then(function (blend) {

                        console.log('the micro array', blend.micros);

                        $scope.microName = blend.micros.map(function (obj) {
                            return obj.name;
                        });

                        $scope.randomMicro = $scope.microName[Math.floor(Math.random() * $scope.microName.length)];
                        console.log('this is blend ordered', blend);

                        BlendsFactory.getAllBlends().then(function (blends) {
                            console.log('all the blends', blends);

                            $scope.matchedBlends = blends.filter(function (blend) {
                                var hasRandomMicro = false;
                                blend.micros.forEach(function (micro) {
                                    if (micro.name === $scope.randomMicro) {
                                        hasRandomMicro = true;
                                    }
                                });
                                return hasRandomMicro;
                            });

                            $scope.recommendedBlend = $scope.matchedBlends[Math.floor(Math.random() * $scope.matchedBlends.length)];
                        });
                    });
                });
            });
            $scope.orders = orders;
            // $scope.showRecommendation = true;
        });
    };

    $scope.showOrdersById = function (orderid) {
        OrdersFactory.getOrderById(orderid).then(function (order) {
            $scope.orders = order;
        });
    };

    $scope.loadOrderToEdit = function (id) {
        OrdersFactory.getOrderById(id).then(function (order) {
            $scope.editedOrder = order;
        });
    };

    $scope.editOrder = function (id, order) {
        //console.log('editOrder', order.status);
        OrdersFactory.editOrderById(id, order.status).then(function (order) {
            //console.log('after editing ', order);
            $scope.editedOrder = order;
        });
    };

    $scope.deleteOrder = function (id) {
        OrdersFactory.deleteOrderById(id).then(function () {

            OrdersFactory.getAllOrders().then(function (orders) {
                $scope.allOrders = orders;
            });
            return;
        });
    };

    $scope.showOrders();
});

app.config(function ($stateProvider) {

    $stateProvider.state('reset', {
        url: '/reset/:id',
        templateUrl: 'js/reset/reset.html',
        controller: 'ResetPasswordCtrl'
    });
});

app.controller('ResetPasswordCtrl', function ($scope, AuthService, UserFactory, $state) {

    $scope.reset = {};
    $scope.error = null;

    /*By submitting the form, user's password will be changed in the database.
    The user's changePasswordStatus in the database will also be changed to false once the password change is made.*/

    $scope.resetUserPassword = function (info) {

        $scope.error = null;

        AuthService.getLoggedInUser().then(function (user) {

            UserFactory.resetUserPassword(user._id, info).then(function () {
                $state.go('home');
            })['catch'](function () {
                $scope.error = 'Invalid reset credentials.';
            });
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('signup', {
        url: '/signup',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignupCtrl'
    });
});

app.controller('SignupCtrl', function ($scope, UserFactory, AuthService, $state) {

    $scope.signup = {};
    $scope.error = null;

    $scope.createUser = function (user) {

        $scope.error = null;

        UserFactory.createUser(user).then(function () {
            return AuthService.login(user);
        }).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid signup credentials.';
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('tutorial', {
        url: '/tutorial',
        templateUrl: 'js/tutorial/tutorial.html',
        controller: 'TutorialCtrl',
        resolve: {
            tutorialInfo: function tutorialInfo(TutorialFactory) {
                return TutorialFactory.getTutorialVideos();
            }
        }
    });
});

app.factory('TutorialFactory', function ($http) {

    return {
        getTutorialVideos: function getTutorialVideos() {
            return $http.get('/api/tutorial/videos').then(function (response) {
                return response.data;
            });
        }
    };
});

app.controller('TutorialCtrl', function ($scope, tutorialInfo) {

    $scope.sections = tutorialInfo.sections;
    $scope.videos = _.groupBy(tutorialInfo.videos, 'section');

    $scope.currentSection = { section: null };

    $scope.colors = ['rgba(34, 107, 255, 0.10)', 'rgba(238, 255, 68, 0.11)', 'rgba(234, 51, 255, 0.11)', 'rgba(255, 193, 73, 0.11)', 'rgba(22, 255, 1, 0.11)'];

    $scope.getVideosBySection = function (section, videos) {
        return videos.filter(function (video) {
            return video.section === section;
        });
    };
});
app.factory('BlendsFactory', function ($http) {
    return {
        getAllBlends: function getAllBlends() {
            return $http.get("/api/blends").then(function (response) {
                var filteredBlends = response.data.filter(function (blend) {
                    var instock = true;
                    blend.micros.forEach(function (micro) {
                        if (micro.inventory === 0) {
                            instock = false;
                        }
                    });
                    return instock;
                });

                return filteredBlends;
            });
        },
        getBlendById: function getBlendById(blendid) {
            return $http.get("/api/blends/" + blendid).then(function (response) {
                return response.data;
            });
        },
        getBlendByName: function getBlendByName(blendname) {
            // don't have this route yet
            return $http.get("/api/blends/name/" + blendname).then(function (response) {
                return response.data;
            });
        },
        createBlend: function createBlend(blend) {
            return $http.post("/api/blends", blend).then(function (response) {
                return response.data;
            });
        },
        editBlendById: function editBlendById(id, blend) {
            return $http.put('/api/blends/' + id, blend).then(function (response) {
                return response.data;
            });
        },
        deleteBlendById: function deleteBlendById(id) {
            return $http['delete']('/api/blends/' + id);
        }
    };
});
app.factory('CartFactory', function ($rootScope) {
    return {
        // getItem: function (key) {
        //   return JSON.parse(localStorage.getItem(key));
        // },

        deleteItem: function deleteItem(key) {
            localStorage.removeItem(key);
        },

        getCart: function getCart() {
            var archive = [],
                keys = Object.keys(localStorage);
            for (var i = 0; i < keys.length; i++) {
                // console.log("keys i = ", typeof localStorage.getItem(keys[i]))
                if (keys[i] === "debug") {
                    continue;
                } else {
                    var toObj = JSON.parse(localStorage.getItem(keys[i]));
                    archive.push(toObj);
                }
            }
            return archive;
        },

        saveCart: function saveCart(name, info) {
            localStorage.setItem(name, JSON.stringify(info));
        },

        clearAllinCart: function clearAllinCart() {
            localStorage.clear();
        }

    };
});

app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large'];
});
app.factory('MicrosFactory', function ($http) {
    return {
        getAllMicros: function getAllMicros() {
            return $http.get("/api/micros").then(function (response) {
                return response.data;
            });
        },
        getMicroById: function getMicroById(microid) {
            return $http.get("/api/micros/" + microid).then(function (response) {
                return response.data;
            });
        },
        getMicroByName: function getMicroByName(microname) {
            return $http.get("/api/micros/name/" + microname).then(function (response) {
                return response.data;
            });
        },
        getMicrosBySpice: function getMicrosBySpice(spicelevel) {
            return $http.get("/api/micros/spice/" + spicelevel).then(function (response) {
                return response.data;
            });
        },
        createMicro: function createMicro(micro) {
            return $http.post("/api/micros", micro).then(function (response) {
                return response.data;
            });
        },
        editMicroById: function editMicroById(id, micro) {
            return $http.put('/api/micros/' + id, micro).then(function (response) {
                return response.data;
            });
        },
        deleteMicroById: function deleteMicroById(id) {
            return $http['delete']('/api/micros/' + id);
        }
    };
});
app.factory('OrdersFactory', function ($http) {
    return {
        getAllOrders: function getAllOrders() {
            return $http.get("/api/orders").then(function (response) {
                return response.data;
            });
        },
        getOrderById: function getOrderById(orderid) {
            return $http.get("/api/orders/" + orderid).then(function (response) {
                return response.data;
            });
        },
        createOrder: function createOrder(order) {
            return $http.post("/api/orders", order).then(function (response) {
                return response.data;
            });
        },
        editOrderById: function editOrderById(id, order) {
            //console.log("in the factory order is ", order);
            return $http.put('/api/orders/' + id, { "_id": order }).then(function (response) {
                return response.data;
            });
        },
        deleteOrderById: function deleteOrderById(id) {
            return $http['delete']('/api/orders/' + id);
        }
    };
});
app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, microgreens lover! Buy something or leave.', 'Broccoli, you can\'t sit with us.', 'Hello, simple human. I am a superior vegetable.', 'What a beautiful day! The sun is making me age.', 'I\'m like any other veggie, except that I am better. :)', 'ROAR.', '私はおいしいmicrogreenです。私を食べます。'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.factory('ReviewsFactory', function ($http) {
    return {
        getAllReviews: function getAllReviews() {
            return $http.get("/api/reviews").then(function (response) {
                return response.data;
            });
        },
        getReviewById: function getReviewById(reviewid) {
            return $http.get("/api/reviews/" + reviewid).then(function (response) {
                return response.data;
            });
        },
        createReview: function createReview(review) {
            return $http.post("/api/reviews", review).then(function (response) {
                return response.data;
            });
        },
        editReviewById: function editReviewById(id, review) {
            return $http.put('/api/reviews/' + id, review).then(function (response) {
                return response.data;
            });
        },
        deleteReviewById: function deleteReviewById(id) {
            return $http['delete']('/api/reviews/' + id);
        }
    };
});
app.factory('UserFactory', function ($http) {
    return {
        getAllUsers: function getAllUsers() {
            return $http.get("/users").then(function (response) {
                return response.data;
            });
        },
        getUserById: function getUserById(id) {
            return $http.get("/users/" + id).then(function (response) {
                return response.data;
            });
        },
        getUserByEmail: function getUserByEmail(email) {
            return $http.get('/users/email/' + email).then(function (response) {
                return response.data;
            });
        },
        createUser: function createUser(user) {
            return $http.post("/signup", user).then(function (response) {
                return response.data;
            });
        },
        putOrderOnUser: function putOrderOnUser(id, info) {
            return $http.put('/orderonuser/' + id, { _id: info }).then(function (response) {
                return response.data;
            });
        },
        promoteUserStatus: function promoteUserStatus(id, info) {
            return $http.put('/promote/' + id, info).then(function (response) {
                return response.data;
            });
        },
        resetUserPassword: function resetUserPassword(id, info) {
            return $http.put('/reset/' + id, info).then(function (response) {
                return response.data;
            });
        },
        triggerReset: function triggerReset(email, info) {
            return $http.put('/reset/trigger/' + email, info).then(function (response) {
                return response.data;
            });
        },
        deleteUserById: function deleteUserById(id) {
            return $http['delete']('/delete/' + id);
        }
    };
});
app.directive('tutorialSection', function () {
    return {
        restrict: 'E',
        scope: {
            name: '@',
            videos: '=',
            background: '@'
        },
        templateUrl: 'js/tutorial/tutorial-section/tutorial-section.html',
        link: function link(scope, element) {
            element.css({ background: scope.background });
        }
    };
});
app.directive('tutorialSectionMenu', function () {
    return {
        restrict: 'E',
        require: 'ngModel',
        templateUrl: 'js/tutorial/tutorial-section-menu/tutorial-section-menu.html',
        scope: {
            sections: '='
        },
        link: function link(scope, element, attrs, ngModelCtrl) {

            scope.currentSection = scope.sections[0];
            ngModelCtrl.$setViewValue(scope.currentSection);

            scope.setSection = function (section) {
                scope.currentSection = section;
                ngModelCtrl.$setViewValue(section);
            };
        }
    };
});
app.directive('tutorialVideo', function ($sce) {

    var formYoutubeURL = function formYoutubeURL(id) {
        return 'https://www.youtube.com/embed/' + id;
    };

    return {
        restrict: 'E',
        templateUrl: 'js/tutorial/tutorial-video/tutorial-video.html',
        scope: {
            video: '='
        },
        link: function link(scope) {
            scope.trustedYoutubeURL = $sce.trustAsResourceUrl(formYoutubeURL(scope.video.youtubeID));
        }
    };
});
app.directive('blend', function (CartFactory, BlendsFactory, AuthService) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/blend/blend.html',
        scope: {
            blend: '=',
            isNewBlendFormOpen: '=',
            deleteblend: '&'
        },
        link: function link(scope) {
            scope.quantity = 1;
            scope.isAdmin = false;
            scope.addToCart = function (blend, quantity) {
                var blendWithQuantity = blend;
                blendWithQuantity.quantity = quantity;
                console.log("blend with quantity", blendWithQuantity);
                CartFactory.saveCart(blend.name, blendWithQuantity);
            };
            AuthService.getLoggedInUser().then(function (user) {
                if (user) scope.isAdmin = user.admin;
            });
        }
    };
});
app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.directive('micro', function (AuthService, MicrosFactory) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/micro/micro.html',
        scope: {
            micro: '='
        },
        link: function link(scope) {
            //checks if current user is admin
            AuthService.getLoggedInUser().then(function (currUser) {
                scope.isAdmin = currUser.admin;
            });

            scope.isCollapsed = true;

            scope.editMicro = function (inventory, price) {
                MicrosFactory.editMicroById(scope.micro._id, { inventory: inventory, price: price }).then(function (response) {
                    console.log('Inventory Changed!');
                });
            };
        }
    };
});
app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/navbar/navbar.html',
        link: function link(scope) {

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'Micros', state: 'micros' }, { label: 'Blends', state: 'blends' }
            // { label: 'Tutorial', state: 'tutorial' },
            // { label: 'Admins Only', state: 'admin-user', auth: true }
            ];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {
                    $state.go('home');
                });
            };

            var setUser = function setUser() {
                AuthService.getLoggedInUser().then(function (user) {
                    scope.user = user;
                });
            };

            var removeUser = function removeUser() {
                scope.user = null;
            };

            setUser();

            $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
        }

    };
});
app.directive('order', function (OrdersFactory, AuthService) {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/orders/order.html',
        scope: {
            order: '=',
            deleteorder: '&',
            editorder: '&'
        },
        link: function link(scope) {

            AuthService.getLoggedInUser().then(function (currUser) {
                scope.isAdmin = currUser.admin;
            });

            scope.orderStatus = ['created', 'processing', 'cancelled', 'completed'];
        }
    };
});
app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});
app.directive('review', function (ReviewsFactory, BlendsFactory, AuthService) {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/review/review.html',
        scope: {
            review: '=',
            blend: '='
        },
        link: function link(scope) {

            AuthService.getLoggedInUser().then(function (currUser) {
                scope.userId = currUser._id;
            });

            scope.showReviews = function () {
                console.log("blend is ", scope.blend);
                BlendsFactory.getBlendById(scope.blend._id).then(function (blend) {
                    console.log("blend reviews are ", blend);
                    scope.revArr = blend.reviews;
                    //console.log("got reviews!");
                });
            };

            scope.showReviews();

            scope.newReview = function (star, comment) {
                var newReview = {
                    rating: star,
                    comment: comment,
                    blend: scope.blend._id,
                    user: scope.userId
                };

                ReviewsFactory.createReview(newReview).then(function (review) {
                    console.log('YAYYYY! NEW REVIEW CREATED!', review._id);

                    scope.blend.reviews = scope.blend.reviews.map(function (review) {
                        return review._id;
                    });
                    scope.blend.reviews.push(review._id);
                    console.log("with new id", scope.blend);
                    BlendsFactory.editBlendById(scope.blend._id, { reviews: scope.blend.reviews });
                }).then(function () {
                    scope.showReviews();
                });
            };
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFkbWluLXVzZXIvYWRtaW4tdXNlci5qcyIsImJsZW5kcy9ibGVuZHMuanMiLCJjYXJ0L2NhcnQuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImhvbWUvaG9tZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsIm1pY3Jvcy9taWNyb3MuanMiLCJvcmRlcnMvb3JkZXJzLmpzIiwicmVzZXQvcmVzZXQuanMiLCJzaWdudXAvc2lnbnVwLmpzIiwidHV0b3JpYWwvdHV0b3JpYWwuanMiLCJjb21tb24vZmFjdG9yaWVzL0JsZW5kc0ZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0NhcnRGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9NaWNyb3NGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9PcmRlcnNGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1Jldmlld3NGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2JsZW5kL2JsZW5kLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9taWNyby9taWNyby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9vcmRlcnMvb3JkZXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3Jldmlldy9yZXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGFBQUE7QUFDQSxtQkFBQSxFQUFBLCtCQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7OztBQUdBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7OztBQUdBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTs7QUFFQSxtQkFBQSxDQUFBLFdBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxzQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxXQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxTQUNBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDhDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOzs7QUFHQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7OztBQUdBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBSUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSx5QkFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsaUJBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEVBQUEsY0FBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTs7QUFFQSxjQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxvQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQzNGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGtCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtLQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxXQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQTtBQUNBLHdCQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTs7QUFHQSxVQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLFlBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsa0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBOztTQUVBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsR0FBQSxDQUFBO1NBQ0EsQ0FDQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLG9CQUFBLEVBQUEsSUFBQTtBQUNBLHNCQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTthQUNBLENBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTs7OztTQUlBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxlQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxtQkFBQSxhQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxZQUFBLHNCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEtBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLHNDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtBQUNBLFlBQUEsb0JBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FB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Q0EsbUJBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBRUEsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUE7O0FBR0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQSxPQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxhQUFBLEdBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsWUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7U0FDQSxDQUNBLENBQUE7QUFDQSxhQUFBLEdBQUEsWUFBQSxDQUFBOztBQUVBLFlBQUEsUUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxhQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsWUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxXQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsRUFBQSxZQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNsSUEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLGlCQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsMkNBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQTtLQUVBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsRUFBQSxDQUFBO0FDbElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsV0FBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7Ozs7O0FBS0EsbUJBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZ0JBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO2FBQ0EsTUFBQTtBQUNBLHNCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGFBQUEsR0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN4Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsY0FBQTtBQUNBLGdCQUFBLEVBQUEsbUVBQUE7QUFDQSxrQkFBQSxFQUFBLG9CQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBOzs7QUFHQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxTQUFBLFFBQUEsR0FBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsUUFBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMvQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7O0FBR0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFNBQUE7QUFDQSxrQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGtCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQTs7OztBQUlBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSxNQUFBLEVBQ0EsUUFBQSxFQUNBLGNBQUEsRUFDQSxPQUFBLENBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLHFCQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGlCQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGdCQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFBQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtTQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsUUFBQSxHQUFBO0FBQ0Esb0JBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EsMkJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EseUJBQUEsRUFBQSxJQUFBO2FBQ0EsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxlQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxtQkFBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7S0FDQSxD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QUEsZ0JBQUEsR0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTt5QkFDQSxDQUFBLENBQUE7cUJBQ0EsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTs7U0FFQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtTQUVBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsZUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBOztBQUVBLHlCQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO0FBQ0EsbUJBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsWUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOzs7OztBQUtBLFVBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLHVCQUFBLENBQUEsaUJBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNqQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7QUFDQSxrQkFBQSxFQUFBLFlBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsbUJBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDZCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDOUJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxzQkFBQSxlQUFBLEVBQUE7QUFDQSx1QkFBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLHdCQUFBLENBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0Esb0JBQUEsY0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esd0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLDRCQUFBLEtBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsbUNBQUEsR0FBQSxLQUFBLENBQUE7eUJBQ0E7cUJBQ0EsQ0FBQSxDQUFBO0FBQ0EsMkJBQUEsT0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTs7QUFFQSx1QkFBQSxjQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLG9CQUFBLEVBQUEsc0JBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxTQUFBLEVBQUE7O0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxHQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLG1CQUFBLEVBQUEscUJBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EscUJBQUEsRUFBQSx1QkFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEdBQUEs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LElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esd0JBQUEsRUFBQSwwQkFBQSxVQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9CQUFBLEdBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxxQkFBQSxFQUFBLHVCQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsdUJBQUEsRUFBQSx5QkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUMxQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esb0JBQUEsRUFBQSxzQkFBQSxPQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHFCQUFBLEVBQUEsdUJBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSx1QkFBQSxFQUFBLHlCQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLG1EQUFBLEVBQ0EsbUNBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EseURBQUEsRUFDQSxPQUFBLEVBQ0EsNEJBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUN2QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLHFCQUFBLEVBQUEseUJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHFCQUFBLEVBQUEsdUJBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esb0JBQUEsRUFBQSxzQkFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLEVBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esd0JBQUEsRUFBQSwwQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUM5QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EseUJBQUEsRUFBQSwyQkFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHlCQUFBLEVBQUEsMkJBQUEsRUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxvQkFBQSxFQUFBLHNCQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLEdBQUEsS0FBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdERBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsR0FBQTtBQUNBLHNCQUFBLEVBQUEsR0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFB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O0FBQ0EseUJBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSwyQkFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsaUNBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHlCQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBRUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnZnNhUHJlQnVpbHQnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluLXVzZXInLCB7XG4gICAgICAgIHVybDogJy9hZG1pbi11c2VyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hZG1pbi11c2VyL2FkbWluLXVzZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNYW5hZ2VVc2VyQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdNYW5hZ2VVc2VyQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5zZWFyY2hpbmdVc2VyID0gZmFsc2U7XG4gICAgJHNjb3BlLnVzZXJsaXN0ID0gbnVsbDtcbiAgICAkc2NvcGUucHJvbW90ZUJvb2wgPSBudWxsO1xuXG4vL2NoZWNrcyBpZiBjdXJyZW50IHVzZXIgaXMgYWRtaW5cbiAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uIChjdXJyVXNlcil7XG4gICAgICAgICAgICAkc2NvcGUuaXNBZG1pbiA9IGN1cnJVc2VyLmFkbWluO1xuICAgIH0pO1xuXG4vL2xpc3RzIGFsbCB1c2Vyc1xuICAgICRzY29wZS5nZXRBbGxVc2VycyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBVc2VyRmFjdG9yeS5nZXRBbGxVc2VycygpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh1c2Vycykge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJsaXN0ID0gdXNlcnM7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBhY3Rpb24gb2YgbGlzdGluZyBhbGwgdXNlcnMuJztcbiAgICAgICAgfSk7ICAgIFxuICAgIH07XG5cbi8vbGlzdHMgYSB1c2VyIGJ5IGlkXG4gICAgJHNjb3BlLmdldFVzZXJCeUlkID0gZnVuY3Rpb24gKGlkLCBpbmZvKSB7XG5cbiAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckJ5SWQoaWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcmxpc3QgPSB1c2VyO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgYWN0aW9uIG9mIGxpc3RpbmcgYSBwYXJ0aWN1bGFyIHVzZXIuJztcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy9nZXQgdXNlciBieSBlbWFpbFxuICAgICRzY29wZS5nZXRVc2VyQnlFbWFpbCA9IGZ1bmN0aW9uIChlbWFpbCkge1xuICAgICAgICAkc2NvcGUuc2VhcmNoaW5nVXNlciA9IHRydWU7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJCeUVtYWlsKGVtYWlsKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgICAgICAkc2NvcGUuZm91bmRVc2VyID0gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy9wcm9tb3RlcyB1c2VyIHRvIGFkbWluOyBuZWVkcyB0byBiZSBjaGVja2VkIGlmIHdvcmtpbmdcbiAgICAkc2NvcGUucHJvbW90ZVRvQWRtaW4gPSBmdW5jdGlvbiAoYWRtaW5Cb29sKSB7XG5cblxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdUSElTIElTIEZPVU5EIFVTRVIhISEhIScsICRzY29wZS5mb3VuZFVzZXIudXNlci5faWQpO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LnByb21vdGVVc2VyU3RhdHVzKCRzY29wZS5mb3VuZFVzZXIudXNlci5faWQsIHthZG1pbjogYWRtaW5Cb29sfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBRE1JTiBTVEFUVVMgQ0hBTkdFRCEnKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAocmVzZXRCb29sKSB7XG5cbiAgICAgICAgVXNlckZhY3RvcnkudHJpZ2dlclJlc2V0KCRzY29wZS5mb3VuZFVzZXIudXNlci5lbWFpbCwge2NoYW5nZXBhc3N3b3JkOiByZXNldEJvb2x9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXNzd29yZCByZXNldCB0cmlnZ2VycmVkIScsICRzY29wZS5mb3VuZFVzZXIudXNlcik7XG4gICAgICAgIH0pXG5cbiAgICB9XG5cbi8vZGVsZXRlcyBhIHVzZXJcbiAgICAkc2NvcGUuZGVsZXRlVXNlciA9IGZ1bmN0aW9uICh1c2VySWQpIHtcblxuICAgICAgICB1c2VySWQgPSAkc2NvcGUuZm91bmRVc2VyLnVzZXIuX2lkO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LmRlbGV0ZVVzZXJCeUlkKHVzZXJJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVNFUiBERUxFVEVEISEhJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBhY3Rpb24gb2YgZGVsZXRpbmcgYSB1c2VyLic7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2JsZW5kcycsIHtcbiAgICAgICAgdXJsOiAnL2JsZW5kcycsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdCbGVuZHNDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ibGVuZHMvYmxlbmRzLmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQmxlbmRzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEJsZW5kc0ZhY3RvcnksIE1pY3Jvc0ZhY3RvcnksIENhcnRGYWN0b3J5KSB7XG4gICAgJHNjb3BlLmFsbEJsZW5kcyA9IG51bGw7XG4gICAgJHNjb3BlLmFsbE1pY3JvcyA9IG51bGw7XG4gICAgJHNjb3BlLnNlbGVjdGVkTWljcm9zID0gW107ICBcbiAgICAkc2NvcGUuYmxlbmRzID0gbnVsbDtcbiAgICAkc2NvcGUuZWRpdGVkQmxlbmQgPSBudWxsO1xuICAgICRzY29wZS53aGljaE5hbWVUb0dldCA9IG51bGw7XG4gICAgJHNjb3BlLndoaWNoVG9FZGl0ID0gbnVsbDtcbiAgICAkc2NvcGUuaXNOZXdCbGVuZEZvcm1PcGVuID0gZmFsc2U7XG4gICAgJHNjb3BlLm5ld0JsZW5kID0ge1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBtaWNyb3M6IFtdLFxuICAgICAgICBwcmljZTogbnVsbFxuICAgICB9O1xuXG4gICAgQmxlbmRzRmFjdG9yeS5nZXRBbGxCbGVuZHMoKS50aGVuKGZ1bmN0aW9uIChibGVuZHMpIHtcbiAgICAgICAgICAgICRzY29wZS5hbGxCbGVuZHMgPSAkc2NvcGUuYmxlbmRzID0gYmxlbmRzO1xuICAgICAgICB9KTtcblxuICAgIE1pY3Jvc0ZhY3RvcnkuZ2V0QWxsTWljcm9zKCkudGhlbihmdW5jdGlvbiAobWljcm9zKXtcbiAgICAgICAgJHNjb3BlLmFsbE1pY3JvcyA9IG1pY3JvczsgXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuYWxsTWljcm9zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIHZhciBtaWNyb09iamVjdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogJHNjb3BlLmFsbE1pY3Jvc1tpXS5faWQsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkTWljcm9zLnB1c2gobWljcm9PYmplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgICRzY29wZS5sb2dUaGlzID0gZnVuY3Rpb24oc29tZXRoaW5nKXtcbiAgICAgICAgY29uc29sZS5sb2coc29tZXRoaW5nKTtcbiAgICB9O1xuICAgICRzY29wZS5zaG93QWxsQmxlbmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmdldEFsbEJsZW5kcygpLnRoZW4oZnVuY3Rpb24gKGJsZW5kcykge1xuICAgICAgICAgICAgJHNjb3BlLmlzTmV3QmxlbmRGb3JtT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLmFsbEJsZW5kcyA9ICRzY29wZS5ibGVuZHMgPSBibGVuZHM7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLnNob3dCbGVuZEJ5SWQgPSBmdW5jdGlvbihibGVuZGlkKSB7XG4gICAgICAgIEJsZW5kc0ZhY3RvcnkuZ2V0QmxlbmRCeUlkKGJsZW5kaWQpLnRoZW4oZnVuY3Rpb24gKGJsZW5kKXtcbiAgICAgICAgICAgICRzY29wZS5ibGVuZHMgPSBibGVuZDtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUuc2hvd0JsZW5kQnlOYW1lID0gZnVuY3Rpb24oYmxlbmRuYW1lKSB7XG4gICAgICAgIEJsZW5kc0ZhY3RvcnkuZ2V0QmxlbmRCeU5hbWUoYmxlbmRuYW1lKS50aGVuKGZ1bmN0aW9uIChibGVuZCl7XG4gICAgICAgICAgICAkc2NvcGUuYmxlbmRzID0gW2JsZW5kXTtcbiAgICAgICAgICAgIC8vICRzY29wZS5pbWFnZSA9IGJsZW5kLmltYWdlO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5hZGRCbGVuZCA9IGZ1bmN0aW9uIChibGVuZCkge1xuICAgICAgICB2YXIganVzdElkcyA9IGJsZW5kLm1pY3Jvcy5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihvYmope1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBibGVuZC5taWNyb3MgPSBqdXN0SWRzO1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmNyZWF0ZUJsZW5kKGJsZW5kKS50aGVuKGZ1bmN0aW9uIChuZXdCbGVuZCl7XG4gICAgICAgICAgICAkc2NvcGUubmV3QmxlbmQgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICBtaWNyb3M6IFtdLFxuICAgICAgICAgICAgICAgIHByaWNlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIENhcnRGYWN0b3J5LnNhdmVDYXJ0KG5ld0JsZW5kLm5hbWUsIG5ld0JsZW5kKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxsQmxlbmRzKCk7XG4gICAgICAgICAgICAvLyBCbGVuZHNGYWN0b3J5LmdldEFsbEJsZW5kcygpLnRoZW4oZnVuY3Rpb24gKGJsZW5kcykge1xuICAgICAgICAgICAgLy8gICAgICRzY29wZS5hbGxCbGVuZHMgPSBibGVuZHM7XG4gICAgICAgICAgICAvLyB9KTsgICBcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUuZGVsZXRlQmxlbmQgPSBmdW5jdGlvbiAoaWQpe1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmRlbGV0ZUJsZW5kQnlJZChpZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIEJsZW5kc0ZhY3RvcnkuZ2V0QWxsQmxlbmRzKCk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oYmxlbmRzKXtcbiAgICAgICAgICAgICRzY29wZS5ibGVuZHMgPSAkc2NvcGUuYWxsQmxlbmRzID0gYmxlbmRzOyBcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUubG9hZEJsZW5kVG9FZGl0ID0gZnVuY3Rpb24gKGlkKXtcbiAgICAgICAgQmxlbmRzRmFjdG9yeS5nZXRCbGVuZEJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24gKGJsZW5kKXtcbiAgICAgICAgICAgICRzY29wZS5lZGl0ZWRCbGVuZCA9IGJsZW5kO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5lZGl0QmxlbmQgPSBmdW5jdGlvbiAoaWQsIGJsZW5kKXtcbiAgICAgICAgQmxlbmRzRmFjdG9yeS5lZGl0QmxlbmRCeUlkKGlkLCBibGVuZCkudGhlbihmdW5jdGlvbiAoYmxlbmQpe1xuICAgICAgICAgICAgJHNjb3BlLmVkaXRlZEJsZW5kID0gYmxlbmQ7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUucmVmcmVzaE5ld0JsZW5kID0gZnVuY3Rpb24gKHNlbGVjdGVkTWljcm8pe1xuICAgICAgICB2YXIgYWxsTWljcm9zSW5kZXhPZk9iamVjdCA9IG51bGw7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuYWxsTWljcm9zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKCRzY29wZS5hbGxNaWNyb3NbaV0uX2lkID09PSBzZWxlY3RlZE1pY3JvLmlkKXtcbiAgICAgICAgICAgICAgICBhbGxNaWNyb3NJbmRleE9mT2JqZWN0ID0gaTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4T2ZTZWxlY3RlZE1pY3JvID0gJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5pbmRleE9mKCRzY29wZS5hbGxNaWNyb3NbYWxsTWljcm9zSW5kZXhPZk9iamVjdF0pO1xuICAgICAgICBpZihzZWxlY3RlZE1pY3JvLnNlbGVjdGVkKXtcbiAgICAgICAgICAgIGlmKGluZGV4T2ZTZWxlY3RlZE1pY3JvID09PSAtMSl7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8ICRzY29wZS5hbGxNaWNyb3MubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsbE1pY3Jvc1tqXS5faWQgPT09IHNlbGVjdGVkTWljcm8uaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5wdXNoKCRzY29wZS5hbGxNaWNyb3Nbal0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4T2ZTZWxlY3RlZE1pY3JvICE9PSAtMSl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5zcGxpY2UoaW5kZXhPZlNlbGVjdGVkTWljcm8sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuc2V0UHJpY2UgPSBmdW5jdGlvbihwcmljZSl7XG4gICAgICAgICRzY29wZS5uZXdCbGVuZC5wcmljZSA9IHByaWNlOyBcbiAgICB9O1xuXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2FydCcsIHtcbiAgICAgICAgdXJsOiAnL2NhcnQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FydENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NhcnQvY2FydC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0NhcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRxLCAkc2NvcGUsIEF1dGhTZXJ2aWNlLCBVc2VyRmFjdG9yeSwgQ2FydEZhY3RvcnksIE9yZGVyc0ZhY3RvcnksICRzdGF0ZSwgJGh0dHApIHtcbi8vVENIT1BBWSBNT0NLVVBcblxuICAgIC8vICQoXCIjY2hlY2tvdXQtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICQoJ2h0bWwnKS5hcHBlbmQoJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiaHR0cDovLzE5Mi4xNjguMS4xNDg6MTMzNy9pZnJhbWUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIvPicpXG4gICAgLy8gICAgJCgnaHRtbCcpLmFwcGVuZChcIjxkaXYgaWQ9J2NoZWNrb3V0LWJnJyBjbGFzcz0nY2hlY2tvdXQtZmFkZWluJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogZ3JheTsgcG9zaXRpb246IGFic29sdXRlOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB6LWluZGV4OiA5OTk4Oyc+PC9kaXY+XCIpLnNob3coKSAgICAgXG4gICAgLy8gICAgdmFyIGZyYW1laW4gPSBmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAkKFwiPGlmcmFtZSBpZD0ndGNob3BheS1pZnJhbWUnIGNsYXNzPSdpZnJhbWUtZmFkZWluJyBzdHlsZT0nZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgd2lkdGg6IDIwJTsgcGFkZGluZzogMjBweDsgdG9wOiAxMDAlOyBsZWZ0OiAyNy41JTsgcmlnaHQ6IDI3LjUlOyBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogMzBweDsgaGVpZ2h0OiA2MDBweDsgbWFyZ2luOiAwIGF1dG87IHotaW5kZXg6IDk5OTk7JyBzcmM9J2h0dHA6Ly8xOTIuMTY4LjEuMTQ4OjEzMzcvY2hlY2tvdXQnPjwvaWZyYW1lPlwiKS5hcHBlbmRUbygkKCdodG1sJykpLmFuaW1hdGUoe3RvcDogXCIrMTAlXCJ9LCA1MDAsICdlYXNlSW5PdXRCYWNrJylcbiAgICAvLyAgICAgICAgLy8gJCgnaHRtbCcpLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpZnJhbWUtZmFkZWluXCIgaWQ9XCJjbG9zZS1idXR0b25cIiBzdHlsZT1cIlwiPng8YnV0dG9uPicpLmFuaW1hdGUoe3RvcDogXCIxMCVcIn0sIDUwMCwgJ2Vhc2VJbk91dEJhY2snKVxuICAgIC8vICAgICAgICAgICAgdmFyIHRlc3QgPSBcInRlc3RcIjtcbiAgICAvLyAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZnJhbWUgZG9tYWluXCIsIGZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZG9tYWluKVxuICAgIC8vICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgLy8gICAgICAgICAgICB2YXIgZnVuYyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAvLyAgICAgICAgICAgICAgICB2YXIgZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGNob3BheS1pZnJhbWUnKTtcbiAgICAvLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmcmFtZS5jb250ZW50V2luZG93KVxuICAgIC8vICAgICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UodGVzdCwgJ2h0dHA6Ly8xOTIuMTY4LjEuMTQ4OjEzMzcvJyk7XG4gICAgLy8gICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmMsIDIwMDApXG5cblxuICAgIC8vICAgIH0gICAgXG4gICAgLy8gICAgc2V0VGltZW91dChmcmFtZWluLCA1MDApXG5cbiAgICAvLyB9KVxuXG5cbiAgICB2YXIgdGNob1BheUluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9pbml0JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBcbiAgICAgICAgLy9zZWxlY3Qgc3R1ZmYgb24gZG9tLi4uLiB3ZSB3aWxsIGZpcnN0IHB1dCBidXR0b24gb24gZG9tXG4gICAgICAgIFxuICAgICAgICB2YXIgaW5pdE9iaiA9IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgXG4gICAgICAgICQoXCIjdGNob3BheS1zY3JpcHRcIikuYXR0cihcImRhdGEtdHJhbnNhY3Rpb25IYXNoVmFsdWVcIiwgaW5pdE9iai50cmFuc2FjdGlvbkhhc2gpXG4gICAgICAgICQoXCIjdGNob3BheS1zY3JpcHRcIikuYXR0cihcImRhdGEtdGltZXN0YW1wXCIsIGluaXRPYmoudGltZXN0YW1wKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW5pdCBodHRwIHJlc3BvbnNlXCIsIHJlc3BvbnNlKVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuXG4gICAgICB9KTsgIFxuICAgIH1cbiAgICB0Y2hvUGF5SW5pdCgpXG5cblxuXG4vL2V4dHJhY3QgdGltZXN0YW1wIGFuZCBoYXNoIGFuZCBzZXQgb24gYnV0dG9uIHNjcmlwdCBkYXRhLWF0dHJpYnV0ZXNcblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgJHNjb3BlLmxvZ1RoaXMgPSBmdW5jdGlvbihzb21ldGhpbmcpe1xuICAgICAgICBjb25zb2xlLmxvZyhzb21ldGhpbmcpO1xuICAgIH07XG4gICAgLy8kc2NvcGUuaXRlbXMgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICRzY29wZS5pdGVtcyA9IENhcnRGYWN0b3J5LmdldENhcnQoKTtcblxuICAgICRzY29wZS5yZW1vdmVJdGVtID0gZnVuY3Rpb24gKGluZGV4KXtcbiAgICAgICAgQ2FydEZhY3RvcnkuZGVsZXRlSXRlbSgkc2NvcGUuaXRlbXNbaW5kZXhdLm5hbWUpO1xuICAgICAgICAkc2NvcGUuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsZWFyQ2FydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvIGNhcnQnKTtcbiAgICAgICAgQ2FydEZhY3RvcnkuY2xlYXJBbGxpbkNhcnQoKTtcbiAgICAgICAgJHNjb3BlLml0ZW1zID0gQ2FydEZhY3RvcnkuZ2V0Q2FydCgpO1xuICAgICAgICBcbiAgICB9O1xuXG4vLyB1c2UgcmVkdWNlXG4gICAgJHNjb3BlLnRvdGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IDA7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuaXRlbXMsIGZ1bmN0aW9uKGJsZW5kKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBibGVuZC5xdWFudGl0eSAqIGJsZW5kLnByaWNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH07XG5cblxuICAgICRzY29wZS5jaGVja291dCA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib3JkZXIgaXMgXCIsIG9yZGVyKVxuICAgICAgICBpZighQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHJldHVybiAkc3RhdGUuZ28oJ2xvZ2luJyk7XG5cbiAgICAgICAgdmFyIHVzZXJJZFByb21pc2UgPSBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyIGxvZ2dlZCBpbiBmcm9tIGNoZWNrb3V0JywgdXNlcilcbiAgICAgICAgICAgIHJldHVybiB1c2VyLl9pZDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGZvcm1hdHRlZE9iaiA9IG9yZGVyLm1hcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt0eXBlb2ZibGVuZDogb2JqLl9pZCwgcXVhbnRpdHk6IG9iai5xdWFudGl0eSwgbmFtZTogb2JqLm5hbWV9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBvcmRlciA9IGZvcm1hdHRlZE9iajtcbiAgICBcbiAgICAgICAgdmFyIHRvU3VibWl0ID0ge2JsZW5kOiBvcmRlciwgc3RhdHVzOiBcImNyZWF0ZWRcIn1cbiAgICAgICAgY29uc29sZS5sb2codG9TdWJtaXQpO1xuICAgICAgICBcbiAgICAgICAgJHEuYWxsKFtPcmRlcnNGYWN0b3J5LmNyZWF0ZU9yZGVyKHRvU3VibWl0KSwgdXNlcklkUHJvbWlzZV0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgY3JlYXRlZE9yZGVyID0gcmVzdWx0c1swXVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY3JlYXRlZE9yZGVyJywgY3JlYXRlZE9yZGVyKVxuICAgICAgICAgICAgdmFyIHVzZXJJZCA9IHJlc3VsdHNbMV1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXJJZCcsIHVzZXJJZCkgICAgICAgICAgICBcbiAgICAgICAgICAgIENhcnRGYWN0b3J5LmNsZWFyQWxsaW5DYXJ0KClcbiAgICAgICAgICAgICRzY29wZS5pdGVtcyA9IENhcnRGYWN0b3J5LmdldENhcnQoKVxuICAgICAgICAgICAgcmV0dXJuIFVzZXJGYWN0b3J5LnB1dE9yZGVyT25Vc2VyKHVzZXJJZCwgY3JlYXRlZE9yZGVyLl9pZClcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ29yZGVycycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcik7XG5cbiAgICB9O1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZXNwb25zZSBmcm9tIGxvZ2luJywgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBjYWxscyB0aGUgb25TdWNjZXNzZnVsTG9naW4gZnVuY3Rpb24nKVxuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5pc0NvbGxhcHNlZCA9IHRydWU7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbi8qaWYgdGhlIHVzZXIgbmVlZHMgdG8gY2hhbmdlIHRoZWlyIHBhc3N3b3JkIHRoZXkgd2lsbCBiZSByZWRpcmVjdGVkIHRvIHRoZSBcInJlc2V0IHBhc3N3b3JkXCIgdmlldyBvbmNlIHRoZXkgbG9nIGluLlxuT3RoZXJ3aXNlLCB0aGV5IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgXCJob21lXCIgdmlldyBvbmNlIHRoZXkgbG9nIGluLiovXG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgaWYodXNlci5jaGFuZ2VwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygncmVzZXQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJlc2V0cGFzc3dvcmQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygncmVzZXQnKTtcbiAgICB9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbnNPbmx5Jywge1xuICAgICAgICB1cmw6ICcvYWRtaW5zLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21pY3JvcycsIHtcbiAgICAgICAgdXJsOiAnL21pY3JvcycsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNaWNyb3NDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9taWNyb3MvbWljcm9zLmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTWljcm9zQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIE1pY3Jvc0ZhY3RvcnksIEF1dGhTZXJ2aWNlKSB7XG5cbiAgICAvLyAkc2NvcGUubWljcm9zO1xuICAgIC8vICRzY29wZS5pbWFnZTtcbiAgICAkc2NvcGUud2hpY2hOYW1lID0gbnVsbDtcblxuICAgICRzY29wZS5sZXZlbHMgPSBbXG4gICAgICAgICdtaWxkJyxcbiAgICAgICAgJ21lZGl1bScsXG4gICAgICAgICdtZWRpdW0tc3BpY3knLFxuICAgICAgICAnc3BpY3knXG4gICAgXTtcblxuICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKGN1cnJVc2VyKXtcbiAgICAgICAgICAgICRzY29wZS5pc0FkbWluID0gY3VyclVzZXIuYWRtaW47XG4gICAgfSk7XG5cbiAgICAkc2NvcGUuc2hvd0FsbE1pY3JvcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgTWljcm9zRmFjdG9yeS5nZXRBbGxNaWNyb3MoKS50aGVuKGZ1bmN0aW9uIChtaWNyb3MpIHtcbiAgICAgICAgICAgICRzY29wZS5taWNyb3MgPSBtaWNyb3M7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLnNob3dNaWNyb0J5SWQgPSBmdW5jdGlvbihtaWNyb2lkKSB7XG4gICAgICAgIE1pY3Jvc0ZhY3RvcnkuZ2V0TWljcm9CeUlkKG1pY3JvaWQpLnRoZW4oZnVuY3Rpb24gKG1pY3JvKXtcbiAgICAgICAgICAgICRzY29wZS5taWNyb3MgPSBbbWljcm9dO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5zaG93TWljcm9CeU5hbWUgPSBmdW5jdGlvbihtaWNyb25hbWUpIHtcbiAgICAgICAgTWljcm9zRmFjdG9yeS5nZXRNaWNyb0J5TmFtZShtaWNyb25hbWUpLnRoZW4oZnVuY3Rpb24gKG1pY3JvKXtcbiAgICAgICAgICAgICRzY29wZS5taWNyb3MgPSBbbWljcm9dO1xuICAgICAgICAgICAgJHNjb3BlLmltYWdlID0gbWljcm8uaW1hZ2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2hvd01pY3Jvc0J5U3BpY2UgPSBmdW5jdGlvbiAoc3BpY2VsZXZlbCkge1xuICAgICAgICBNaWNyb3NGYWN0b3J5LmdldE1pY3Jvc0J5U3BpY2Uoc3BpY2VsZXZlbCkudGhlbihmdW5jdGlvbiAobWljcm9zKXtcbiAgICAgICAgICAgICRzY29wZS5taWNyb3MgPSBtaWNyb3M7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHtjb25zb2xlLmxvZyhlcnIpO30pO1xuICAgIH07XG4gICAgJHNjb3BlLmFkZE1pY3JvID0gZnVuY3Rpb24gKG1pY3JvKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW4gYWRkIG1pY3JvXCIpO1xuICAgICAgICBNaWNyb3NGYWN0b3J5LmNyZWF0ZU1pY3JvKG1pY3JvKS50aGVuKGZ1bmN0aW9uIChuZXdNaWNybyl7XG4gICAgICAgICAgICAkc2NvcGUubmV3TWljcm8gPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICBzcGljZTogbnVsbCxcbiAgICAgICAgICAgICAgICBwcmljZTogbnVsbCxcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogbnVsbCxcbiAgICAgICAgICAgICAgICBpbWFnZTogbnVsbCxcbiAgICAgICAgICAgICAgICBpbnZlbnRvcnk6IG51bGxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLmRlbGV0ZU1pY3JvID0gZnVuY3Rpb24gKGlkKXtcbiAgICAgICAgTWljcm9zRmFjdG9yeS5kZWxldGVNaWNyb0J5SWQoaWQpLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBcbiAgICAkc2NvcGUuc2hvd0FsbE1pY3JvcygpO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICpvcmRlcnMqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdvcmRlcnMnLCB7XG4gICAgICAgIHVybDogJy9vcmRlcnMnLFxuICAgICAgICBjb250cm9sbGVyOiAnT3JkZXJzQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvb3JkZXJzL29yZGVycy5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ09yZGVyc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBPcmRlcnNGYWN0b3J5LCBCbGVuZHNGYWN0b3J5KXtcblxuXHQkc2NvcGUuYWxsT3JkZXJzID0gbnVsbDtcblx0JHNjb3BlLm1pY3JvTmFtZSA9IG51bGw7XG5cdCRzY29wZS5yYW5kb21NaWNybyA9IG51bGw7XG5cdCRzY29wZS5yZWNvbW1lbmRlZEJsZW5kID0gbnVsbDtcblx0JHNjb3BlLm9yZGVySWRzID0gW107XG5cdC8vICRzY29wZS5zaG93UmVjb21tZW5kYXRpb24gPSBmYWxzZTtcblxuXHRPcmRlcnNGYWN0b3J5LmdldEFsbE9yZGVycygpLnRoZW4oZnVuY3Rpb24gKG9yZGVycykge1xuXHRcdCRzY29wZS5hbGxPcmRlcnMgPSBvcmRlcnM7XG5cdFx0aWYob3JkZXJzLmxlbmd0aCkgeyBcblx0XHRcdC8vICRzY29wZS5zaG93UmVjb21tZW5kYXRpb24gPSB0cnVlO1xuXHRcdH1cblx0fSk7XG5cblx0JHNjb3BlLnNob3dPcmRlcnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0T3JkZXJzRmFjdG9yeS5nZXRBbGxPcmRlcnMoKS50aGVuKGZ1bmN0aW9uIChvcmRlcnMpIHtcblx0XHRcdGNvbnNvbGUubG9nKCdvcmRlcnMgYXJndW1lbnQnLCBvcmRlcnMpO1xuXHRcdFx0JHNjb3BlLm9yZGVySWRzID0gb3JkZXJzLm1hcChmdW5jdGlvbihvYmopIHsgcmV0dXJuIG9iai5faWQgfSk7XG5cdFx0XHRjb25zb2xlLmxvZygndGhlc2UgYXJlIG9yZGVySWRzJywgJHNjb3BlLm9yZGVySWRzKVxuXHRcdFx0JHNjb3BlLm9yZGVySWRzLmZvckVhY2goZnVuY3Rpb24ob3JkZXJpZCl7XG5cblx0XHRcdFx0T3JkZXJzRmFjdG9yeS5nZXRPcmRlckJ5SWQob3JkZXJpZCkudGhlbihmdW5jdGlvbiAob3JkZXIpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygndGhlIG9yZGVyOicsIG9yZGVyKTtcblx0XHRcdFx0XHQkc2NvcGUub3JkZXIgPSBvcmRlcjtcblx0XHRcdFx0XHRCbGVuZHNGYWN0b3J5LmdldEJsZW5kQnlJZChvcmRlci5ibGVuZFswXS50eXBlb2ZibGVuZClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYmxlbmQpIHtcblx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3RoZSBtaWNybyBhcnJheScsIGJsZW5kLm1pY3Jvcyk7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdCRzY29wZS5taWNyb05hbWUgPSBibGVuZC5taWNyb3MubWFwKGZ1bmN0aW9uKG9iail7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBvYmoubmFtZTtcblx0XHRcdFx0XHRcdH0pXG5cblx0XHRcdFx0XHRcdCRzY29wZS5yYW5kb21NaWNybyA9ICRzY29wZS5taWNyb05hbWVbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKiRzY29wZS5taWNyb05hbWUubGVuZ3RoKV07XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZygndGhpcyBpcyBibGVuZCBvcmRlcmVkJywgYmxlbmQpXG5cblx0XHRcdFx0XHRcdEJsZW5kc0ZhY3RvcnkuZ2V0QWxsQmxlbmRzKCkudGhlbihmdW5jdGlvbiAoYmxlbmRzKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdhbGwgdGhlIGJsZW5kcycsIGJsZW5kcyk7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQkc2NvcGUubWF0Y2hlZEJsZW5kcyA9IGJsZW5kcy5maWx0ZXIoZnVuY3Rpb24oYmxlbmQpe1xuXHRcdFx0XHRcdFx0XHRcdHZhciBoYXNSYW5kb21NaWNybyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdGJsZW5kLm1pY3Jvcy5mb3JFYWNoKGZ1bmN0aW9uKG1pY3JvKXtcblx0XHRcdFx0XHRcdFx0XHRcdGlmKG1pY3JvLm5hbWUgPT09ICRzY29wZS5yYW5kb21NaWNybyl7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGhhc1JhbmRvbU1pY3JvID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBoYXNSYW5kb21NaWNyb1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHRcdFx0XHQkc2NvcGUucmVjb21tZW5kZWRCbGVuZCA9ICRzY29wZS5tYXRjaGVkQmxlbmRzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUubWF0Y2hlZEJsZW5kcy5sZW5ndGgpXVxuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQkc2NvcGUub3JkZXJzID0gb3JkZXJzO1xuXHRcdFx0Ly8gJHNjb3BlLnNob3dSZWNvbW1lbmRhdGlvbiA9IHRydWU7XG5cdFx0fSk7XG5cdH07XG5cblx0JHNjb3BlLnNob3dPcmRlcnNCeUlkID0gZnVuY3Rpb24gKG9yZGVyaWQpIHtcblx0XHRPcmRlcnNGYWN0b3J5LmdldE9yZGVyQnlJZChvcmRlcmlkKS50aGVuKGZ1bmN0aW9uIChvcmRlcikge1xuXHRcdFx0JHNjb3BlLm9yZGVycyA9IG9yZGVyO1xuXHRcdH0pXG5cblx0fTtcblxuXHQkc2NvcGUubG9hZE9yZGVyVG9FZGl0ID0gZnVuY3Rpb24gKGlkKSB7XG5cdFx0T3JkZXJzRmFjdG9yeS5nZXRPcmRlckJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24gKG9yZGVyKSB7XG5cdFx0XHQkc2NvcGUuZWRpdGVkT3JkZXIgPSBvcmRlcjtcblx0XHR9KTtcblx0fTtcblxuXHQkc2NvcGUuZWRpdE9yZGVyID0gZnVuY3Rpb24gKGlkLCBvcmRlcikge1xuXHRcdC8vY29uc29sZS5sb2coJ2VkaXRPcmRlcicsIG9yZGVyLnN0YXR1cyk7XG5cdFx0T3JkZXJzRmFjdG9yeS5lZGl0T3JkZXJCeUlkKGlkLCBvcmRlci5zdGF0dXMpLnRoZW4oZnVuY3Rpb24gKG9yZGVyKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdhZnRlciBlZGl0aW5nICcsIG9yZGVyKTtcblx0XHRcdCRzY29wZS5lZGl0ZWRPcmRlciA9IG9yZGVyO1xuXHRcdFx0XG5cdFx0fSk7XG5cdH07XG5cblx0JHNjb3BlLmRlbGV0ZU9yZGVyID0gZnVuY3Rpb24gKGlkKSB7XG5cdFx0T3JkZXJzRmFjdG9yeS5kZWxldGVPcmRlckJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24oKXtcblxuXHQgICAgICAgIE9yZGVyc0ZhY3RvcnkuZ2V0QWxsT3JkZXJzKCkudGhlbihmdW5jdGlvbiAob3JkZXJzKSB7XG5cdFx0XHRcdCRzY29wZS5hbGxPcmRlcnMgPSBvcmRlcnM7XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybjtcblx0XHR9KTtcblx0fTtcblxuXHQkc2NvcGUuc2hvd09yZGVycygpO1xufSk7XG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncmVzZXQnLCB7XG4gICAgICAgIHVybDogJy9yZXNldC86aWQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3Jlc2V0L3Jlc2V0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUmVzZXRQYXNzd29yZEN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignUmVzZXRQYXNzd29yZEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgVXNlckZhY3RvcnksICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLnJlc2V0ID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuLypCeSBzdWJtaXR0aW5nIHRoZSBmb3JtLCB1c2VyJ3MgcGFzc3dvcmQgd2lsbCBiZSBjaGFuZ2VkIGluIHRoZSBkYXRhYmFzZS5cblRoZSB1c2VyJ3MgY2hhbmdlUGFzc3dvcmRTdGF0dXMgaW4gdGhlIGRhdGFiYXNlIHdpbGwgYWxzbyBiZSBjaGFuZ2VkIHRvIGZhbHNlIG9uY2UgdGhlIHBhc3N3b3JkIGNoYW5nZSBpcyBtYWRlLiovXG5cbiAgICAkc2NvcGUucmVzZXRVc2VyUGFzc3dvcmQgPSBmdW5jdGlvbiAoaW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG4gICAgICAgIFxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICBVc2VyRmFjdG9yeS5yZXNldFVzZXJQYXNzd29yZCh1c2VyLl9pZCwgaW5mbylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIHJlc2V0IGNyZWRlbnRpYWxzLic7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zaWdudXAvc2lnbnVwLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2lnbnVwQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTaWdudXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgVXNlckZhY3RvcnksIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5zaWdudXAgPSB7fTtcbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgJHNjb3BlLmNyZWF0ZVVzZXIgPSBmdW5jdGlvbiAodXNlcikge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgVXNlckZhY3RvcnkuY3JlYXRlVXNlcih1c2VyKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBBdXRoU2VydmljZS5sb2dpbih1c2VyKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIHNpZ251cCBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3R1dG9yaWFsJywge1xuICAgICAgICB1cmw6ICcvdHV0b3JpYWwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVHV0b3JpYWxDdHJsJyxcbiAgICAgICAgcmVzb2x2ZToge1xuICAgICAgICAgICAgdHV0b3JpYWxJbmZvOiBmdW5jdGlvbiAoVHV0b3JpYWxGYWN0b3J5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFR1dG9yaWFsRmFjdG9yeS5nZXRUdXRvcmlhbFZpZGVvcygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuZmFjdG9yeSgnVHV0b3JpYWxGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRUdXRvcmlhbFZpZGVvczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90dXRvcmlhbC92aWRlb3MnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1R1dG9yaWFsQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIHR1dG9yaWFsSW5mbykge1xuXG4gICAgJHNjb3BlLnNlY3Rpb25zID0gdHV0b3JpYWxJbmZvLnNlY3Rpb25zO1xuICAgICRzY29wZS52aWRlb3MgPSBfLmdyb3VwQnkodHV0b3JpYWxJbmZvLnZpZGVvcywgJ3NlY3Rpb24nKTtcblxuICAgICRzY29wZS5jdXJyZW50U2VjdGlvbiA9IHsgc2VjdGlvbjogbnVsbCB9O1xuXG4gICAgJHNjb3BlLmNvbG9ycyA9IFtcbiAgICAgICAgJ3JnYmEoMzQsIDEwNywgMjU1LCAwLjEwKScsXG4gICAgICAgICdyZ2JhKDIzOCwgMjU1LCA2OCwgMC4xMSknLFxuICAgICAgICAncmdiYSgyMzQsIDUxLCAyNTUsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjU1LCAxOTMsIDczLCAwLjExKScsXG4gICAgICAgICdyZ2JhKDIyLCAyNTUsIDEsIDAuMTEpJ1xuICAgIF07XG5cbiAgICAkc2NvcGUuZ2V0VmlkZW9zQnlTZWN0aW9uID0gZnVuY3Rpb24gKHNlY3Rpb24sIHZpZGVvcykge1xuICAgICAgICByZXR1cm4gdmlkZW9zLmZpbHRlcihmdW5jdGlvbiAodmlkZW8pIHtcbiAgICAgICAgICAgIHJldHVybiB2aWRlby5zZWN0aW9uID09PSBzZWN0aW9uO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG59KTsiLCJhcHAuZmFjdG9yeSgnQmxlbmRzRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsQmxlbmRzOiBmdW5jdGlvbiAoKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2JsZW5kc1wiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0dmFyIGZpbHRlcmVkQmxlbmRzID0gcmVzcG9uc2UuZGF0YS5maWx0ZXIoZnVuY3Rpb24oYmxlbmQpe1xuICAgICAgICAgICAgIFx0dmFyIGluc3RvY2sgPSB0cnVlOyBcbiAgICAgICAgICAgICAgICBibGVuZC5taWNyb3MuZm9yRWFjaChmdW5jdGlvbihtaWNybyl7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtaWNyby5pbnZlbnRvcnkgPT09IDApe1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdG9jayA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGluc3RvY2s7IFxuICAgICAgICAgICAgfSk7XG5cblx0XHRcdFx0cmV0dXJuIGZpbHRlcmVkQmxlbmRzO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRCbGVuZEJ5SWQ6IGZ1bmN0aW9uIChibGVuZGlkKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2JsZW5kcy9cIiArIGJsZW5kaWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0QmxlbmRCeU5hbWU6IGZ1bmN0aW9uIChibGVuZG5hbWUpeyAvLyBkb24ndCBoYXZlIHRoaXMgcm91dGUgeWV0XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9ibGVuZHMvbmFtZS9cIiArIGJsZW5kbmFtZSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjcmVhdGVCbGVuZDogZnVuY3Rpb24gKGJsZW5kKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvYmxlbmRzXCIsIGJsZW5kKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRlZGl0QmxlbmRCeUlkOiBmdW5jdGlvbiAoaWQsIGJsZW5kKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL2JsZW5kcy8nICsgaWQsIGJsZW5kKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRkZWxldGVCbGVuZEJ5SWQ6IGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9ibGVuZHMvJyArIGlkKTtcblx0XHR9XG5cdH07XG59KTsiLCJhcHAuZmFjdG9yeSgnQ2FydEZhY3RvcnknLCBmdW5jdGlvbiAoJHJvb3RTY29wZSl7XG4gIHJldHVybiB7XG4gICAgLy8gZ2V0SXRlbTogZnVuY3Rpb24gKGtleSkge1xuICAgIC8vICAgcmV0dXJuIEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG4gICAgLy8gfSxcblxuICAgIGRlbGV0ZUl0ZW06IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGtleSk7XG4gICAgfSxcblxuICAgIGdldENhcnQ6IGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgYXJjaGl2ZSA9IFtdLFxuICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhsb2NhbFN0b3JhZ2UpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKFwia2V5cyBpID0gXCIsIHR5cGVvZiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXlzW2ldKSlcbiAgICAgICAgaWYgKGtleXNbaV0gPT09IFwiZGVidWdcIil7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIHRvT2JqID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXlzW2ldKSk7XG4gICAgICAgICAgYXJjaGl2ZS5wdXNoKHRvT2JqKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGFyY2hpdmU7XG4gICAgfSxcblxuICAgIHNhdmVDYXJ0OiBmdW5jdGlvbiAobmFtZSwgaW5mbykge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0obmFtZSwgSlNPTi5zdHJpbmdpZnkoaW5mbykpO1xuICAgIH0sXG5cbiAgICBjbGVhckFsbGluQ2FydDogZnVuY3Rpb24gKCkge1xuICAgICAgbG9jYWxTdG9yYWdlLmNsZWFyKCk7XG4gICAgfVxuXG4gIH07XG59KTtcbiIsImFwcC5mYWN0b3J5KCdGdWxsc3RhY2tQaWNzJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBbXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjdnQlh1bENBQUFYUWNFLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL2ZiY2RuLXNwaG90b3MtYy1hLmFrYW1haWhkLm5ldC9ocGhvdG9zLWFrLXhhcDEvdDMxLjAtOC8xMDg2MjQ1MV8xMDIwNTYyMjk5MDM1OTI0MV84MDI3MTY4ODQzMzEyODQxMTM3X28uanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLUxLVXNoSWdBRXk5U0suanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNzktWDdvQ01BQWt3N3kuanBnJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLVVqOUNPSUlBSUZBaDAuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNnlJeUZpQ0VBQXFsMTIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRS1UNzVsV0FBQW1xcUouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRXZaQWctVkFBQWs5MzIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRWdOTWVPWElBSWZEaEsuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DRVF5SUROV2dBQXU2MEIuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQ0YzVDVRVzhBRTJsR0ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWVWdzVTV29BQUFMc2ouanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQWFKSVA3VWtBQWxJR3MuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9DQVFPdzlsV0VBQVk5RmwuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CLU9RYlZyQ01BQU53SU0uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9COWJfZXJ3Q1lBQXdSY0oucG5nOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNVBUZHZuQ2NBRUFsNHguanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CNHF3QzBpQ1lBQWxQR2guanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CMmIzM3ZSSVVBQTlvMUQuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cd3BJd3IxSVVBQXZPMl8uanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9Cc1NzZUFOQ1lBRU9oTHcuanBnOmxhcmdlJ1xuICAgIF07XG59KTsiLCJhcHAuZmFjdG9yeSgnTWljcm9zRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsTWljcm9zOiBmdW5jdGlvbiAoKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL21pY3Jvc1wiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldE1pY3JvQnlJZDogZnVuY3Rpb24gKG1pY3JvaWQpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvbWljcm9zL1wiICsgbWljcm9pZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRNaWNyb0J5TmFtZTogZnVuY3Rpb24gKG1pY3JvbmFtZSl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9taWNyb3MvbmFtZS9cIiArIG1pY3JvbmFtZSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRNaWNyb3NCeVNwaWNlOiBmdW5jdGlvbiAoc3BpY2VsZXZlbCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9taWNyb3Mvc3BpY2UvXCIgKyBzcGljZWxldmVsKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNyZWF0ZU1pY3JvOiBmdW5jdGlvbiAobWljcm8pIHtcblx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9taWNyb3NcIiwgbWljcm8pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGVkaXRNaWNyb0J5SWQ6IGZ1bmN0aW9uIChpZCwgbWljcm8pIHtcblx0XHRcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvbWljcm9zLycgKyBpZCwgbWljcm8pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGRlbGV0ZU1pY3JvQnlJZDogZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL21pY3Jvcy8nICsgaWQpO1xuXHRcdH0sXG5cdH07XG59KTsiLCJhcHAuZmFjdG9yeSgnT3JkZXJzRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsT3JkZXJzOiBmdW5jdGlvbiAoKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL29yZGVyc1wiKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldE9yZGVyQnlJZDogZnVuY3Rpb24gKG9yZGVyaWQpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvb3JkZXJzL1wiICsgb3JkZXJpZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjcmVhdGVPcmRlcjogZnVuY3Rpb24gKG9yZGVyKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvb3JkZXJzXCIsIG9yZGVyKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRlZGl0T3JkZXJCeUlkOiBmdW5jdGlvbiAoaWQsIG9yZGVyKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwiaW4gdGhlIGZhY3Rvcnkgb3JkZXIgaXMgXCIsIG9yZGVyKTtcblx0XHRcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvb3JkZXJzLycgKyBpZCwge1wiX2lkXCI6IG9yZGVyfSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZGVsZXRlT3JkZXJCeUlkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvb3JkZXJzLycgKyBpZCk7XG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1JhbmRvbUdyZWV0aW5ncycsIGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBnZXRSYW5kb21Gcm9tQXJyYXkgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgICAgIHJldHVybiBhcnJbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogYXJyLmxlbmd0aCldO1xuICAgIH07XG5cbiAgICB2YXIgZ3JlZXRpbmdzID0gW1xuICAgICAgICAnSGVsbG8sIG1pY3JvZ3JlZW5zIGxvdmVyISBCdXkgc29tZXRoaW5nIG9yIGxlYXZlLicsXG4gICAgICAgICdCcm9jY29saSwgeW91IGNhblxcJ3Qgc2l0IHdpdGggdXMuJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uIEkgYW0gYSBzdXBlcmlvciB2ZWdldGFibGUuJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5ISBUaGUgc3VuIGlzIG1ha2luZyBtZSBhZ2UuJyxcbiAgICAgICAgJ0lcXCdtIGxpa2UgYW55IG90aGVyIHZlZ2dpZSwgZXhjZXB0IHRoYXQgSSBhbSBiZXR0ZXIuIDopJyxcbiAgICAgICAgJ1JPQVIuJyxcbiAgICAgICAgJ+engeOBr+OBiuOBhOOBl+OBhG1pY3JvZ3JlZW7jgafjgZnjgILnp4HjgpLpo5/jgbnjgb7jgZnjgIInLFxuICAgIF07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBncmVldGluZ3M6IGdyZWV0aW5ncyxcbiAgICAgICAgZ2V0UmFuZG9tR3JlZXRpbmc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRSYW5kb21Gcm9tQXJyYXkoZ3JlZXRpbmdzKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuIiwiYXBwLmZhY3RvcnkoJ1Jldmlld3NGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKXtcblx0cmV0dXJuIHtcblx0XHRnZXRBbGxSZXZpZXdzOiBmdW5jdGlvbiAoKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL3Jldmlld3NcIilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRSZXZpZXdCeUlkOiBmdW5jdGlvbiAocmV2aWV3aWQpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvcmV2aWV3cy9cIiArIHJldmlld2lkKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNyZWF0ZVJldmlldzogZnVuY3Rpb24gKHJldmlldykge1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL3Jldmlld3NcIiwgcmV2aWV3KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRlZGl0UmV2aWV3QnlJZDogZnVuY3Rpb24gKGlkLCByZXZpZXcpIHtcblx0XHRcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvcmV2aWV3cy8nICsgaWQsIHJldmlldylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZGVsZXRlUmV2aWV3QnlJZDogZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL3Jldmlld3MvJyArIGlkKTtcblx0XHR9LFxuXHR9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1VzZXJGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwKXtcbiAgcmV0dXJuIHtcbiAgICBnZXRBbGxVc2VyczogZnVuY3Rpb24gKCl7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL3VzZXJzXCIpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0VXNlckJ5SWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldChcIi91c2Vycy9cIiArIGlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBnZXRVc2VyQnlFbWFpbDogZnVuY3Rpb24gKGVtYWlsKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvdXNlcnMvZW1haWwvJyArIGVtYWlsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBjcmVhdGVVc2VyOiBmdW5jdGlvbiAodXNlcikge1xuICAgICAgcmV0dXJuICRodHRwLnBvc3QoXCIvc2lnbnVwXCIsIHVzZXIpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIHB1dE9yZGVyT25Vc2VyOiBmdW5jdGlvbiAoaWQsIGluZm8pIHtcbiAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9vcmRlcm9udXNlci8nICsgaWQsIHtfaWQ6IGluZm99KVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBwcm9tb3RlVXNlclN0YXR1czogZnVuY3Rpb24gKGlkLCBpbmZvKSB7XG4gICAgICByZXR1cm4gJGh0dHAucHV0KCcvcHJvbW90ZS8nICsgaWQsIGluZm8pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgIH0sXG4gICAgcmVzZXRVc2VyUGFzc3dvcmQ6IGZ1bmN0aW9uIChpZCwgaW5mbykge1xuICAgICAgcmV0dXJuICRodHRwLnB1dCgnL3Jlc2V0LycgKyBpZCwgaW5mbylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pXG4gICAgfSxcbiAgICB0cmlnZ2VyUmVzZXQ6IGZ1bmN0aW9uIChlbWFpbCwgaW5mbykge1xuICAgICAgcmV0dXJuICRodHRwLnB1dCgnL3Jlc2V0L3RyaWdnZXIvJytlbWFpbCwgaW5mbylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pXG4gICAgfSxcbiAgICBkZWxldGVVc2VyQnlJZDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZGVsZXRlKCcvZGVsZXRlLycgKyBpZCk7XG4gICAgfVxuICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBuYW1lOiAnQCcsXG4gICAgICAgICAgICB2aWRlb3M6ICc9JyxcbiAgICAgICAgICAgIGJhY2tncm91bmQ6ICdAJ1xuICAgICAgICB9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50KSB7XG4gICAgICAgICAgICBlbGVtZW50LmNzcyh7IGJhY2tncm91bmQ6IHNjb3BlLmJhY2tncm91bmQgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxTZWN0aW9uTWVudScsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICByZXF1aXJlOiAnbmdNb2RlbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi1tZW51L3R1dG9yaWFsLXNlY3Rpb24tbWVudS5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNlY3Rpb25zOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRycywgbmdNb2RlbEN0cmwpIHtcblxuICAgICAgICAgICAgc2NvcGUuY3VycmVudFNlY3Rpb24gPSBzY29wZS5zZWN0aW9uc1swXTtcbiAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoc2NvcGUuY3VycmVudFNlY3Rpb24pO1xuXG4gICAgICAgICAgICBzY29wZS5zZXRTZWN0aW9uID0gZnVuY3Rpb24gKHNlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBzY29wZS5jdXJyZW50U2VjdGlvbiA9IHNlY3Rpb247XG4gICAgICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShzZWN0aW9uKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgfVxuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFZpZGVvJywgZnVuY3Rpb24gKCRzY2UpIHtcblxuICAgIHZhciBmb3JtWW91dHViZVVSTCA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gJ2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkLycgKyBpZDtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHZpZGVvOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS50cnVzdGVkWW91dHViZVVSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKGZvcm1Zb3V0dWJlVVJMKHNjb3BlLnZpZGVvLnlvdXR1YmVJRCkpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnYmxlbmQnLCBmdW5jdGlvbiAoQ2FydEZhY3RvcnksIEJsZW5kc0ZhY3RvcnksIEF1dGhTZXJ2aWNlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2JsZW5kL2JsZW5kLmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgYmxlbmQ6ICc9JyxcbiAgICAgICAgICAgIGlzTmV3QmxlbmRGb3JtT3BlbjogJz0nLFxuICAgICAgICAgICAgZGVsZXRlYmxlbmQ6ICcmJ1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgXHRzY29wZS5xdWFudGl0eSA9IDE7XG4gICAgICAgICAgc2NvcGUuaXNBZG1pbiA9IGZhbHNlOyBcbiAgICAgICAgICBzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbihibGVuZCwgcXVhbnRpdHkpIHtcbiAgICAgICAgICBcdHZhciBibGVuZFdpdGhRdWFudGl0eSA9IGJsZW5kO1xuICAgICAgICAgIFx0YmxlbmRXaXRoUXVhbnRpdHkucXVhbnRpdHkgPSBxdWFudGl0eTtcbiAgICAgICAgICBcdGNvbnNvbGUubG9nKFwiYmxlbmQgd2l0aCBxdWFudGl0eVwiLCBibGVuZFdpdGhRdWFudGl0eSk7IFxuICAgICAgICAgICAgQ2FydEZhY3Rvcnkuc2F2ZUNhcnQoYmxlbmQubmFtZSwgYmxlbmRXaXRoUXVhbnRpdHkpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKClcbiAgICAgICAgICAudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uICh1c2VyKXtcbiAgICAgICAgICAgIGlmICh1c2VyKSBzY29wZS5pc0FkbWluID0gdXNlci5hZG1pbjtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbWljcm8nLCBmdW5jdGlvbiAoQXV0aFNlcnZpY2UsIE1pY3Jvc0ZhY3RvcnkpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbWljcm8vbWljcm8uaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBtaWNybzogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICBcdC8vY2hlY2tzIGlmIGN1cnJlbnQgdXNlciBpcyBhZG1pblxuICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAoY3VyclVzZXIpe1xuICAgICAgICAgICAgICAgIHNjb3BlLmlzQWRtaW4gPSBjdXJyVXNlci5hZG1pbjtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS5pc0NvbGxhcHNlZCA9IHRydWU7XG5cbiAgICAgICAgICAgIHNjb3BlLmVkaXRNaWNybyA9IGZ1bmN0aW9uIChpbnZlbnRvcnksIHByaWNlKSB7XG4gICAgICAgICAgICAgICAgTWljcm9zRmFjdG9yeS5lZGl0TWljcm9CeUlkKHNjb3BlLm1pY3JvLl9pZCwge2ludmVudG9yeTogaW52ZW50b3J5LCBwcmljZTogcHJpY2V9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZlbnRvcnkgQ2hhbmdlZCEnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cblx0XHR9XG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnbmF2YmFyJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCBBVVRIX0VWRU5UUywgJHN0YXRlKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge30sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvbmF2YmFyL25hdmJhci5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLml0ZW1zID0gW1xuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdIb21lJywgc3RhdGU6ICdob21lJyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdNaWNyb3MnLCBzdGF0ZTogJ21pY3JvcycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQmxlbmRzJywgc3RhdGU6ICdibGVuZHMnfVxuICAgICAgICAgICAgICAgIC8vIHsgbGFiZWw6ICdUdXRvcmlhbCcsIHN0YXRlOiAndHV0b3JpYWwnIH0sXG4gICAgICAgICAgICAgICAgLy8geyBsYWJlbDogJ0FkbWlucyBPbmx5Jywgc3RhdGU6ICdhZG1pbi11c2VyJywgYXV0aDogdHJ1ZSB9XG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBzY29wZS51c2VyID0gbnVsbDtcblxuICAgICAgICAgICAgc2NvcGUuaXNMb2dnZWRJbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgc2V0VXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSB1c2VyO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHJlbW92ZVVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzZXRVc2VyKCk7XG5cbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcywgc2V0VXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCByZW1vdmVVc2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCByZW1vdmVVc2VyKTtcblxuICAgICAgICB9XG5cbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdvcmRlcicsIGZ1bmN0aW9uIChPcmRlcnNGYWN0b3J5LCBBdXRoU2VydmljZSkge1xuXHRyZXR1cm4ge1xuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9vcmRlcnMvb3JkZXIuaHRtbCcsXG5cdFx0c2NvcGU6IHtcblx0XHRcdG9yZGVyOiAnPScsXG5cdFx0XHRkZWxldGVvcmRlcjogJyYnLFxuXHRcdFx0ZWRpdG9yZGVyOiAnJidcblx0XHR9LFxuXHRcdGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG5cdFx0XHRBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uIChjdXJyVXNlcil7XG4gICAgICAgICAgICAgICAgc2NvcGUuaXNBZG1pbiA9IGN1cnJVc2VyLmFkbWluO1xuICAgICAgICAgICAgfSk7XG5cblx0XHRcdHNjb3BlLm9yZGVyU3RhdHVzID0gW1xuXHRcdFx0XHQnY3JlYXRlZCcsXG5cdFx0XHRcdCdwcm9jZXNzaW5nJyxcblx0XHRcdFx0J2NhbmNlbGxlZCcsXG5cdFx0XHRcdCdjb21wbGV0ZWQnXG5cdFx0XHRdO1xuXG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgncmFuZG9HcmVldGluZycsIGZ1bmN0aW9uIChSYW5kb21HcmVldGluZ3MpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUuZ3JlZXRpbmcgPSBSYW5kb21HcmVldGluZ3MuZ2V0UmFuZG9tR3JlZXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3JldmlldycsIGZ1bmN0aW9uKFJldmlld3NGYWN0b3J5LCBCbGVuZHNGYWN0b3J5LCBBdXRoU2VydmljZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmV2aWV3L3Jldmlldy5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHJldmlldzogJz0nLFxuICAgICAgICAgICAgYmxlbmQ6ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSkge1xuXG4gICAgICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uIChjdXJyVXNlcil7XG4gICAgICAgICAgICAgICAgc2NvcGUudXNlcklkID0gY3VyclVzZXIuX2lkO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNjb3BlLnNob3dSZXZpZXdzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmxlbmQgaXMgXCIsIHNjb3BlLmJsZW5kKTtcbiAgICAgICAgICAgICAgQmxlbmRzRmFjdG9yeS5nZXRCbGVuZEJ5SWQoc2NvcGUuYmxlbmQuX2lkKS50aGVuKGZ1bmN0aW9uKGJsZW5kKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJsZW5kIHJldmlld3MgYXJlIFwiLCBibGVuZCk7XG4gICAgICAgICAgICAgICAgc2NvcGUucmV2QXJyID0gYmxlbmQucmV2aWV3cztcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiZ290IHJldmlld3MhXCIpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLnNob3dSZXZpZXdzKCk7XG5cbiAgICAgICAgICAgIHNjb3BlLm5ld1JldmlldyA9IGZ1bmN0aW9uKHN0YXIsIGNvbW1lbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3UmV2aWV3ID0ge1xuICAgICAgICAgICAgICAgICAgICByYXRpbmc6IHN0YXIsXG4gICAgICAgICAgICAgICAgICAgIGNvbW1lbnQ6IGNvbW1lbnQsXG4gICAgICAgICAgICAgICAgICAgIGJsZW5kOiBzY29wZS5ibGVuZC5faWQsXG4gICAgICAgICAgICAgICAgICAgIHVzZXI6IHNjb3BlLnVzZXJJZFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgUmV2aWV3c0ZhY3RvcnkuY3JlYXRlUmV2aWV3KG5ld1JldmlldykudGhlbihmdW5jdGlvbihyZXZpZXcpIHtcbiAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdZQVlZWVkhIE5FVyBSRVZJRVcgQ1JFQVRFRCEnLCByZXZpZXcuX2lkKTtcbiAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgc2NvcGUuYmxlbmQucmV2aWV3cyA9IHNjb3BlLmJsZW5kLnJldmlld3MubWFwKGZ1bmN0aW9uKHJldmlldyl7cmV0dXJuIHJldmlldy5faWQ7fSk7XG4gICAgICAgICAgICAgICAgICBzY29wZS5ibGVuZC5yZXZpZXdzLnB1c2gocmV2aWV3Ll9pZCk7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIndpdGggbmV3IGlkXCIsIHNjb3BlLmJsZW5kKTtcbiAgICAgICAgICAgICAgICAgIEJsZW5kc0ZhY3RvcnkuZWRpdEJsZW5kQnlJZChzY29wZS5ibGVuZC5faWQsIHtyZXZpZXdzOiBzY29wZS5ibGVuZC5yZXZpZXdzfSk7XG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgc2NvcGUuc2hvd1Jldmlld3MoKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=