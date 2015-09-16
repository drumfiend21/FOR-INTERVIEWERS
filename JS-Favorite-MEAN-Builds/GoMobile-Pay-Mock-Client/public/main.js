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

            $('#tchopay-script').attr('data-transactionHashValue', initObj.transactionHash);
            $('#tchopay-script').attr('data-timestamp', initObj.timestamp);

            console.log('init http response', response);

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
        console.log('order is ', order);
        if (!AuthService.isAuthenticated()) return $state.go('login');

        var userIdPromise = AuthService.getLoggedInUser().then(function (user) {
            console.log('this is user logged in from checkout', user);
            return user._id;
        });

        var formattedObj = order.map(function (obj) {
            return { typeofblend: obj._id, quantity: obj.quantity, name: obj.name };
        });
        order = formattedObj;

        var toSubmit = { blend: order, status: 'created' };
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
        console.log('in add micro');
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
        if (orders.length) {}
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
            return $http.get('/api/blends').then(function (response) {
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
            return $http.get('/api/blends/' + blendid).then(function (response) {
                return response.data;
            });
        },
        getBlendByName: function getBlendByName(blendname) {
            // don't have this route yet
            return $http.get('/api/blends/name/' + blendname).then(function (response) {
                return response.data;
            });
        },
        createBlend: function createBlend(blend) {
            return $http.post('/api/blends', blend).then(function (response) {
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
                if (keys[i] === 'debug') {
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
            return $http.get('/api/micros').then(function (response) {
                return response.data;
            });
        },
        getMicroById: function getMicroById(microid) {
            return $http.get('/api/micros/' + microid).then(function (response) {
                return response.data;
            });
        },
        getMicroByName: function getMicroByName(microname) {
            return $http.get('/api/micros/name/' + microname).then(function (response) {
                return response.data;
            });
        },
        getMicrosBySpice: function getMicrosBySpice(spicelevel) {
            return $http.get('/api/micros/spice/' + spicelevel).then(function (response) {
                return response.data;
            });
        },
        createMicro: function createMicro(micro) {
            return $http.post('/api/micros', micro).then(function (response) {
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
            return $http.get('/api/orders').then(function (response) {
                return response.data;
            });
        },
        getOrderById: function getOrderById(orderid) {
            return $http.get('/api/orders/' + orderid).then(function (response) {
                return response.data;
            });
        },
        createOrder: function createOrder(order) {
            return $http.post('/api/orders', order).then(function (response) {
                return response.data;
            });
        },
        editOrderById: function editOrderById(id, order) {
            //console.log("in the factory order is ", order);
            return $http.put('/api/orders/' + id, { '_id': order }).then(function (response) {
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
            return $http.get('/api/reviews').then(function (response) {
                return response.data;
            });
        },
        getReviewById: function getReviewById(reviewid) {
            return $http.get('/api/reviews/' + reviewid).then(function (response) {
                return response.data;
            });
        },
        createReview: function createReview(review) {
            return $http.post('/api/reviews', review).then(function (response) {
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
            return $http.get('/users').then(function (response) {
                return response.data;
            });
        },
        getUserById: function getUserById(id) {
            return $http.get('/users/' + id).then(function (response) {
                return response.data;
            });
        },
        getUserByEmail: function getUserByEmail(email) {
            return $http.get('/users/email/' + email).then(function (response) {
                return response.data;
            });
        },
        createUser: function createUser(user) {
            return $http.post('/signup', user).then(function (response) {
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
                console.log('blend with quantity', blendWithQuantity);
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
                console.log('blend is ', scope.blend);
                BlendsFactory.getBlendById(scope.blend._id).then(function (blend) {
                    console.log('blend reviews are ', blend);
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
                    console.log('with new id', scope.blend);
                    BlendsFactory.editBlendById(scope.blend._id, { reviews: scope.blend.reviews });
                }).then(function () {
                    scope.showReviews();
                });
            };
        }
    };
});

// $scope.showRecommendation = true;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFkbWluLXVzZXIvYWRtaW4tdXNlci5qcyIsImJsZW5kcy9ibGVuZHMuanMiLCJjYXJ0L2NhcnQuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImhvbWUvaG9tZS5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWVtYmVycy1vbmx5L21lbWJlcnMtb25seS5qcyIsIm1pY3Jvcy9taWNyb3MuanMiLCJvcmRlcnMvb3JkZXJzLmpzIiwicmVzZXQvcmVzZXQuanMiLCJzaWdudXAvc2lnbnVwLmpzIiwidHV0b3JpYWwvdHV0b3JpYWwuanMiLCJjb21tb24vZmFjdG9yaWVzL0JsZW5kc0ZhY3RvcnkuanMiLCJjb21tb24vZmFjdG9yaWVzL0NhcnRGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9NaWNyb3NGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9PcmRlcnNGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZmFjdG9yaWVzL1Jldmlld3NGYWN0b3J5LmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9Vc2VyRmFjdG9yeS5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2JsZW5kL2JsZW5kLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uanMiLCJjb21tb24vZGlyZWN0aXZlcy9taWNyby9taWNyby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9vcmRlcnMvb3JkZXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL3Jldmlldy9yZXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGFBQUE7QUFDQSxtQkFBQSxFQUFBLCtCQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7OztBQUdBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7OztBQUdBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTs7QUFFQSxtQkFBQSxDQUFBLFdBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxzQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQSxJQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxXQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxTQUNBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDhDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOzs7QUFHQSxVQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7OztBQUdBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBSUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSx5QkFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsaUJBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBLEVBQUEsY0FBQSxFQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLE1BQUEsRUFBQTs7QUFFQSxjQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxvQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQzNGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsa0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGtCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtLQUNBLENBQUE7O0FBRUEsaUJBQUEsQ0FBQSxZQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLGlCQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxXQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQTtBQUNBLHdCQUFBLEVBQUEsS0FBQTthQUNBLENBQUE7QUFDQSxrQkFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTs7QUFHQSxVQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLFlBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsa0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBOztTQUVBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLENBQUEsR0FBQSxDQUFBO1NBQ0EsQ0FDQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsR0FBQSxPQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLG9CQUFBLEVBQUEsSUFBQTtBQUNBLHNCQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTthQUNBLENBQUE7QUFDQSx1QkFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTs7OztTQUlBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxlQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxtQkFBQSxhQUFBLENBQUEsWUFBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxZQUFBLHNCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEtBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLHNDQUFBLEdBQUEsQ0FBQSxDQUFBO2FBQ0E7U0FDQTtBQUNBLFlBQUEsb0JBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FB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Q0EsbUJBQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBRUEsQ0FBQTs7O0FBR0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsWUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUE7O0FBR0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQSxPQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxhQUFBLEdBQUEsV0FBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsWUFBQSxHQUFBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsR0FBQSxFQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsUUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7U0FDQSxDQUNBLENBQUE7QUFDQSxhQUFBLEdBQUEsWUFBQSxDQUFBOztBQUVBLFlBQUEsUUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxhQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxFQUFBLGFBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsZ0JBQUEsWUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSxXQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSxtQkFBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsRUFBQSxZQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FDQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUVBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNsSUEsQ0FBQSxZQUFBOztBQUVBLGdCQUFBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLFFBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7Ozs7QUFJQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOzs7Ozs7QUFNQSxnQkFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTthQUNBOzs7OztBQUtBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FFQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSw0QkFBQSxFQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLGlCQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsMkNBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQTtLQUVBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsWUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsRUFBQSxDQUFBO0FDbElBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsbUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDTEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLFdBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsU0FBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOzs7OztBQUtBLG1CQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGdCQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxTQUNBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDRCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDeENBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGNBQUE7QUFDQSxnQkFBQSxFQUFBLG1FQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsdUJBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTs7O0FBR0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLEdBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFFBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDL0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxTQUFBO0FBQ0Esa0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUE7Ozs7QUFJQSxVQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQ0EsTUFBQSxFQUNBLFFBQUEsRUFDQSxjQUFBLEVBQ0EsT0FBQSxDQUNBLENBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsYUFBQSxHQUFBLFlBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxnQkFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTtTQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQUEsbUJBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7U0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLG9CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLDJCQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLHlCQUFBLEVBQUEsSUFBQTthQUNBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsZUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsbUJBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOzs7QUFHQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLGtCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0tBQ0Es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QUEsZ0JBQUEsR0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTt5QkFDQSxDQUFBLENBQUE7cUJBQ0EsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQTs7U0FFQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLHFCQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsRUFBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtTQUVBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsVUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsZUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBOztBQUVBLHlCQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO0FBQ0EsbUJBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsWUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLG1CQUFBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOzs7OztBQUtBLFVBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLHVCQUFBLENBQUEsaUJBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7YUFDQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsNEJBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNqQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsU0FBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7QUFDQSxrQkFBQSxFQUFBLFlBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7O0FBRUEsVUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsSUFBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsbUJBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxHQUFBLDZCQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDOUJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxzQkFBQSxlQUFBLEVBQUE7QUFDQSx1QkFBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLHdCQUFBLENBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0Esb0JBQUEsY0FBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esd0JBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHlCQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLDRCQUFBLEtBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxFQUFBO0FBQ0EsbUNBQUEsR0FBQSxLQUFBLENBQUE7eUJBQ0E7cUJBQ0EsQ0FBQSxDQUFBO0FBQ0EsMkJBQUEsT0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQTs7QUFFQSx1QkFBQSxjQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLG9CQUFBLEVBQUEsc0JBQUEsT0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxTQUFBLEVBQUE7O0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxHQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLG1CQUFBLEVBQUEscUJBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EscUJBQUEsRUFBQSx1QkFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxjQUFBLEdBQUEs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LElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esd0JBQUEsRUFBQSwwQkFBQSxVQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9CQUFBLEdBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxxQkFBQSxFQUFBLHVCQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsdUJBQUEsRUFBQSx5QkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUMxQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esb0JBQUEsRUFBQSxzQkFBQSxPQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHFCQUFBLEVBQUEsdUJBQUEsRUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSx1QkFBQSxFQUFBLHlCQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQy9CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsWUFBQTs7QUFFQSxRQUFBLGtCQUFBLEdBQUEsU0FBQSxrQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFNBQUEsR0FBQSxDQUNBLG1EQUFBLEVBQ0EsbUNBQUEsRUFDQSxpREFBQSxFQUNBLGlEQUFBLEVBQ0EseURBQUEsRUFDQSxPQUFBLEVBQ0EsNEJBQUEsQ0FDQSxDQUFBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFNBQUE7QUFDQSx5QkFBQSxFQUFBLDZCQUFBO0FBQ0EsbUJBQUEsa0JBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUN2QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLHFCQUFBLEVBQUEseUJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHFCQUFBLEVBQUEsdUJBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esb0JBQUEsRUFBQSxzQkFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLEVBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esd0JBQUEsRUFBQSwwQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLFVBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUM5QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxzQkFBQSxFQUFBLHdCQUFBLEtBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0Esc0JBQUEsRUFBQSx3QkFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsdUJBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBO0FBQ0EseUJBQUEsRUFBQSwyQkFBQSxFQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHlCQUFBLEVBQUEsMkJBQUEsRUFBQSxFQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7QUFDQSxvQkFBQSxFQUFBLHNCQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLEdBQUEsS0FBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7YUFDQSxDQUFBLENBQUE7U0FDQTtBQUNBLHNCQUFBLEVBQUEsd0JBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxVQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdERBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsR0FBQTtBQUNBLHNCQUFBLEVBQUEsR0FBQTtTQUNBO0FBQ0EsbUJBQUEsRUFB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O0FBQ0EseUJBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSwyQkFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsaUNBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO2lCQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLHlCQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7aUJBQ0EsQ0FBQSxDQUFBO2FBRUEsQ0FBQTtTQUNBO0tBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnZnNhUHJlQnVpbHQnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluLXVzZXInLCB7XG4gICAgICAgIHVybDogJy9hZG1pbi11c2VyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hZG1pbi11c2VyL2FkbWluLXVzZXIuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdNYW5hZ2VVc2VyQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdNYW5hZ2VVc2VyQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCBVc2VyRmFjdG9yeSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICRzY29wZS5zZWFyY2hpbmdVc2VyID0gZmFsc2U7XG4gICAgJHNjb3BlLnVzZXJsaXN0ID0gbnVsbDtcbiAgICAkc2NvcGUucHJvbW90ZUJvb2wgPSBudWxsO1xuXG4vL2NoZWNrcyBpZiBjdXJyZW50IHVzZXIgaXMgYWRtaW5cbiAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uIChjdXJyVXNlcil7XG4gICAgICAgICAgICAkc2NvcGUuaXNBZG1pbiA9IGN1cnJVc2VyLmFkbWluO1xuICAgIH0pO1xuXG4vL2xpc3RzIGFsbCB1c2Vyc1xuICAgICRzY29wZS5nZXRBbGxVc2VycyA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICBVc2VyRmFjdG9yeS5nZXRBbGxVc2VycygpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh1c2Vycykge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXJsaXN0ID0gdXNlcnM7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBhY3Rpb24gb2YgbGlzdGluZyBhbGwgdXNlcnMuJztcbiAgICAgICAgfSk7ICAgIFxuICAgIH07XG5cbi8vbGlzdHMgYSB1c2VyIGJ5IGlkXG4gICAgJHNjb3BlLmdldFVzZXJCeUlkID0gZnVuY3Rpb24gKGlkLCBpbmZvKSB7XG5cbiAgICAgICAgVXNlckZhY3RvcnkuZ2V0VXNlckJ5SWQoaWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAkc2NvcGUudXNlcmxpc3QgPSB1c2VyO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgYWN0aW9uIG9mIGxpc3RpbmcgYSBwYXJ0aWN1bGFyIHVzZXIuJztcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy9nZXQgdXNlciBieSBlbWFpbFxuICAgICRzY29wZS5nZXRVc2VyQnlFbWFpbCA9IGZ1bmN0aW9uIChlbWFpbCkge1xuICAgICAgICAkc2NvcGUuc2VhcmNoaW5nVXNlciA9IHRydWU7XG4gICAgICAgIFVzZXJGYWN0b3J5LmdldFVzZXJCeUVtYWlsKGVtYWlsKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgICAgICAkc2NvcGUuZm91bmRVc2VyID0gdXNlcjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuLy9wcm9tb3RlcyB1c2VyIHRvIGFkbWluOyBuZWVkcyB0byBiZSBjaGVja2VkIGlmIHdvcmtpbmdcbiAgICAkc2NvcGUucHJvbW90ZVRvQWRtaW4gPSBmdW5jdGlvbiAoYWRtaW5Cb29sKSB7XG5cblxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdUSElTIElTIEZPVU5EIFVTRVIhISEhIScsICRzY29wZS5mb3VuZFVzZXIudXNlci5faWQpO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LnByb21vdGVVc2VyU3RhdHVzKCRzY29wZS5mb3VuZFVzZXIudXNlci5faWQsIHthZG1pbjogYWRtaW5Cb29sfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdBRE1JTiBTVEFUVVMgQ0hBTkdFRCEnKTtcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAocmVzZXRCb29sKSB7XG5cbiAgICAgICAgVXNlckZhY3RvcnkudHJpZ2dlclJlc2V0KCRzY29wZS5mb3VuZFVzZXIudXNlci5lbWFpbCwge2NoYW5nZXBhc3N3b3JkOiByZXNldEJvb2x9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdQYXNzd29yZCByZXNldCB0cmlnZ2VycmVkIScsICRzY29wZS5mb3VuZFVzZXIudXNlcik7XG4gICAgICAgIH0pXG5cbiAgICB9XG5cbi8vZGVsZXRlcyBhIHVzZXJcbiAgICAkc2NvcGUuZGVsZXRlVXNlciA9IGZ1bmN0aW9uICh1c2VySWQpIHtcblxuICAgICAgICB1c2VySWQgPSAkc2NvcGUuZm91bmRVc2VyLnVzZXIuX2lkO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LmRlbGV0ZVVzZXJCeUlkKHVzZXJJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnVVNFUiBERUxFVEVEISEhJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBhY3Rpb24gb2YgZGVsZXRpbmcgYSB1c2VyLic7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgLy8gUmVnaXN0ZXIgb3VyICphYm91dCogc3RhdGUuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2JsZW5kcycsIHtcbiAgICAgICAgdXJsOiAnL2JsZW5kcycsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdCbGVuZHNDb250cm9sbGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ibGVuZHMvYmxlbmRzLmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQmxlbmRzQ29udHJvbGxlcicsIGZ1bmN0aW9uICgkc2NvcGUsIEJsZW5kc0ZhY3RvcnksIE1pY3Jvc0ZhY3RvcnksIENhcnRGYWN0b3J5KSB7XG4gICAgJHNjb3BlLmFsbEJsZW5kcyA9IG51bGw7XG4gICAgJHNjb3BlLmFsbE1pY3JvcyA9IG51bGw7XG4gICAgJHNjb3BlLnNlbGVjdGVkTWljcm9zID0gW107ICBcbiAgICAkc2NvcGUuYmxlbmRzID0gbnVsbDtcbiAgICAkc2NvcGUuZWRpdGVkQmxlbmQgPSBudWxsO1xuICAgICRzY29wZS53aGljaE5hbWVUb0dldCA9IG51bGw7XG4gICAgJHNjb3BlLndoaWNoVG9FZGl0ID0gbnVsbDtcbiAgICAkc2NvcGUuaXNOZXdCbGVuZEZvcm1PcGVuID0gZmFsc2U7XG4gICAgJHNjb3BlLm5ld0JsZW5kID0ge1xuICAgICAgICBuYW1lOiBudWxsLFxuICAgICAgICBtaWNyb3M6IFtdLFxuICAgICAgICBwcmljZTogbnVsbFxuICAgICB9O1xuXG4gICAgQmxlbmRzRmFjdG9yeS5nZXRBbGxCbGVuZHMoKS50aGVuKGZ1bmN0aW9uIChibGVuZHMpIHtcbiAgICAgICAgICAgICRzY29wZS5hbGxCbGVuZHMgPSAkc2NvcGUuYmxlbmRzID0gYmxlbmRzO1xuICAgICAgICB9KTtcblxuICAgIE1pY3Jvc0ZhY3RvcnkuZ2V0QWxsTWljcm9zKCkudGhlbihmdW5jdGlvbiAobWljcm9zKXtcbiAgICAgICAgJHNjb3BlLmFsbE1pY3JvcyA9IG1pY3JvczsgXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuYWxsTWljcm9zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIHZhciBtaWNyb09iamVjdCA9IHtcbiAgICAgICAgICAgICAgICBpZDogJHNjb3BlLmFsbE1pY3Jvc1tpXS5faWQsXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQ6IGZhbHNlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkTWljcm9zLnB1c2gobWljcm9PYmplY3QpO1xuICAgICAgICB9XG4gICAgfSk7XG5cblxuICAgICRzY29wZS5sb2dUaGlzID0gZnVuY3Rpb24oc29tZXRoaW5nKXtcbiAgICAgICAgY29uc29sZS5sb2coc29tZXRoaW5nKTtcbiAgICB9O1xuICAgICRzY29wZS5zaG93QWxsQmxlbmRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmdldEFsbEJsZW5kcygpLnRoZW4oZnVuY3Rpb24gKGJsZW5kcykge1xuICAgICAgICAgICAgJHNjb3BlLmlzTmV3QmxlbmRGb3JtT3BlbiA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLmFsbEJsZW5kcyA9ICRzY29wZS5ibGVuZHMgPSBibGVuZHM7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLnNob3dCbGVuZEJ5SWQgPSBmdW5jdGlvbihibGVuZGlkKSB7XG4gICAgICAgIEJsZW5kc0ZhY3RvcnkuZ2V0QmxlbmRCeUlkKGJsZW5kaWQpLnRoZW4oZnVuY3Rpb24gKGJsZW5kKXtcbiAgICAgICAgICAgICRzY29wZS5ibGVuZHMgPSBibGVuZDtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUuc2hvd0JsZW5kQnlOYW1lID0gZnVuY3Rpb24oYmxlbmRuYW1lKSB7XG4gICAgICAgIEJsZW5kc0ZhY3RvcnkuZ2V0QmxlbmRCeU5hbWUoYmxlbmRuYW1lKS50aGVuKGZ1bmN0aW9uIChibGVuZCl7XG4gICAgICAgICAgICAkc2NvcGUuYmxlbmRzID0gW2JsZW5kXTtcbiAgICAgICAgICAgIC8vICRzY29wZS5pbWFnZSA9IGJsZW5kLmltYWdlO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5hZGRCbGVuZCA9IGZ1bmN0aW9uIChibGVuZCkge1xuICAgICAgICB2YXIganVzdElkcyA9IGJsZW5kLm1pY3Jvcy5tYXAoXG4gICAgICAgICAgICBmdW5jdGlvbihvYmope1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmouX2lkO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBibGVuZC5taWNyb3MgPSBqdXN0SWRzO1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmNyZWF0ZUJsZW5kKGJsZW5kKS50aGVuKGZ1bmN0aW9uIChuZXdCbGVuZCl7XG4gICAgICAgICAgICAkc2NvcGUubmV3QmxlbmQgPSB7XG4gICAgICAgICAgICAgICAgbmFtZTogbnVsbCxcbiAgICAgICAgICAgICAgICBtaWNyb3M6IFtdLFxuICAgICAgICAgICAgICAgIHByaWNlOiBudWxsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIENhcnRGYWN0b3J5LnNhdmVDYXJ0KG5ld0JsZW5kLm5hbWUsIG5ld0JsZW5kKTtcbiAgICAgICAgICAgICRzY29wZS5zaG93QWxsQmxlbmRzKCk7XG4gICAgICAgICAgICAvLyBCbGVuZHNGYWN0b3J5LmdldEFsbEJsZW5kcygpLnRoZW4oZnVuY3Rpb24gKGJsZW5kcykge1xuICAgICAgICAgICAgLy8gICAgICRzY29wZS5hbGxCbGVuZHMgPSBibGVuZHM7XG4gICAgICAgICAgICAvLyB9KTsgICBcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUuZGVsZXRlQmxlbmQgPSBmdW5jdGlvbiAoaWQpe1xuICAgICAgICBCbGVuZHNGYWN0b3J5LmRlbGV0ZUJsZW5kQnlJZChpZCkudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIEJsZW5kc0ZhY3RvcnkuZ2V0QWxsQmxlbmRzKCk7XG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oYmxlbmRzKXtcbiAgICAgICAgICAgICRzY29wZS5ibGVuZHMgPSAkc2NvcGUuYWxsQmxlbmRzID0gYmxlbmRzOyBcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUubG9hZEJsZW5kVG9FZGl0ID0gZnVuY3Rpb24gKGlkKXtcbiAgICAgICAgQmxlbmRzRmFjdG9yeS5nZXRCbGVuZEJ5SWQoaWQpLnRoZW4oZnVuY3Rpb24gKGJsZW5kKXtcbiAgICAgICAgICAgICRzY29wZS5lZGl0ZWRCbGVuZCA9IGJsZW5kO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5lZGl0QmxlbmQgPSBmdW5jdGlvbiAoaWQsIGJsZW5kKXtcbiAgICAgICAgQmxlbmRzRmFjdG9yeS5lZGl0QmxlbmRCeUlkKGlkLCBibGVuZCkudGhlbihmdW5jdGlvbiAoYmxlbmQpe1xuICAgICAgICAgICAgJHNjb3BlLmVkaXRlZEJsZW5kID0gYmxlbmQ7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUucmVmcmVzaE5ld0JsZW5kID0gZnVuY3Rpb24gKHNlbGVjdGVkTWljcm8pe1xuICAgICAgICB2YXIgYWxsTWljcm9zSW5kZXhPZk9iamVjdCA9IG51bGw7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCAkc2NvcGUuYWxsTWljcm9zLmxlbmd0aDsgaSsrKXtcbiAgICAgICAgICAgIGlmKCRzY29wZS5hbGxNaWNyb3NbaV0uX2lkID09PSBzZWxlY3RlZE1pY3JvLmlkKXtcbiAgICAgICAgICAgICAgICBhbGxNaWNyb3NJbmRleE9mT2JqZWN0ID0gaTsgXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGluZGV4T2ZTZWxlY3RlZE1pY3JvID0gJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5pbmRleE9mKCRzY29wZS5hbGxNaWNyb3NbYWxsTWljcm9zSW5kZXhPZk9iamVjdF0pO1xuICAgICAgICBpZihzZWxlY3RlZE1pY3JvLnNlbGVjdGVkKXtcbiAgICAgICAgICAgIGlmKGluZGV4T2ZTZWxlY3RlZE1pY3JvID09PSAtMSl7XG4gICAgICAgICAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8ICRzY29wZS5hbGxNaWNyb3MubGVuZ3RoOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmFsbE1pY3Jvc1tqXS5faWQgPT09IHNlbGVjdGVkTWljcm8uaWQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5wdXNoKCRzY29wZS5hbGxNaWNyb3Nbal0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGluZGV4T2ZTZWxlY3RlZE1pY3JvICE9PSAtMSl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld0JsZW5kLm1pY3Jvcy5zcGxpY2UoaW5kZXhPZlNlbGVjdGVkTWljcm8sIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuc2V0UHJpY2UgPSBmdW5jdGlvbihwcmljZSl7XG4gICAgICAgICRzY29wZS5uZXdCbGVuZC5wcmljZSA9IHByaWNlOyBcbiAgICB9O1xuXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2FydCcsIHtcbiAgICAgICAgdXJsOiAnL2NhcnQnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2FydENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NhcnQvY2FydC5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0NhcnRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRxLCAkc2NvcGUsIEF1dGhTZXJ2aWNlLCBVc2VyRmFjdG9yeSwgQ2FydEZhY3RvcnksIE9yZGVyc0ZhY3RvcnksICRzdGF0ZSwgJGh0dHApIHtcbi8vVENIT1BBWSBNT0NLVVBcblxuICAgIC8vICQoXCIjY2hlY2tvdXQtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG4gICAgLy8gICAgICQoJ2h0bWwnKS5hcHBlbmQoJzxsaW5rIHJlbD1cInN0eWxlc2hlZXRcIiBocmVmPVwiaHR0cDovLzE5Mi4xNjguMS4xNDg6MTMzNy9pZnJhbWUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIvPicpXG4gICAgLy8gICAgJCgnaHRtbCcpLmFwcGVuZChcIjxkaXYgaWQ9J2NoZWNrb3V0LWJnJyBjbGFzcz0nY2hlY2tvdXQtZmFkZWluJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogZ3JheTsgcG9zaXRpb246IGFic29sdXRlOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB6LWluZGV4OiA5OTk4Oyc+PC9kaXY+XCIpLnNob3coKSAgICAgXG4gICAgLy8gICAgdmFyIGZyYW1laW4gPSBmdW5jdGlvbigpe1xuICAgIC8vICAgICAgICAkKFwiPGlmcmFtZSBpZD0ndGNob3BheS1pZnJhbWUnIGNsYXNzPSdpZnJhbWUtZmFkZWluJyBzdHlsZT0nZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgd2lkdGg6IDIwJTsgcGFkZGluZzogMjBweDsgdG9wOiAxMDAlOyBsZWZ0OiAyNy41JTsgcmlnaHQ6IDI3LjUlOyBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogMzBweDsgaGVpZ2h0OiA2MDBweDsgbWFyZ2luOiAwIGF1dG87IHotaW5kZXg6IDk5OTk7JyBzcmM9J2h0dHA6Ly8xOTIuMTY4LjEuMTQ4OjEzMzcvY2hlY2tvdXQnPjwvaWZyYW1lPlwiKS5hcHBlbmRUbygkKCdodG1sJykpLmFuaW1hdGUoe3RvcDogXCIrMTAlXCJ9LCA1MDAsICdlYXNlSW5PdXRCYWNrJylcbiAgICAvLyAgICAgICAgLy8gJCgnaHRtbCcpLmFwcGVuZCgnPGJ1dHRvbiB0eXBlPVwiYnV0dG9uXCIgY2xhc3M9XCJpZnJhbWUtZmFkZWluXCIgaWQ9XCJjbG9zZS1idXR0b25cIiBzdHlsZT1cIlwiPng8YnV0dG9uPicpLmFuaW1hdGUoe3RvcDogXCIxMCVcIn0sIDUwMCwgJ2Vhc2VJbk91dEJhY2snKVxuICAgIC8vICAgICAgICAgICAgdmFyIHRlc3QgPSBcInRlc3RcIjtcbiAgICAvLyAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiZnJhbWUgZG9tYWluXCIsIGZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQuZG9tYWluKVxuICAgIC8vICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgLy8gICAgICAgICAgICB2YXIgZnVuYyA9IGZ1bmN0aW9uKCl7XG5cbiAgICAvLyAgICAgICAgICAgICAgICB2YXIgZnJhbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndGNob3BheS1pZnJhbWUnKTtcbiAgICAvLyAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhmcmFtZS5jb250ZW50V2luZG93KVxuICAgIC8vICAgICAgICAgICAgICAgIGZyYW1lLmNvbnRlbnRXaW5kb3cucG9zdE1lc3NhZ2UodGVzdCwgJ2h0dHA6Ly8xOTIuMTY4LjEuMTQ4OjEzMzcvJyk7XG4gICAgLy8gICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmMsIDIwMDApXG5cblxuICAgIC8vICAgIH0gICAgXG4gICAgLy8gICAgc2V0VGltZW91dChmcmFtZWluLCA1MDApXG5cbiAgICAvLyB9KVxuXG5cbiAgICB2YXIgdGNob1BheUluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL29yZGVycy9pbml0JylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBcbiAgICAgICAgLy9zZWxlY3Qgc3R1ZmYgb24gZG9tLi4uLiB3ZSB3aWxsIGZpcnN0IHB1dCBidXR0b24gb24gZG9tXG4gICAgICAgIFxuICAgICAgICB2YXIgaW5pdE9iaiA9IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgXG4gICAgICAgICQoXCIjdGNob3BheS1zY3JpcHRcIikuYXR0cihcImRhdGEtdHJhbnNhY3Rpb25IYXNoVmFsdWVcIiwgaW5pdE9iai50cmFuc2FjdGlvbkhhc2gpXG4gICAgICAgICQoXCIjdGNob3BheS1zY3JpcHRcIikuYXR0cihcImRhdGEtdGltZXN0YW1wXCIsIGluaXRPYmoudGltZXN0YW1wKVxuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiaW5pdCBodHRwIHJlc3BvbnNlXCIsIHJlc3BvbnNlKVxuXG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuXG4gICAgICB9KTsgIFxuICAgIH1cbiAgICB0Y2hvUGF5SW5pdCgpXG5cblxuXG4vL2V4dHJhY3QgdGltZXN0YW1wIGFuZCBoYXNoIGFuZCBzZXQgb24gYnV0dG9uIHNjcmlwdCBkYXRhLWF0dHJpYnV0ZXNcblxuXG5cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICAgJHNjb3BlLmxvZ1RoaXMgPSBmdW5jdGlvbihzb21ldGhpbmcpe1xuICAgICAgICBjb25zb2xlLmxvZyhzb21ldGhpbmcpO1xuICAgIH07XG4gICAgLy8kc2NvcGUuaXRlbXMgaXMgYW4gYXJyYXkgb2Ygb2JqZWN0cyBmcm9tIGxvY2FsU3RvcmFnZVxuICAgICRzY29wZS5pdGVtcyA9IENhcnRGYWN0b3J5LmdldENhcnQoKTtcblxuICAgICRzY29wZS5yZW1vdmVJdGVtID0gZnVuY3Rpb24gKGluZGV4KXtcbiAgICAgICAgQ2FydEZhY3RvcnkuZGVsZXRlSXRlbSgkc2NvcGUuaXRlbXNbaW5kZXhdLm5hbWUpO1xuICAgICAgICAkc2NvcGUuaXRlbXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsZWFyQ2FydCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2hlbGxvIGNhcnQnKTtcbiAgICAgICAgQ2FydEZhY3RvcnkuY2xlYXJBbGxpbkNhcnQoKTtcbiAgICAgICAgJHNjb3BlLml0ZW1zID0gQ2FydEZhY3RvcnkuZ2V0Q2FydCgpO1xuICAgICAgICBcbiAgICB9O1xuXG4vLyB1c2UgcmVkdWNlXG4gICAgJHNjb3BlLnRvdGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0b3RhbCA9IDA7XG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuaXRlbXMsIGZ1bmN0aW9uKGJsZW5kKSB7XG4gICAgICAgICAgICB0b3RhbCArPSBibGVuZC5xdWFudGl0eSAqIGJsZW5kLnByaWNlO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRvdGFsO1xuICAgIH07XG5cblxuICAgICRzY29wZS5jaGVja291dCA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwib3JkZXIgaXMgXCIsIG9yZGVyKVxuICAgICAgICBpZighQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHJldHVybiAkc3RhdGUuZ28oJ2xvZ2luJyk7XG5cbiAgICAgICAgdmFyIHVzZXJJZFByb21pc2UgPSBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBpcyB1c2VyIGxvZ2dlZCBpbiBmcm9tIGNoZWNrb3V0JywgdXNlcilcbiAgICAgICAgICAgIHJldHVybiB1c2VyLl9pZDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFyIGZvcm1hdHRlZE9iaiA9IG9yZGVyLm1hcChcbiAgICAgICAgICAgIGZ1bmN0aW9uKG9iail7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHt0eXBlb2ZibGVuZDogb2JqLl9pZCwgcXVhbnRpdHk6IG9iai5xdWFudGl0eSwgbmFtZTogb2JqLm5hbWV9O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgICAgICBvcmRlciA9IGZvcm1hdHRlZE9iajtcbiAgICBcbiAgICAgICAgdmFyIHRvU3VibWl0ID0ge2JsZW5kOiBvcmRlciwgc3RhdHVzOiBcImNyZWF0ZWRcIn1cbiAgICAgICAgY29uc29sZS5sb2codG9TdWJtaXQpO1xuICAgICAgICBcbiAgICAgICAgJHEuYWxsKFtPcmRlcnNGYWN0b3J5LmNyZWF0ZU9yZGVyKHRvU3VibWl0KSwgdXNlcklkUHJvbWlzZV0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICAgICB2YXIgY3JlYXRlZE9yZGVyID0gcmVzdWx0c1swXVxuICAgICAgICAgICAgY29uc29sZS5sb2coJ3RoaXMgaXMgY3JlYXRlZE9yZGVyJywgY3JlYXRlZE9yZGVyKVxuICAgICAgICAgICAgdmFyIHVzZXJJZCA9IHJlc3VsdHNbMV1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHVzZXJJZCcsIHVzZXJJZCkgICAgICAgICAgICBcbiAgICAgICAgICAgIENhcnRGYWN0b3J5LmNsZWFyQWxsaW5DYXJ0KClcbiAgICAgICAgICAgICRzY29wZS5pdGVtcyA9IENhcnRGYWN0b3J5LmdldENhcnQoKVxuICAgICAgICAgICAgcmV0dXJuIFVzZXJGYWN0b3J5LnB1dE9yZGVyT25Vc2VyKHVzZXJJZCwgY3JlYXRlZE9yZGVyLl9pZClcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ29yZGVycycpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goY29uc29sZS5lcnJvcik7XG5cbiAgICB9O1xufSk7IiwiKGZ1bmN0aW9uICgpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ1NvY2tldCcsIGZ1bmN0aW9uICgkbG9jYXRpb24pIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbiAoY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0aGlzIGlzIHRoZSByZXNwb25zZSBmcm9tIGxvZ2luJywgcmVzcG9uc2UpXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndGhpcyBjYWxscyB0aGUgb25TdWNjZXNzZnVsTG9naW4gZnVuY3Rpb24nKVxuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICAgIHVybDogJy8nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvaG9tZS5odG1sJ1xuICAgIH0pO1xufSk7XG5cbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgJHNjb3BlLnNlbmRMb2dpbiA9IGZ1bmN0aW9uIChsb2dpbkluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4vKmlmIHRoZSB1c2VyIG5lZWRzIHRvIGNoYW5nZSB0aGVpciBwYXNzd29yZCB0aGV5IHdpbGwgYmUgcmVkaXJlY3RlZCB0byB0aGUgXCJyZXNldCBwYXNzd29yZFwiIHZpZXcgb25jZSB0aGV5IGxvZyBpbi5cbk90aGVyd2lzZSwgdGhleSB3aWxsIGJlIHJlZGlyZWN0ZWQgdG8gdGhlIFwiaG9tZVwiIHZpZXcgb25jZSB0aGV5IGxvZyBpbi4qL1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmxvZ2luKGxvZ2luSW5mbylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIGlmKHVzZXIuY2hhbmdlcGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3Jlc2V0Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5yZXNldHBhc3N3b3JkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ3Jlc2V0Jyk7XG4gICAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW5zT25seScsIHtcbiAgICAgICAgdXJsOiAnL2FkbWlucy1hcmVhJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8aW1nIG5nLXJlcGVhdD1cIml0ZW0gaW4gc3Rhc2hcIiB3aWR0aD1cIjMwMFwiIG5nLXNyYz1cInt7IGl0ZW0gfX1cIiAvPicsXG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUsIFNlY3JldFN0YXNoKSB7XG4gICAgICAgICAgICBTZWNyZXRTdGFzaC5nZXRTdGFzaCgpLnRoZW4oZnVuY3Rpb24gKHN0YXNoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnN0YXNoID0gc3Rhc2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBkYXRhLmF1dGhlbnRpY2F0ZSBpcyByZWFkIGJ5IGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAgIC8vIHRoYXQgY29udHJvbHMgYWNjZXNzIHRvIHRoaXMgc3RhdGUuIFJlZmVyIHRvIGFwcC5qcy5cbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgYXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdTZWNyZXRTdGFzaCcsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgdmFyIGdldFN0YXNoID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL21lbWJlcnMvc2VjcmV0LXN0YXNoJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0U3Rhc2g6IGdldFN0YXNoXG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqYWJvdXQqIHN0YXRlLlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtaWNyb3MnLCB7XG4gICAgICAgIHVybDogJy9taWNyb3MnLFxuICAgICAgICBjb250cm9sbGVyOiAnTWljcm9zQ29udHJvbGxlcicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbWljcm9zL21pY3Jvcy5odG1sJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ01pY3Jvc0NvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBNaWNyb3NGYWN0b3J5LCBBdXRoU2VydmljZSkge1xuXG4gICAgLy8gJHNjb3BlLm1pY3JvcztcbiAgICAvLyAkc2NvcGUuaW1hZ2U7XG4gICAgJHNjb3BlLndoaWNoTmFtZSA9IG51bGw7XG5cbiAgICAkc2NvcGUubGV2ZWxzID0gW1xuICAgICAgICAnbWlsZCcsXG4gICAgICAgICdtZWRpdW0nLFxuICAgICAgICAnbWVkaXVtLXNwaWN5JyxcbiAgICAgICAgJ3NwaWN5J1xuICAgIF07XG5cbiAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uIChjdXJyVXNlcil7XG4gICAgICAgICAgICAkc2NvcGUuaXNBZG1pbiA9IGN1cnJVc2VyLmFkbWluO1xuICAgIH0pO1xuXG4gICAgJHNjb3BlLnNob3dBbGxNaWNyb3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIE1pY3Jvc0ZhY3RvcnkuZ2V0QWxsTWljcm9zKCkudGhlbihmdW5jdGlvbiAobWljcm9zKSB7XG4gICAgICAgICAgICAkc2NvcGUubWljcm9zID0gbWljcm9zO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5zaG93TWljcm9CeUlkID0gZnVuY3Rpb24obWljcm9pZCkge1xuICAgICAgICBNaWNyb3NGYWN0b3J5LmdldE1pY3JvQnlJZChtaWNyb2lkKS50aGVuKGZ1bmN0aW9uIChtaWNybyl7XG4gICAgICAgICAgICAkc2NvcGUubWljcm9zID0gW21pY3JvXTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUuc2hvd01pY3JvQnlOYW1lID0gZnVuY3Rpb24obWljcm9uYW1lKSB7XG4gICAgICAgIE1pY3Jvc0ZhY3RvcnkuZ2V0TWljcm9CeU5hbWUobWljcm9uYW1lKS50aGVuKGZ1bmN0aW9uIChtaWNybyl7XG4gICAgICAgICAgICAkc2NvcGUubWljcm9zID0gW21pY3JvXTtcbiAgICAgICAgICAgICRzY29wZS5pbWFnZSA9IG1pY3JvLmltYWdlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNob3dNaWNyb3NCeVNwaWNlID0gZnVuY3Rpb24gKHNwaWNlbGV2ZWwpIHtcbiAgICAgICAgTWljcm9zRmFjdG9yeS5nZXRNaWNyb3NCeVNwaWNlKHNwaWNlbGV2ZWwpLnRoZW4oZnVuY3Rpb24gKG1pY3Jvcyl7XG4gICAgICAgICAgICAkc2NvcGUubWljcm9zID0gbWljcm9zO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7Y29uc29sZS5sb2coZXJyKTt9KTtcbiAgICB9O1xuICAgICRzY29wZS5hZGRNaWNybyA9IGZ1bmN0aW9uIChtaWNybykge1xuICAgICAgICBjb25zb2xlLmxvZyhcImluIGFkZCBtaWNyb1wiKTtcbiAgICAgICAgTWljcm9zRmFjdG9yeS5jcmVhdGVNaWNybyhtaWNybykudGhlbihmdW5jdGlvbiAobmV3TWljcm8pe1xuICAgICAgICAgICAgJHNjb3BlLm5ld01pY3JvID0ge1xuICAgICAgICAgICAgICAgIG5hbWU6IG51bGwsXG4gICAgICAgICAgICAgICAgc3BpY2U6IG51bGwsXG4gICAgICAgICAgICAgICAgcHJpY2U6IG51bGwsXG4gICAgICAgICAgICAgICAgZGVzY3JpcHRpb246IG51bGwsXG4gICAgICAgICAgICAgICAgaW1hZ2U6IG51bGwsXG4gICAgICAgICAgICAgICAgaW52ZW50b3J5OiBudWxsXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5kZWxldGVNaWNybyA9IGZ1bmN0aW9uIChpZCl7XG4gICAgICAgIE1pY3Jvc0ZhY3RvcnkuZGVsZXRlTWljcm9CeUlkKGlkKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgXG4gICAgJHNjb3BlLnNob3dBbGxNaWNyb3MoKTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgIC8vIFJlZ2lzdGVyIG91ciAqb3JkZXJzKiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnb3JkZXJzJywge1xuICAgICAgICB1cmw6ICcvb3JkZXJzJyxcbiAgICAgICAgY29udHJvbGxlcjogJ09yZGVyc0NvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL29yZGVycy9vcmRlcnMuaHRtbCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdPcmRlcnNDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgT3JkZXJzRmFjdG9yeSwgQmxlbmRzRmFjdG9yeSl7XG5cblx0JHNjb3BlLmFsbE9yZGVycyA9IG51bGw7XG5cdCRzY29wZS5taWNyb05hbWUgPSBudWxsO1xuXHQkc2NvcGUucmFuZG9tTWljcm8gPSBudWxsO1xuXHQkc2NvcGUucmVjb21tZW5kZWRCbGVuZCA9IG51bGw7XG5cdCRzY29wZS5vcmRlcklkcyA9IFtdO1xuXHQvLyAkc2NvcGUuc2hvd1JlY29tbWVuZGF0aW9uID0gZmFsc2U7XG5cblx0T3JkZXJzRmFjdG9yeS5nZXRBbGxPcmRlcnMoKS50aGVuKGZ1bmN0aW9uIChvcmRlcnMpIHtcblx0XHQkc2NvcGUuYWxsT3JkZXJzID0gb3JkZXJzO1xuXHRcdGlmKG9yZGVycy5sZW5ndGgpIHsgXG5cdFx0XHQvLyAkc2NvcGUuc2hvd1JlY29tbWVuZGF0aW9uID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdCRzY29wZS5zaG93T3JkZXJzID0gZnVuY3Rpb24gKCkge1xuXHRcdE9yZGVyc0ZhY3RvcnkuZ2V0QWxsT3JkZXJzKCkudGhlbihmdW5jdGlvbiAob3JkZXJzKSB7XG5cdFx0XHRjb25zb2xlLmxvZygnb3JkZXJzIGFyZ3VtZW50Jywgb3JkZXJzKTtcblx0XHRcdCRzY29wZS5vcmRlcklkcyA9IG9yZGVycy5tYXAoZnVuY3Rpb24ob2JqKSB7IHJldHVybiBvYmouX2lkIH0pO1xuXHRcdFx0Y29uc29sZS5sb2coJ3RoZXNlIGFyZSBvcmRlcklkcycsICRzY29wZS5vcmRlcklkcylcblx0XHRcdCRzY29wZS5vcmRlcklkcy5mb3JFYWNoKGZ1bmN0aW9uKG9yZGVyaWQpe1xuXG5cdFx0XHRcdE9yZGVyc0ZhY3RvcnkuZ2V0T3JkZXJCeUlkKG9yZGVyaWQpLnRoZW4oZnVuY3Rpb24gKG9yZGVyKSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ3RoZSBvcmRlcjonLCBvcmRlcik7XG5cdFx0XHRcdFx0JHNjb3BlLm9yZGVyID0gb3JkZXI7XG5cdFx0XHRcdFx0QmxlbmRzRmFjdG9yeS5nZXRCbGVuZEJ5SWQob3JkZXIuYmxlbmRbMF0udHlwZW9mYmxlbmQpXG5cdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKGJsZW5kKSB7XG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCd0aGUgbWljcm8gYXJyYXknLCBibGVuZC5taWNyb3MpO1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQkc2NvcGUubWljcm9OYW1lID0gYmxlbmQubWljcm9zLm1hcChmdW5jdGlvbihvYmope1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb2JqLm5hbWU7XG5cdFx0XHRcdFx0XHR9KVxuXG5cdFx0XHRcdFx0XHQkc2NvcGUucmFuZG9tTWljcm8gPSAkc2NvcGUubWljcm9OYW1lW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUubWljcm9OYW1lLmxlbmd0aCldO1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coJ3RoaXMgaXMgYmxlbmQgb3JkZXJlZCcsIGJsZW5kKVxuXG5cdFx0XHRcdFx0XHRCbGVuZHNGYWN0b3J5LmdldEFsbEJsZW5kcygpLnRoZW4oZnVuY3Rpb24gKGJsZW5kcykge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygnYWxsIHRoZSBibGVuZHMnLCBibGVuZHMpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0JHNjb3BlLm1hdGNoZWRCbGVuZHMgPSBibGVuZHMuZmlsdGVyKGZ1bmN0aW9uKGJsZW5kKXtcblx0XHRcdFx0XHRcdFx0XHR2YXIgaGFzUmFuZG9tTWljcm8gPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRibGVuZC5taWNyb3MuZm9yRWFjaChmdW5jdGlvbihtaWNybyl7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZihtaWNyby5uYW1lID09PSAkc2NvcGUucmFuZG9tTWljcm8pe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRoYXNSYW5kb21NaWNybyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaGFzUmFuZG9tTWljcm9cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdFx0JHNjb3BlLnJlY29tbWVuZGVkQmxlbmQgPSAkc2NvcGUubWF0Y2hlZEJsZW5kc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm1hdGNoZWRCbGVuZHMubGVuZ3RoKV1cblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fSk7XG5cdFx0XHR9KVxuXHRcdFx0JHNjb3BlLm9yZGVycyA9IG9yZGVycztcblx0XHRcdC8vICRzY29wZS5zaG93UmVjb21tZW5kYXRpb24gPSB0cnVlO1xuXHRcdH0pO1xuXHR9O1xuXG5cdCRzY29wZS5zaG93T3JkZXJzQnlJZCA9IGZ1bmN0aW9uIChvcmRlcmlkKSB7XG5cdFx0T3JkZXJzRmFjdG9yeS5nZXRPcmRlckJ5SWQob3JkZXJpZCkudGhlbihmdW5jdGlvbiAob3JkZXIpIHtcblx0XHRcdCRzY29wZS5vcmRlcnMgPSBvcmRlcjtcblx0XHR9KVxuXG5cdH07XG5cblx0JHNjb3BlLmxvYWRPcmRlclRvRWRpdCA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdE9yZGVyc0ZhY3RvcnkuZ2V0T3JkZXJCeUlkKGlkKS50aGVuKGZ1bmN0aW9uIChvcmRlcikge1xuXHRcdFx0JHNjb3BlLmVkaXRlZE9yZGVyID0gb3JkZXI7XG5cdFx0fSk7XG5cdH07XG5cblx0JHNjb3BlLmVkaXRPcmRlciA9IGZ1bmN0aW9uIChpZCwgb3JkZXIpIHtcblx0XHQvL2NvbnNvbGUubG9nKCdlZGl0T3JkZXInLCBvcmRlci5zdGF0dXMpO1xuXHRcdE9yZGVyc0ZhY3RvcnkuZWRpdE9yZGVyQnlJZChpZCwgb3JkZXIuc3RhdHVzKS50aGVuKGZ1bmN0aW9uIChvcmRlcikge1xuXHRcdFx0Ly9jb25zb2xlLmxvZygnYWZ0ZXIgZWRpdGluZyAnLCBvcmRlcik7XG5cdFx0XHQkc2NvcGUuZWRpdGVkT3JkZXIgPSBvcmRlcjtcblx0XHRcdFxuXHRcdH0pO1xuXHR9O1xuXG5cdCRzY29wZS5kZWxldGVPcmRlciA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdE9yZGVyc0ZhY3RvcnkuZGVsZXRlT3JkZXJCeUlkKGlkKS50aGVuKGZ1bmN0aW9uKCl7XG5cblx0ICAgICAgICBPcmRlcnNGYWN0b3J5LmdldEFsbE9yZGVycygpLnRoZW4oZnVuY3Rpb24gKG9yZGVycykge1xuXHRcdFx0XHQkc2NvcGUuYWxsT3JkZXJzID0gb3JkZXJzO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fSk7XG5cdH07XG5cblx0JHNjb3BlLnNob3dPcmRlcnMoKTtcbn0pO1xuXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3Jlc2V0Jywge1xuICAgICAgICB1cmw6ICcvcmVzZXQvOmlkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9yZXNldC9yZXNldC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1Jlc2V0UGFzc3dvcmRDdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1Jlc2V0UGFzc3dvcmRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsIFVzZXJGYWN0b3J5LCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5yZXNldCA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbi8qQnkgc3VibWl0dGluZyB0aGUgZm9ybSwgdXNlcidzIHBhc3N3b3JkIHdpbGwgYmUgY2hhbmdlZCBpbiB0aGUgZGF0YWJhc2UuXG5UaGUgdXNlcidzIGNoYW5nZVBhc3N3b3JkU3RhdHVzIGluIHRoZSBkYXRhYmFzZSB3aWxsIGFsc28gYmUgY2hhbmdlZCB0byBmYWxzZSBvbmNlIHRoZSBwYXNzd29yZCBjaGFuZ2UgaXMgbWFkZS4qL1xuXG4gICAgJHNjb3BlLnJlc2V0VXNlclBhc3N3b3JkID0gZnVuY3Rpb24gKGluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuICAgICAgICBcbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgVXNlckZhY3RvcnkucmVzZXRVc2VyUGFzc3dvcmQodXNlci5faWQsIGluZm8pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCByZXNldCBjcmVkZW50aWFscy4nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2lnbnVwL3NpZ251cC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1NpZ251cEN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2lnbnVwQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIFVzZXJGYWN0b3J5LCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAkc2NvcGUuc2lnbnVwID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5jcmVhdGVVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIFVzZXJGYWN0b3J5LmNyZWF0ZVVzZXIodXNlcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gQXV0aFNlcnZpY2UubG9naW4odXNlcik7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBzaWdudXAgY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0dXRvcmlhbCcsIHtcbiAgICAgICAgdXJsOiAnL3R1dG9yaWFsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ1R1dG9yaWFsQ3RybCcsXG4gICAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICAgIHR1dG9yaWFsSW5mbzogZnVuY3Rpb24gKFR1dG9yaWFsRmFjdG9yeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBUdXRvcmlhbEZhY3RvcnkuZ2V0VHV0b3JpYWxWaWRlb3MoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1R1dG9yaWFsRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0VHV0b3JpYWxWaWRlb3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHV0b3JpYWwvdmlkZW9zJykudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdUdXRvcmlhbEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCB0dXRvcmlhbEluZm8pIHtcblxuICAgICRzY29wZS5zZWN0aW9ucyA9IHR1dG9yaWFsSW5mby5zZWN0aW9ucztcbiAgICAkc2NvcGUudmlkZW9zID0gXy5ncm91cEJ5KHR1dG9yaWFsSW5mby52aWRlb3MsICdzZWN0aW9uJyk7XG5cbiAgICAkc2NvcGUuY3VycmVudFNlY3Rpb24gPSB7IHNlY3Rpb246IG51bGwgfTtcblxuICAgICRzY29wZS5jb2xvcnMgPSBbXG4gICAgICAgICdyZ2JhKDM0LCAxMDcsIDI1NSwgMC4xMCknLFxuICAgICAgICAncmdiYSgyMzgsIDI1NSwgNjgsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjM0LCA1MSwgMjU1LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDI1NSwgMTkzLCA3MywgMC4xMSknLFxuICAgICAgICAncmdiYSgyMiwgMjU1LCAxLCAwLjExKSdcbiAgICBdO1xuXG4gICAgJHNjb3BlLmdldFZpZGVvc0J5U2VjdGlvbiA9IGZ1bmN0aW9uIChzZWN0aW9uLCB2aWRlb3MpIHtcbiAgICAgICAgcmV0dXJuIHZpZGVvcy5maWx0ZXIoZnVuY3Rpb24gKHZpZGVvKSB7XG4gICAgICAgICAgICByZXR1cm4gdmlkZW8uc2VjdGlvbiA9PT0gc2VjdGlvbjtcbiAgICAgICAgfSk7XG4gICAgfTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0JsZW5kc0ZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGdldEFsbEJsZW5kczogZnVuY3Rpb24gKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9ibGVuZHNcIilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHZhciBmaWx0ZXJlZEJsZW5kcyA9IHJlc3BvbnNlLmRhdGEuZmlsdGVyKGZ1bmN0aW9uKGJsZW5kKXtcbiAgICAgICAgICAgICBcdHZhciBpbnN0b2NrID0gdHJ1ZTsgXG4gICAgICAgICAgICAgICAgYmxlbmQubWljcm9zLmZvckVhY2goZnVuY3Rpb24obWljcm8pe1xuICAgICAgICAgICAgICAgICAgICBpZiAobWljcm8uaW52ZW50b3J5ID09PSAwKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RvY2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnN0b2NrOyBcbiAgICAgICAgICAgIH0pO1xuXG5cdFx0XHRcdHJldHVybiBmaWx0ZXJlZEJsZW5kcztcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0QmxlbmRCeUlkOiBmdW5jdGlvbiAoYmxlbmRpZCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9ibGVuZHMvXCIgKyBibGVuZGlkKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldEJsZW5kQnlOYW1lOiBmdW5jdGlvbiAoYmxlbmRuYW1lKXsgLy8gZG9uJ3QgaGF2ZSB0aGlzIHJvdXRlIHlldFxuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvYmxlbmRzL25hbWUvXCIgKyBibGVuZG5hbWUpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y3JlYXRlQmxlbmQ6IGZ1bmN0aW9uIChibGVuZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL2JsZW5kc1wiLCBibGVuZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZWRpdEJsZW5kQnlJZDogZnVuY3Rpb24gKGlkLCBibGVuZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLnB1dCgnL2FwaS9ibGVuZHMvJyArIGlkLCBibGVuZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZGVsZXRlQmxlbmRCeUlkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdHJldHVybiAkaHR0cC5kZWxldGUoJy9hcGkvYmxlbmRzLycgKyBpZCk7XG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ0NhcnRGYWN0b3J5JywgZnVuY3Rpb24gKCRyb290U2NvcGUpe1xuICByZXR1cm4ge1xuICAgIC8vIGdldEl0ZW06IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAvLyAgIHJldHVybiBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSkpO1xuICAgIC8vIH0sXG5cbiAgICBkZWxldGVJdGVtOiBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIH0sXG5cbiAgICBnZXRDYXJ0OiBmdW5jdGlvbigpe1xuICAgICAgdmFyIGFyY2hpdmUgPSBbXSxcbiAgICAgICAgICBrZXlzID0gT2JqZWN0LmtleXMobG9jYWxTdG9yYWdlKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhcImtleXMgaSA9IFwiLCB0eXBlb2YgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5c1tpXSkpXG4gICAgICAgIGlmIChrZXlzW2ldID09PSBcImRlYnVnXCIpe1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhciB0b09iaiA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5c1tpXSkpO1xuICAgICAgICAgIGFyY2hpdmUucHVzaCh0b09iaik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhcmNoaXZlO1xuICAgIH0sXG5cbiAgICBzYXZlQ2FydDogZnVuY3Rpb24gKG5hbWUsIGluZm8pIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKG5hbWUsIEpTT04uc3RyaW5naWZ5KGluZm8pKTtcbiAgICB9LFxuXG4gICAgY2xlYXJBbGxpbkNhcnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5jbGVhcigpO1xuICAgIH1cblxuICB9O1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7IiwiYXBwLmZhY3RvcnkoJ01pY3Jvc0ZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGdldEFsbE1pY3JvczogZnVuY3Rpb24gKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9taWNyb3NcIilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRNaWNyb0J5SWQ6IGZ1bmN0aW9uIChtaWNyb2lkKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL21pY3Jvcy9cIiArIG1pY3JvaWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0TWljcm9CeU5hbWU6IGZ1bmN0aW9uIChtaWNyb25hbWUpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvbWljcm9zL25hbWUvXCIgKyBtaWNyb25hbWUpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0TWljcm9zQnlTcGljZTogZnVuY3Rpb24gKHNwaWNlbGV2ZWwpe1xuXHRcdFx0cmV0dXJuICRodHRwLmdldChcIi9hcGkvbWljcm9zL3NwaWNlL1wiICsgc3BpY2VsZXZlbClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjcmVhdGVNaWNybzogZnVuY3Rpb24gKG1pY3JvKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucG9zdChcIi9hcGkvbWljcm9zXCIsIG1pY3JvKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRlZGl0TWljcm9CeUlkOiBmdW5jdGlvbiAoaWQsIG1pY3JvKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL21pY3Jvcy8nICsgaWQsIG1pY3JvKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRkZWxldGVNaWNyb0J5SWQ6IGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9taWNyb3MvJyArIGlkKTtcblx0XHR9LFxuXHR9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ09yZGVyc0ZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdGdldEFsbE9yZGVyczogZnVuY3Rpb24gKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9vcmRlcnNcIilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRnZXRPcmRlckJ5SWQ6IGZ1bmN0aW9uIChvcmRlcmlkKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL29yZGVycy9cIiArIG9yZGVyaWQpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Y3JlYXRlT3JkZXI6IGZ1bmN0aW9uIChvcmRlcikge1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoXCIvYXBpL29yZGVyc1wiLCBvcmRlcilcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZWRpdE9yZGVyQnlJZDogZnVuY3Rpb24gKGlkLCBvcmRlcikge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImluIHRoZSBmYWN0b3J5IG9yZGVyIGlzIFwiLCBvcmRlcik7XG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy8nICsgaWQsIHtcIl9pZFwiOiBvcmRlcn0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGRlbGV0ZU9yZGVyQnlJZDogZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZGVsZXRlKCcvYXBpL29yZGVycy8nICsgaWQpO1xuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCBtaWNyb2dyZWVucyBsb3ZlciEgQnV5IHNvbWV0aGluZyBvciBsZWF2ZS4nLFxuICAgICAgICAnQnJvY2NvbGksIHlvdSBjYW5cXCd0IHNpdCB3aXRoIHVzLicsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLiBJIGFtIGEgc3VwZXJpb3IgdmVnZXRhYmxlLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEgVGhlIHN1biBpcyBtYWtpbmcgbWUgYWdlLicsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciB2ZWdnaWUsIGV4Y2VwdCB0aGF0IEkgYW0gYmV0dGVyLiA6KScsXG4gICAgICAgICdST0FSLicsXG4gICAgICAgICfnp4Hjga/jgYrjgYTjgZfjgYRtaWNyb2dyZWVu44Gn44GZ44CC56eB44KS6aOf44G544G+44GZ44CCJyxcbiAgICBdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ3JlZXRpbmdzOiBncmVldGluZ3MsXG4gICAgICAgIGdldFJhbmRvbUdyZWV0aW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0UmFuZG9tRnJvbUFycmF5KGdyZWV0aW5ncyk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTtcbiIsImFwcC5mYWN0b3J5KCdSZXZpZXdzRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCl7XG5cdHJldHVybiB7XG5cdFx0Z2V0QWxsUmV2aWV3czogZnVuY3Rpb24gKCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9yZXZpZXdzXCIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0Z2V0UmV2aWV3QnlJZDogZnVuY3Rpb24gKHJldmlld2lkKXtcblx0XHRcdHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL3Jldmlld3MvXCIgKyByZXZpZXdpZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjcmVhdGVSZXZpZXc6IGZ1bmN0aW9uIChyZXZpZXcpIHtcblx0XHRcdHJldHVybiAkaHR0cC5wb3N0KFwiL2FwaS9yZXZpZXdzXCIsIHJldmlldylcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0ZWRpdFJldmlld0J5SWQ6IGZ1bmN0aW9uIChpZCwgcmV2aWV3KSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL3Jldmlld3MvJyArIGlkLCByZXZpZXcpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGRlbGV0ZVJldmlld0J5SWQ6IGZ1bmN0aW9uIChpZCkge1xuXHRcdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9yZXZpZXdzLycgKyBpZCk7XG5cdFx0fSxcblx0fTtcbn0pOyIsImFwcC5mYWN0b3J5KCdVc2VyRmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCl7XG4gIHJldHVybiB7XG4gICAgZ2V0QWxsVXNlcnM6IGZ1bmN0aW9uICgpe1xuICAgICAgcmV0dXJuICRodHRwLmdldChcIi91c2Vyc1wiKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KTtcbiAgICB9LFxuICAgIGdldFVzZXJCeUlkOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoXCIvdXNlcnMvXCIgKyBpZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0VXNlckJ5RW1haWw6IGZ1bmN0aW9uIChlbWFpbCkge1xuICAgICAgcmV0dXJuICRodHRwLmdldCgnL3VzZXJzL2VtYWlsLycgKyBlbWFpbClcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgY3JlYXRlVXNlcjogZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KFwiL3NpZ251cFwiLCB1c2VyKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBwdXRPcmRlck9uVXNlcjogZnVuY3Rpb24gKGlkLCBpbmZvKSB7XG4gICAgICByZXR1cm4gJGh0dHAucHV0KCcvb3JkZXJvbnVzZXIvJyArIGlkLCB7X2lkOiBpbmZvfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgcHJvbW90ZVVzZXJTdGF0dXM6IGZ1bmN0aW9uIChpZCwgaW5mbykge1xuICAgICAgcmV0dXJuICRodHRwLnB1dCgnL3Byb21vdGUvJyArIGlkLCBpbmZvKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgICAgfSlcbiAgICB9LFxuICAgIHJlc2V0VXNlclBhc3N3b3JkOiBmdW5jdGlvbiAoaWQsIGluZm8pIHtcbiAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9yZXNldC8nICsgaWQsIGluZm8pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgIH0sXG4gICAgdHJpZ2dlclJlc2V0OiBmdW5jdGlvbiAoZW1haWwsIGluZm8pIHtcbiAgICAgIHJldHVybiAkaHR0cC5wdXQoJy9yZXNldC90cmlnZ2VyLycrZW1haWwsIGluZm8pXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICB9KVxuICAgIH0sXG4gICAgZGVsZXRlVXNlckJ5SWQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuICRodHRwLmRlbGV0ZSgnL2RlbGV0ZS8nICsgaWQpO1xuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsU2VjdGlvbicsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbmFtZTogJ0AnLFxuICAgICAgICAgICAgdmlkZW9zOiAnPScsXG4gICAgICAgICAgICBiYWNrZ3JvdW5kOiAnQCdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uL3R1dG9yaWFsLXNlY3Rpb24uaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5jc3MoeyBiYWNrZ3JvdW5kOiBzY29wZS5iYWNrZ3JvdW5kIH0pO1xuICAgICAgICB9XG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsU2VjdGlvbk1lbnUnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgcmVxdWlyZTogJ25nTW9kZWwnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBzZWN0aW9uczogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cnMsIG5nTW9kZWxDdHJsKSB7XG5cbiAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRTZWN0aW9uID0gc2NvcGUuc2VjdGlvbnNbMF07XG4gICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHNjb3BlLmN1cnJlbnRTZWN0aW9uKTtcblxuICAgICAgICAgICAgc2NvcGUuc2V0U2VjdGlvbiA9IGZ1bmN0aW9uIChzZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuY3VycmVudFNlY3Rpb24gPSBzZWN0aW9uO1xuICAgICAgICAgICAgICAgIG5nTW9kZWxDdHJsLiRzZXRWaWV3VmFsdWUoc2VjdGlvbik7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgndHV0b3JpYWxWaWRlbycsIGZ1bmN0aW9uICgkc2NlKSB7XG5cbiAgICB2YXIgZm9ybVlvdXR1YmVVUkwgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgaWQ7XG4gICAgfTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtdmlkZW8vdHV0b3JpYWwtdmlkZW8uaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB2aWRlbzogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUudHJ1c3RlZFlvdXR1YmVVUkwgPSAkc2NlLnRydXN0QXNSZXNvdXJjZVVybChmb3JtWW91dHViZVVSTChzY29wZS52aWRlby55b3V0dWJlSUQpKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ2JsZW5kJywgZnVuY3Rpb24gKENhcnRGYWN0b3J5LCBCbGVuZHNGYWN0b3J5LCBBdXRoU2VydmljZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9ibGVuZC9ibGVuZC5odG1sJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGJsZW5kOiAnPScsXG4gICAgICAgICAgICBpc05ld0JsZW5kRm9ybU9wZW46ICc9JyxcbiAgICAgICAgICAgIGRlbGV0ZWJsZW5kOiAnJidcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgIFx0c2NvcGUucXVhbnRpdHkgPSAxO1xuICAgICAgICAgIHNjb3BlLmlzQWRtaW4gPSBmYWxzZTsgXG4gICAgICAgICAgc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24oYmxlbmQsIHF1YW50aXR5KSB7XG4gICAgICAgICAgXHR2YXIgYmxlbmRXaXRoUXVhbnRpdHkgPSBibGVuZDtcbiAgICAgICAgICBcdGJsZW5kV2l0aFF1YW50aXR5LnF1YW50aXR5ID0gcXVhbnRpdHk7XG4gICAgICAgICAgXHRjb25zb2xlLmxvZyhcImJsZW5kIHdpdGggcXVhbnRpdHlcIiwgYmxlbmRXaXRoUXVhbnRpdHkpOyBcbiAgICAgICAgICAgIENhcnRGYWN0b3J5LnNhdmVDYXJ0KGJsZW5kLm5hbWUsIGJsZW5kV2l0aFF1YW50aXR5KTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpXG4gICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAodXNlcil7XG4gICAgICAgICAgICBpZiAodXNlcikgc2NvcGUuaXNBZG1pbiA9IHVzZXIuYWRtaW47XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgnZnVsbHN0YWNrTG9nbycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmh0bWwnXG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ21pY3JvJywgZnVuY3Rpb24gKEF1dGhTZXJ2aWNlLCBNaWNyb3NGYWN0b3J5KSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL21pY3JvL21pY3JvLmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgbWljcm86ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgXHQvL2NoZWNrcyBpZiBjdXJyZW50IHVzZXIgaXMgYWRtaW5cbiAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKGN1cnJVc2VyKXtcbiAgICAgICAgICAgICAgICBzY29wZS5pc0FkbWluID0gY3VyclVzZXIuYWRtaW47XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc2NvcGUuaXNDb2xsYXBzZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBzY29wZS5lZGl0TWljcm8gPSBmdW5jdGlvbiAoaW52ZW50b3J5LCBwcmljZSkge1xuICAgICAgICAgICAgICAgIE1pY3Jvc0ZhY3RvcnkuZWRpdE1pY3JvQnlJZChzY29wZS5taWNyby5faWQsIHtpbnZlbnRvcnk6IGludmVudG9yeSwgcHJpY2U6IHByaWNlfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52ZW50b3J5IENoYW5nZWQhJyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG5cdFx0fVxuICAgIH07XG5cbn0pOyIsImFwcC5kaXJlY3RpdmUoJ25hdmJhcicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgQVVUSF9FVkVOVFMsICRzdGF0ZSkge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuXG4gICAgICAgICAgICBzY29wZS5pdGVtcyA9IFtcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnSG9tZScsIHN0YXRlOiAnaG9tZScgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnTWljcm9zJywgc3RhdGU6ICdtaWNyb3MnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0JsZW5kcycsIHN0YXRlOiAnYmxlbmRzJ31cbiAgICAgICAgICAgICAgICAvLyB7IGxhYmVsOiAnVHV0b3JpYWwnLCBzdGF0ZTogJ3R1dG9yaWFsJyB9LFxuICAgICAgICAgICAgICAgIC8vIHsgbGFiZWw6ICdBZG1pbnMgT25seScsIHN0YXRlOiAnYWRtaW4tdXNlcicsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgnb3JkZXInLCBmdW5jdGlvbiAoT3JkZXJzRmFjdG9yeSwgQXV0aFNlcnZpY2UpIHtcblx0cmV0dXJuIHtcblx0XHRyZXN0cmljdDogJ0UnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvb3JkZXJzL29yZGVyLmh0bWwnLFxuXHRcdHNjb3BlOiB7XG5cdFx0XHRvcmRlcjogJz0nLFxuXHRcdFx0ZGVsZXRlb3JkZXI6ICcmJyxcblx0XHRcdGVkaXRvcmRlcjogJyYnXG5cdFx0fSxcblx0XHRsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuXHRcdFx0QXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAoY3VyclVzZXIpe1xuICAgICAgICAgICAgICAgIHNjb3BlLmlzQWRtaW4gPSBjdXJyVXNlci5hZG1pbjtcbiAgICAgICAgICAgIH0pO1xuXG5cdFx0XHRzY29wZS5vcmRlclN0YXR1cyA9IFtcblx0XHRcdFx0J2NyZWF0ZWQnLFxuXHRcdFx0XHQncHJvY2Vzc2luZycsXG5cdFx0XHRcdCdjYW5jZWxsZWQnLFxuXHRcdFx0XHQnY29tcGxldGVkJ1xuXHRcdFx0XTtcblxuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3JhbmRvR3JlZXRpbmcnLCBmdW5jdGlvbiAoUmFuZG9tR3JlZXRpbmdzKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3JhbmRvLWdyZWV0aW5nL3JhbmRvLWdyZWV0aW5nLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLmdyZWV0aW5nID0gUmFuZG9tR3JlZXRpbmdzLmdldFJhbmRvbUdyZWV0aW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdyZXZpZXcnLCBmdW5jdGlvbihSZXZpZXdzRmFjdG9yeSwgQmxlbmRzRmFjdG9yeSwgQXV0aFNlcnZpY2UpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3Jldmlldy9yZXZpZXcuaHRtbCcsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICByZXZpZXc6ICc9JyxcbiAgICAgICAgICAgIGJsZW5kOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUpIHtcblxuICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAoY3VyclVzZXIpe1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXJJZCA9IGN1cnJVc2VyLl9pZDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzY29wZS5zaG93UmV2aWV3cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImJsZW5kIGlzIFwiLCBzY29wZS5ibGVuZCk7XG4gICAgICAgICAgICAgIEJsZW5kc0ZhY3RvcnkuZ2V0QmxlbmRCeUlkKHNjb3BlLmJsZW5kLl9pZCkudGhlbihmdW5jdGlvbihibGVuZCl7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJibGVuZCByZXZpZXdzIGFyZSBcIiwgYmxlbmQpO1xuICAgICAgICAgICAgICAgIHNjb3BlLnJldkFyciA9IGJsZW5kLnJldmlld3M7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcImdvdCByZXZpZXdzIVwiKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBzY29wZS5zaG93UmV2aWV3cygpO1xuXG4gICAgICAgICAgICBzY29wZS5uZXdSZXZpZXcgPSBmdW5jdGlvbihzdGFyLCBjb21tZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld1JldmlldyA9IHtcbiAgICAgICAgICAgICAgICAgICAgcmF0aW5nOiBzdGFyLFxuICAgICAgICAgICAgICAgICAgICBjb21tZW50OiBjb21tZW50LFxuICAgICAgICAgICAgICAgICAgICBibGVuZDogc2NvcGUuYmxlbmQuX2lkLFxuICAgICAgICAgICAgICAgICAgICB1c2VyOiBzY29wZS51c2VySWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFJldmlld3NGYWN0b3J5LmNyZWF0ZVJldmlldyhuZXdSZXZpZXcpLnRoZW4oZnVuY3Rpb24ocmV2aWV3KSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnWUFZWVlZISBORVcgUkVWSUVXIENSRUFURUQhJywgcmV2aWV3Ll9pZCk7XG4gICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgIHNjb3BlLmJsZW5kLnJldmlld3MgPSBzY29wZS5ibGVuZC5yZXZpZXdzLm1hcChmdW5jdGlvbihyZXZpZXcpe3JldHVybiByZXZpZXcuX2lkO30pO1xuICAgICAgICAgICAgICAgICAgc2NvcGUuYmxlbmQucmV2aWV3cy5wdXNoKHJldmlldy5faWQpO1xuICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ3aXRoIG5ldyBpZFwiLCBzY29wZS5ibGVuZCk7XG4gICAgICAgICAgICAgICAgICBCbGVuZHNGYWN0b3J5LmVkaXRCbGVuZEJ5SWQoc2NvcGUuYmxlbmQuX2lkLCB7cmV2aWV3czogc2NvcGUuYmxlbmQucmV2aWV3c30pO1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgIHNjb3BlLnNob3dSZXZpZXdzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9