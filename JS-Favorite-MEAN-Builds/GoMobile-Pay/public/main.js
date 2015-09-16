'use strict';
window.app = angular.module('FullstackGeneratedApp', ['ui.router', 'ui.bootstrap', 'fsaPreBuilt', 'ngStorage']);

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

    // Register our *about* state.
    $stateProvider.state('about', {
        url: '/about',
        controller: 'AboutController',
        templateUrl: 'js/about/about.html'
    });
});

app.controller('AboutController', function ($scope, FullstackPics) {

    // Images of beautiful Fullstack people.
    $scope.images = _.shuffle(FullstackPics);
});
app.config(function ($stateProvider) {

    $stateProvider.state('account', {
        url: '/account',
        templateUrl: 'js/account/account.html',
        controller: 'AccountCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('AccountCtrl', function ($scope, $localStorage, AuthService, AccountFactory, $state) {

    AuthService.getLoggedInUser().then(function (user) {

        console.log('retrieved user,', user);

        AccountFactory.getAccountInfo(user).then(function (account) {
            $scope.user = account;
        });

        console.log('updated user information to be redisplayed,', $scope.user);
    });

    $scope.editAccount = function (property) {
        $localStorage.currentProperty = $scope.user[property];
        AccountFactory.editAccount(property);
    };
});
(function () {

    'use strict';

    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('Socket', function () {
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

        function onSuccessfulLogin(response) {
            var data = response.data;
            Session.create(data.id, data.user);
            // console.log("on succesful login: data,",data)
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
            return data.user;
        }

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

        this.signup = function (signupInfo) {
            return $http.post('/api/register/', { signupInfo: signupInfo }, function (response) {
                console.log('response from signup route', response);
                return response.data;
            });
        };

        this.login = function (credentials) {
            return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function () {
                return $q.reject({ message: 'Invalid login credentials.' });
            });
        };

        this.logout = function () {
            return $http.get('/logout').then(function () {
                Session.destroy();
                $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
            });
        };
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
        templateUrl: 'js/home/home.html',
        controller: 'HomeController'

    });
});

app.controller('HomeController', function ($scope, AuthService, $state) {});
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

app.controller('iframeCtrl', function ($scope, AuthService, $state) {});
app.config(function ($stateProvider) {

    $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'js/login/login.html',
        controller: 'LoginCtrl'
    });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

    $scope.login = {};
    $scope.error = null;

    $scope.sendLogin = function (loginInfo) {

        $scope.error = null;

        AuthService.login(loginInfo).then(function () {
            $state.go('home');
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('membersOnly', {
        url: '/members-area',
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

    $stateProvider.state('signup', {
        url: '/register',
        templateUrl: 'js/signup/signup.html',
        controller: 'SignUpCtrl'
    });
});

app.controller('SignUpCtrl', function ($scope, AuthService, $state, $http) {

    console.log('you\'ve hit the signupCtrl');
    $scope.error = null;

    $scope.sendLogin = function (signupInfo) {

        $scope.error = null;

        console.log('signup object,', signupInfo);

        console.log('AuthService', AuthService);

        // authFCT.postSignUpForm(signupInfo)

        AuthService.signup(signupInfo).then(function (user) {

            $state.go('acccount');
        })['catch'](function () {
            $scope.error = 'Invalid login credentials.';
        });
    };

    $http.get('/api/register/mock-hash').then(function (response) {

        return response.data;
    });
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
app.factory('AccountFactory', function ($http, $state, AuthService, Session, $localStorage) {

    var getAccountInfo = function getAccountInfo(user) {
        return $http.get('/api/account/' + user.tchoPayId).then(function (response) {
            console.log(response.data);
            return response.data;
        });
    };

    var editAccount = function editAccount(property) {
        if (property === 'merchantId') $state.go('merchantId-edit');
        if (property === 'email') $state.go('email-edit');
        if (property === 'phone') $state.go('phone-edit');
        if (property === 'description') $state.go('description-edit');
        if (property === 'callbackUrl') $state.go('callbackUrl-edit');
        if (property === 'sellerAccount') $state.go('sellerAccount-edit');
        if (property === 'password') $state.go('password-edit');
        if (property === 'webAppDomain') $state.go('webAppDomain-edit');
    };

    var cancelEdit = function cancelEdit() {
        delete $localStorage.currentProperty;
        $state.go('account');
        return;
    };

    var submitEditCard = function submitEditCard(user, scope) {

        var loginUser = {
            email: user.email,
            password: user.password
        };

        //if user.property === "email" || user.property === "password"
        //log out event
        //state change to login

        return $http.put('/api/account/edit', user).then(function (response) {

            if (response.data.error === 'invalid password') {
                //set some variable to true, link it to ng-show of password alert element
                //state.go same page
                scope.failPass = true;
                $state.go(user.property + '-edit');
                return;
            } else {

                Session.user = response.data;
                delete $localStorage.currentProperty;

                if (user.property === 'email' || user.property === 'password') {
                    AuthService.logout().then(function () {

                        $state.go('login');
                        return;
                    });
                } else {

                    $state.go('account');
                    return;
                }
            }
        })

        //once this call to route and save has occured
        //route returns new user object
        //initiate new Log in event to persist updated user info on session
        //state.go("account")
        ;
    };

    return {
        getAccountInfo: getAccountInfo,
        editAccount: editAccount,
        submitEditCard: submitEditCard,
        cancelEdit: cancelEdit
    };
});
app.factory('FullstackPics', function () {
    return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large'];
});
app.factory('RandomGreetings', function () {

    var getRandomFromArray = function getRandomFromArray(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    };

    var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.'];

    return {
        greetings: greetings,
        getRandomGreeting: function getRandomGreeting() {
            return getRandomFromArray(greetings);
        }
    };
});

app.factory('CheckoutFactory', function ($http, $state, AuthService, Session, $localStorage) {

    var submitTransaction = function submitTransaction(transactionObject, browserDomain) {
        return $http.post('/api/checkout/validate', {
            transactionObject: transactionObject,
            browserDomain: browserDomain

        }).then(function (response) {
            //TO DO
            return response.data;
        });
    };

    return {
        submitTransaction: submitTransaction
    };
});
app.config(function ($stateProvider) {

    $stateProvider.state('callbackUrl-edit', {
        url: '/callbackUrl-edit',
        templateUrl: 'js/edit/callbackUrl-edit/callbackUrl-edit.html',
        controller: 'CallbackUrlEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('CallbackUrlEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;

        //UNIQUE PROPERTY TO EDIT
        $scope.user.callbackUrl;
        $scope.user.property = 'callbackUrl';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('description-edit', {
        url: '/description-edit',
        templateUrl: 'js/edit/description-edit/description-edit.html',
        controller: 'DescriptionEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('DescriptionEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;

        //UNIQUE PROPERTY TO EDIT
        $scope.user.description;
        $scope.user.property = 'description';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('email-edit', {
        url: '/email-edit',
        templateUrl: 'js/edit/email-edit/email-edit.html',
        controller: 'EmailEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('EmailEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;

        //populated by edit form
        $scope.user.password;
        $scope.user.email;
        $scope.user.property = 'email';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('merchantId-edit', {
        url: '/merchantId-edit',
        templateUrl: 'js/edit/merchantId-edit/merchantId-edit.html',
        controller: 'MerchantIdEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('MerchantIdEditCtrl', function ($scope, AuthService, $state, $localStorage, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;

        //UNIQUE PROPERTY TO EDIT
        $scope.user.merchantId;
        $scope.user.property = 'merchantId';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('password-edit', {
        url: '/password-edit',
        templateUrl: 'js/edit/password-edit/password-edit.html',
        controller: 'passwordEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('passwordEditCtrl', function ($scope, Session, AuthService, $state, $localStorage, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        console.log($scope.registrationForm);

        //to display in edit form
        $scope.currentProperty = Session.user.email;
        $scope.passCheck = false;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;
        $scope.user.newPasswordOne;
        $scope.user.newPasswordTwo;
        $scope.user.property = 'password';

        //submit the edited account info
        $scope.submitEditCard = function () {

            if ($scope.user.newPasswordOne !== $scope.user.newPasswordTwo) {
                $scope.passCheck = true;
                return;
            } else {
                delete $scope.user.newPasswordTwo;
                AccountFactory.submitEditCard($scope.user, $scope);
            }
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('phone-edit', {
        url: '/phone-edit',
        templateUrl: 'js/edit/phone-edit/phone-edit.html',
        controller: 'PhoneEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('PhoneEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;
        $scope.user.phone;
        $scope.user.property = 'phone';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('sellerAccount-edit', {
        url: '/sellerAccount-edit',
        templateUrl: 'js/edit/sellerAccount-edit/sellerAccount-edit.html',
        controller: 'sellerAccountEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('sellerAccountEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;
        $scope.user.sellerAccount;
        $scope.user.property = 'sellerAccount';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
});
app.config(function ($stateProvider) {

    $stateProvider.state('webAppDomain-edit', {
        url: '/webAppDomain-edit',
        templateUrl: 'js/edit/webAppDomain-edit/webAppDomain-edit.html',
        controller: 'webAppDomainEditCtrl',
        data: {
            authenticate: true
        }
    });
});

app.controller('webAppDomainEditCtrl', function ($scope, $localStorage, AuthService, $state, AccountFactory) {

    AuthService.getLoggedInUser().then(function (user) {

        //to display in edit form
        $scope.currentProperty = $localStorage.currentProperty;

        //populated from session
        $scope.user = {};
        $scope.user.tchoPayId = user.tchoPayId;
        $scope.user.email = user.email;

        //populated by edit form
        $scope.user.password;
        $scope.user.webAppDomain;
        $scope.user.property = 'webAppDomain';

        //submit the edited account info
        $scope.submitEditCard = function () {
            AccountFactory.submitEditCard($scope.user, $scope);
        };

        $scope.cancelEdit = AccountFactory.cancelEdit;
    });
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
app.directive('fullstackLogo', function () {
    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
    };
});
app.directive('payFrame', function ($rootScope, AuthService, CheckoutFactory, AUTH_EVENTS, $state, $http) {

    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'js/common/directives/iframe/iframe.html',
        link: function link(scope) {

            //Authenticate Domain
            scope.enterinfo = true;

            console.log('prelistener');

            var commDomain;

            //communication between web app and iframe
            function receiveMessage(event) {
                console.log('IFRAME COMMUNICATION LIVE', event);

                if (event.origin === commDomain && event.data.hasOwnProperty('res')) {
                    scope.authorizing = false;
                    scope.paymentprocessed = true;
                    scope.$apply();
                    console.log('in resolve');
                    return;
                }

                commDomain = event.origin;

                //Controller accesses parent window and assigns button container
                //data-attributes to scope variables
                scope.iframe.chargeAmount = event.data.chargeAmount;
                scope.iframe.transactionHashValue = event.data.transactionHashValue;
                scope.iframe.apiKey = event.data.apiKey;
                scope.iframe.timestamp = event.data.timestamp;
                scope.$apply();

                // var origin = {
                // 	incumbentDomain: event.origin
                // }
                //  // Do we trust the sender of this message?  (might be
                //  // different from what we originally opened, for example).
                // $http.post("api/checkout/comm-eval", origin).then(function (response){

                //   console.log("incumbent eval response:", response)

                // if(response.data === true){
                //   // event.source is popup
                //   // event.data is "hi there yourself!  the secret response is: rheeeeet!"
                //   		console.log("tchopay evaluated incumbent as true")

                // var parentWindow = window.parent;

                // parentWindow.postMessage("RESPONSE CONTACT FROM IFRAME BACK TO WEBAPP", 'http://localhost:1338/');
                //   		// console.log(event.data)

                //   }else{

                //   }

                // })
            }
            window.addEventListener('message', receiveMessage, false);

            //FOR TESTING: because of nested index.html
            $('#checkout-button').remove();

            console.log('the iframe directive link is running');

            //     		//BUILDING THE TRANSACTION OBJECT (SEND TO TCHOPAY)

            // var apiPublicKey = document.getElementById("tchopay-script").getAttribute("data-key")
            // var amount = document.getElementById("tchopay-script").getAttribute("data-amount")
            // var timestamped = document.getElementById("tchopay-script").getAttribute("data-timestamp")
            // var transactionHash = document.getElementById("tchopay-script").getAttribute("data-transactionhashvalue")

            //checkoutComplete function to call on transaction outcome
            // window.parent.checkoutComplete

            // console.log(timestamp)
            // console.log(transAuthId)

            // console.log(document.getElementById("tchopay-script"))
            // console.log(amount)
            // console.log(apiPublicKey)
            // console.log(timestamped)
            // console.log(transactionHash)

            //Build Transaction Object Scaffold
            scope.iframe = {};

            // scope.iframe.webAppDomain = "http://localhost:1337"
            // if(angular.element(window.parent.window.location)[0]['origin'] === scope.iframe.webAppDomain) scope.enterinfo = true;
            // if(angular.element(window.parent.window.location)[0]['origin'] !== scope.iframe.webAppDomain) scope.merchanterror = true;

            //State Changes (ng-if) All falsey values.
            scope.authorizing;
            scope.merchanterror;
            scope.paymenterror;
            scope.paymentprocessed;

            //hide navbar
            // angular.element(window.document['body']['childNodes'][1]).remove()

            // console.log("iframe object", scope.iframe)

            //Pull rest of properties from iframe
            scope.iframe.buyerAccount;
            scope.iframe.pin;

            //Get buyer location
            navigator.geolocation.getCurrentPosition(function (geo) {
                console.log(geo);
                scope.iframe.location = geo;
            });

            // console.log($(window.parent))

            // scope.closeIframe = function(){

            // 	console.log("you just clicked the close button")

            // 	// $(window.parent.window.document.all[45]).animate({top: "100%", opacity: 0}, 500, 'easeInOutBack')
            // 	$(window.parent.window.document.all[46]).animate({top: "100%", opacity: 0}, 500, 'easeInOutBack');
            // 	var close = function(){
            // 		$(window.parent.window.document.all[46]).remove()
            // 		//TO DO REMOVE BACKGROUND DIV
            // 		// $(window.parent.window.document.children[0].children[2].context).remove()
            // 	}
            // 	setTimeout(close, 900)
            // }

            // .toggleClass("iframe-fadein iframe-fadeout")

            scope.someFunc = function () {
                //create a JSON object from this
                //send api call to backend, create and save a database object
                //take API key and search database

                //set timestamp on transaction
                //OUTDATED with new transauth hash
                // scope.iframe.timestamp = Date.now().toString()

                //hide enterinfo show authorizing transaction
                scope.enterinfo = false;
                scope.authorizing = true;

                console.log('transaction object to be submitted to database', scope.iframe);

                //once outcome returns from back end, we communicate to merchant app

                var parentWindow = window.parent;

                parentWindow.postMessage('TRANSACTION OUTCOME FROM IFRAME', commDomain);

                // Validate Web App Api Key and Secret
                var submitTransaction = function submitTransaction(transactionObject) {
                    //NOTE ON HTTP REQUEST IN CONTROLLER
                    //the security gains by having this call in the controller outmatch gains of modularity
                    //by having this call here, we are able to pass window.location.origin directly into our call
                    //with the smallest chance of its value being manipulated before submission
                    return $http.post('/api/checkout/validate', {
                        transactionObject: transactionObject,
                        browserDomain: commDomain

                    }).then(function (response) {
                        //TO DO

                        console.log('tchopay iframe received outcome object from tchopay back end: ', response.data);

                        parentWindow.postMessage(response.data, commDomain);

                        delete scope.iframe;
                        return response.data;
                    });
                };
                submitTransaction(scope.iframe);
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

            scope.items = [{ label: 'Home', state: 'home' }, { label: 'About', state: 'about' }];

            scope.user = null;

            scope.isLoggedIn = function () {
                return AuthService.isAuthenticated();
            };

            scope.logout = function () {
                AuthService.logout().then(function () {});
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
app.directive('randoGreeting', function (RandomGreetings) {

    return {
        restrict: 'E',
        templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
        link: function link(scope) {
            scope.greeting = RandomGreetings.getRandomGreeting();
        }
    };
});

//   //set hash
//   var transactionHash = "th_9f574e73d80a2715912fd59caa32903058b01882"

//   //BEFORE SERVING HTML
//   //push the transactionHash into the page HTML being served, store it on
//   //the global variable, "transactionHashValue", supplied by us for your front end javascript.
//   //Also, push the timestamp into the page HTML being served, store it on
//   //the global variable, "timestamp", supplied by us for your front end javascript
//   //E.g. using swig
// console.log("this script is running")
// console.log($('#tchopay-script'))
//   $("#tchopay-script").attr("data-transactionhashvalue", "th_9f574e73d80a2715912fd59caa32903058b01882")
//   $("#tchopay-script").attr("data-transactiontimestamp", Date.now())

//with JQuery
//      $("#checkout-button").on('click', function(){
// $('html').append('<link rel="stylesheet" href="iframe.css" type="text/css" />')
//          $('html').append("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>").show()    
//          var framein = function(){
//              $("<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='/checkout'></iframe>").appendTo($('html')).animate({top: "+10%"}, 500, 'easeInOutBack')
//              // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
//          }   
//          setTimeout(framein, 500)

//      })

//without Jquery

// document.getElementById("checkout-button").addEventListener('mouseup', function() {
//     console.log("clicked the mouse",document.getElementsByTagName('html'))
//     document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', '<link rel="stylesheet" href="iframe.css" type="text/css" />');
//     document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', "<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>");
//     document.createElement('<link rel="stylesheet" href="iframe.css" type="text/css" />');
//     document.createElement("<div id='checkout-bg' class='checkout-fadein' style='background-color: gray; position: absolute; display: block; width: 100%; top: 0; left: 0; height: 100%; z-index: 9998;'></div>")

//     var framein = function(){
//         document.getElementsByTagName('html').insertAdjacentHTML('afterbegin', "<iframe id='tchopay-iframe' class='iframe-fadein' style='display: block; position: absolute; width: 20%; padding: 20px; top: 100%; left: 27.5%; right: 27.5%; background-color: white; border-radius: 30px; height: 600px; margin: 0 auto; z-index: 9999;' src='/checkout'></iframe>")
//         // $('html').append('<button type="button" class="iframe-fadein" id="close-button" style="">x<button>').animate({top: "10%"}, 500, 'easeInOutBack')
//     }   
//     setTimeout(framein, 500)

// });

// $("#close-button").on('click', function(){
//     console.log("#checkout-bg")
//     $('#checkout-bg').toggleClass("checkout-fadein checkout-fadeout")
//     var framein = function(){
//         $("#tchopay-iframe").animate({top: "-10%"}, 500, 'easeInOutBack').toggleClass("iframe-fadein iframe-fadeout")
//     }   
//     setTimeout(framein, 500)
//     $('html').remove('<link rel="stylesheet" href="iframe.css" type="text/css" />')

// })       

// { label: 'Register', state: 'signup'}
// { label: 'Tutorial', state: 'tutorial' },
// { label: 'Members Only', state: 'membersOnly', auth: true }

// $state.go('home');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWNjb3VudC9hY2NvdW50LmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJpZnJhbWUvaWZyYW1lLmpzIiwibG9naW4vbG9naW4uanMiLCJtZW1iZXJzLW9ubHkvbWVtYmVycy1vbmx5LmpzIiwic2lnbnVwL3NpZ251cC5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9BY2NvdW50RmFjdG9yeS5qcyIsImNvbW1vbi9mYWN0b3JpZXMvRnVsbHN0YWNrUGljcy5qcyIsImNvbW1vbi9mYWN0b3JpZXMvUmFuZG9tR3JlZXRpbmdzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9jaGVja291dEZhY3RvcnkuanMiLCJlZGl0L2NhbGxiYWNrVXJsLWVkaXQvY2FsbGJhY2tVcmwtZWRpdC5qcyIsImVkaXQvZGVzY3JpcHRpb24tZWRpdC9kZXNjcmlwdGlvbi1lZGl0LmpzIiwiZWRpdC9lbWFpbC1lZGl0L2VtYWlsLWVkaXQuanMiLCJlZGl0L21lcmNoYW50SWQtZWRpdC9tZXJjaGFudElkLWVkaXQuanMiLCJlZGl0L3Bhc3N3b3JkLWVkaXQvcGFzc3dvcmQtZWRpdC5qcyIsImVkaXQvcGhvbmUtZWRpdC9waG9uZS1lZGl0LmpzIiwiZWRpdC9zZWxsZXJBY2NvdW50LWVkaXQvc2VsbGVyQWNjb3VudC1lZGl0LmpzIiwiZWRpdC93ZWJBcHBEb21haW4tZWRpdC93ZWJBcHBEb21haW4tZWRpdC5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24vdHV0b3JpYWwtc2VjdGlvbi5qcyIsInR1dG9yaWFsL3R1dG9yaWFsLXNlY3Rpb24tbWVudS90dXRvcmlhbC1zZWN0aW9uLW1lbnUuanMiLCJ0dXRvcmlhbC90dXRvcmlhbC12aWRlby90dXRvcmlhbC12aWRlby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL2Z1bGxzdGFjay1sb2dvL2Z1bGxzdGFjay1sb2dvLmpzIiwiY29tbW9uL2RpcmVjdGl2ZXMvaWZyYW1lL2lmcmFtZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQTs7QUFFQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxzQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBOzs7QUFHQSxRQUFBLDRCQUFBLEdBQUEsU0FBQSw0QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQTtLQUNBLENBQUE7Ozs7QUFJQSxjQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsNEJBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7QUFFQSxZQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsbUJBQUE7U0FDQTs7O0FBR0EsYUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLG1CQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7O0FBSUEsZ0JBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTthQUNBLE1BQUE7QUFDQSxzQkFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7OztBQUdBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxpQkFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQTs7O0FBR0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDaEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFVBQUE7QUFDQSxtQkFBQSxFQUFBLHlCQUFBO0FBQ0Esa0JBQUEsRUFBQSxhQUFBO0FBQ0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsTUFBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsR0FBQSxDQUFBLDZDQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLGVBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDL0JBLENBQUEsWUFBQTs7QUFFQSxnQkFBQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxPQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtBQUNBLHNCQUFBLEVBQUEsc0JBQUE7QUFDQSx3QkFBQSxFQUFBLHdCQUFBO0FBQ0EscUJBQUEsRUFBQSxxQkFBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtTQUNBLENBQUE7QUFDQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSwwQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsdUJBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTthQUNBO1NBQ0EsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsbUJBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7U0FDQSxDQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxPQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsaUJBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLHNCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQTs7OztBQUlBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLG1CQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7Ozs7OztBQU1BLGdCQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTtBQUNBLHVCQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7Ozs7O0FBS0EsbUJBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLHVCQUFBLElBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUVBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLG1CQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsZ0JBQUEsRUFBQSxFQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUEsRUFBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsbUJBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSx1QkFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsT0FBQSxFQUFBLDRCQUFBLEVBQUEsQ0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsdUJBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLDBCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTthQUNBLENBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7O0FBRUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFlBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtTQUNBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTtBQ3hJQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLG1CQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTs7S0FFQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsRUE4RkEsQ0FBQSxDQUFBO0FDdkdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBO0FBQ0Esa0JBQUEsRUFBQSxZQUFBOzs7OztBQUFBLEtBS0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsWUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsRUFJQSxDQUFBLENBQUE7QUNsQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLFdBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUE7O0FBRUEsY0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSw0QkFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzNCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxlQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtRUFBQTtBQUNBLGtCQUFBLEVBQUEsb0JBQUEsTUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLHVCQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7OztBQUdBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFNBQUEsUUFBQSxHQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUMvQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsV0FBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUE7QUFDQSxrQkFBQSxFQUFBLFlBQUE7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBOztBQUVBLGNBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxHQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxlQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQTs7OztBQUlBLG1CQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtTQUVBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsR0FBQSw0QkFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTs7QUFFQSxTQUFBLENBQUEsR0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7O0FBRUEsZUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDekNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLDJCQUFBO0FBQ0Esa0JBQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxzQkFBQSxlQUFBLEVBQUE7QUFDQSx1QkFBQSxlQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBO2FBQ0E7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQTtBQUNBLHlCQUFBLEVBQUEsNkJBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSx1QkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsUUFBQSxHQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsRUFBQSxTQUFBLENBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FDQSwwQkFBQSxFQUNBLDBCQUFBLEVBQ0EsMEJBQUEsRUFDQSwwQkFBQSxFQUNBLHdCQUFBLENBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxtQkFBQSxLQUFBLENBQUEsT0FBQSxLQUFBLE9BQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUNoREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsT0FBQSxFQUFBLGFBQUEsRUFBQTs7QUFFQSxRQUFBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsS0FBQSxZQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsS0FBQSxPQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxLQUFBLE9BQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEtBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEtBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEtBQUEsZUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEtBQUEsVUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsS0FBQSxjQUFBLEVBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7S0FHQSxDQUFBOztBQUVBLFFBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0EsZUFBQSxhQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FB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QUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsYUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxjQUFBLENBQUEsVUFBQSxHQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN6Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLG1CQUFBO0FBQ0EsbUJBQUEsRUFBQSxnREFBQTtBQUNBLGtCQUFBLEVBQUEscUJBQUE7QUFDQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7OztBQUdBLGNBQUEsQ0FBQSxlQUFBLEdBQUEsYUFBQSxDQUFBLGVBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsYUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxjQUFBLENBQUEsVUFBQSxHQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN4Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTs7QUFFQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsYUFBQTtBQUNBLG1CQUFBLEVBQUEsb0NBQUE7QUFDQSxrQkFBQSxFQUFBLGVBQUE7QUFDQSxZQUFBLEVBQUE7QUFDQSx3QkFBQSxFQUFBLElBQUE7U0FDQTtLQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7O0FBR0EsY0FBQSxDQUFBLGVBQUEsR0FBQSxhQUFBLENBQUEsZUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxPQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3RDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLDhDQUFBO0FBQ0Esa0JBQUEsRUFBQSxvQkFBQTtBQUNBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7O0FBR0EsY0FBQSxDQUFBLGVBQUEsR0FBQSxhQUFBLENBQUEsZUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxZQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3pDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxnQkFBQTtBQUNBLG1CQUFBLEVBQUEsMENBQUE7QUFDQSxrQkFBQSxFQUFBLGtCQUFBO0FBQ0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxrQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7QUFFQSxlQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxlQUFBLEdBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7O0FBRUEsZ0JBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEtBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx1QkFBQTthQUNBLE1BQ0E7QUFDQSx1QkFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQTtBQUNBLDhCQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7YUFDQTtTQUVBLENBQUE7O0FBRUEsY0FBQSxDQUFBLFVBQUEsR0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDcERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLGFBQUE7QUFDQSxtQkFBQSxFQUFBLG9DQUFBO0FBQ0Esa0JBQUEsRUFBQSxlQUFBO0FBQ0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7OztBQUdBLGNBQUEsQ0FBQSxlQUFBLEdBQUEsYUFBQSxDQUFBLGVBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLE9BQUEsQ0FBQTs7O0FBR0EsY0FBQSxDQUFBLGNBQUEsR0FBQSxZQUFBO0FBQ0EsMEJBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLENBQUE7O0FBRUEsY0FBQSxDQUFBLFVBQUEsR0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0tBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7O0FBRUEsa0JBQUEsQ0FBQSxLQUFBLENBQUEsb0JBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxxQkFBQTtBQUNBLG1CQUFBLEVBQUEsb0RBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO0FBQ0EsWUFBQSxFQUFBO0FBQ0Esd0JBQUEsRUFBQSxJQUFBO1NBQ0E7S0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxlQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBOzs7QUFHQSxjQUFBLENBQUEsZUFBQSxHQUFBLGFBQUEsQ0FBQSxlQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUE7OztBQUdBLGNBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLDBCQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtLQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBOztBQUVBLGtCQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsb0JBQUE7QUFDQSxtQkFBQSxFQUFBLGtEQUFBO0FBQ0Esa0JBQUEsRUFBQSxzQkFBQTtBQUNBLFlBQUEsRUFBQTtBQUNBLHdCQUFBLEVBQUEsSUFBQTtTQUNBO0tBQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7O0FBR0EsY0FBQSxDQUFBLGVBQUEsR0FBQSxhQUFBLENBQUEsZUFBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsY0FBQSxDQUFBOzs7QUFHQSxjQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7QUFDQSwwQkFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQTs7QUFFQSxjQUFBLENBQUEsVUFBQSxHQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7S0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN2Q0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxpQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0Esa0JBQUEsRUFBQSxHQUFBO0FBQ0Esc0JBQUEsRUFBQSxHQUFBO1NBQ0E7QUFDQSxtQkFBQSxFQUFBLG9EQUFBO0FBQ0EsWUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7S0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDYkEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxxQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLDhEQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBO1NBQ0E7QUFDQSxZQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsaUJBQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTs7QUFFQSxpQkFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsY0FBQSxHQUFBLE9BQUEsQ0FBQTtBQUNBLDJCQUFBLENBQUEsYUFB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QUE7O0FBRUEsZ0JBQUEsVUFBQSxHQUFBLFNBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO2FBQ0EsQ0FBQTs7QUFFQSxtQkFBQSxFQUFBLENBQUE7O0FBRUEsc0JBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxzQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUFBO1NBRUE7O0tBRUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ2hEQSxHQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLGVBQUEsRUFBQTs7QUFFQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSx5REFBQTtBQUNBLFlBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUE7U0FDQTtLQUNBLENBQUE7Q0FFQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWyd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ2ZzYVByZUJ1aWx0JywgJ25nU3RvcmFnZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Fib3V0L2Fib3V0Lmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRnVsbHN0YWNrUGljcykge1xuXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxuICAgICRzY29wZS5pbWFnZXMgPSBfLnNodWZmbGUoRnVsbHN0YWNrUGljcyk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWNjb3VudCcsIHtcbiAgICAgICAgdXJsOiAnL2FjY291bnQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnQvYWNjb3VudC5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0FjY291bnRDdHJsJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICBcdGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWNjb3VudEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYWxTdG9yYWdlLCBBdXRoU2VydmljZSwgQWNjb3VudEZhY3RvcnksICRzdGF0ZSkge1xuIFxuICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXG4gICAgXHRjb25zb2xlLmxvZyhcInJldHJpZXZlZCB1c2VyLFwiLCB1c2VyKVxuXG4gICAgICAgIEFjY291bnRGYWN0b3J5LmdldEFjY291bnRJbmZvKHVzZXIpLnRoZW4oZnVuY3Rpb24oYWNjb3VudCl7XG4gICAgICAgIFx0JHNjb3BlLnVzZXIgPSBhY2NvdW50O1xuICAgICAgICB9KTtcblxuICAgICAgICBjb25zb2xlLmxvZyhcInVwZGF0ZWQgdXNlciBpbmZvcm1hdGlvbiB0byBiZSByZWRpc3BsYXllZCxcIiwgJHNjb3BlLnVzZXIpO1xuXG4gICAgfSk7XG5cbiAgICAkc2NvcGUuZWRpdEFjY291bnQgPSBmdW5jdGlvbihwcm9wZXJ0eSl7XG4gICAgXHQkbG9jYWxTdG9yYWdlLmN1cnJlbnRQcm9wZXJ0eSA9ICRzY29wZS51c2VyW3Byb3BlcnR5XVxuICAgIFx0QWNjb3VudEZhY3RvcnkuZWRpdEFjY291bnQocHJvcGVydHkpXG5cdH1cbn0pOyIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJvbiBzdWNjZXNmdWwgbG9naW46IGRhdGEsXCIsZGF0YSlcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2lnbnVwID0gZnVuY3Rpb24gKHNpZ251cEluZm8pe1xuICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9yZWdpc3Rlci8nLCB7c2lnbnVwSW5mbyA6IHNpZ251cEluZm99LCBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzcG9uc2UgZnJvbSBzaWdudXAgcm91dGUnLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7IFxuICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24gKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7IG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLicgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24gKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG5cbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cblxuXG5cblxuXG4vLyAgIC8vc2V0IGhhc2hcbi8vICAgdmFyIHRyYW5zYWN0aW9uSGFzaCA9IFwidGhfOWY1NzRlNzNkODBhMjcxNTkxMmZkNTljYWEzMjkwMzA1OGIwMTg4MlwiXG5cbi8vICAgLy9CRUZPUkUgU0VSVklORyBIVE1MXG4vLyAgIC8vcHVzaCB0aGUgdHJhbnNhY3Rpb25IYXNoIGludG8gdGhlIHBhZ2UgSFRNTCBiZWluZyBzZXJ2ZWQsIHN0b3JlIGl0IG9uIFxuLy8gICAvL3RoZSBnbG9iYWwgdmFyaWFibGUsIFwidHJhbnNhY3Rpb25IYXNoVmFsdWVcIiwgc3VwcGxpZWQgYnkgdXMgZm9yIHlvdXIgZnJvbnQgZW5kIGphdmFzY3JpcHQuXG4vLyAgIC8vQWxzbywgcHVzaCB0aGUgdGltZXN0YW1wIGludG8gdGhlIHBhZ2UgSFRNTCBiZWluZyBzZXJ2ZWQsIHN0b3JlIGl0IG9uIFxuLy8gICAvL3RoZSBnbG9iYWwgdmFyaWFibGUsIFwidGltZXN0YW1wXCIsIHN1cHBsaWVkIGJ5IHVzIGZvciB5b3VyIGZyb250IGVuZCBqYXZhc2NyaXB0XG4vLyAgIC8vRS5nLiB1c2luZyBzd2lnXG4vLyBjb25zb2xlLmxvZyhcInRoaXMgc2NyaXB0IGlzIHJ1bm5pbmdcIilcbi8vIGNvbnNvbGUubG9nKCQoJyN0Y2hvcGF5LXNjcmlwdCcpKVxuLy8gICAkKFwiI3RjaG9wYXktc2NyaXB0XCIpLmF0dHIoXCJkYXRhLXRyYW5zYWN0aW9uaGFzaHZhbHVlXCIsIFwidGhfOWY1NzRlNzNkODBhMjcxNTkxMmZkNTljYWEzMjkwMzA1OGIwMTg4MlwiKVxuLy8gICAkKFwiI3RjaG9wYXktc2NyaXB0XCIpLmF0dHIoXCJkYXRhLXRyYW5zYWN0aW9udGltZXN0YW1wXCIsIERhdGUubm93KCkpXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuICAgICAgICAvL3dpdGggSlF1ZXJ5XG4gICAvLyAgICAgICQoXCIjY2hlY2tvdXQtYnV0dG9uXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCl7XG5cdFx0XHQvLyAkKCdodG1sJykuYXBwZW5kKCc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImlmcmFtZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiAvPicpXG4gICAvLyAgICAgICAgICAkKCdodG1sJykuYXBwZW5kKFwiPGRpdiBpZD0nY2hlY2tvdXQtYmcnIGNsYXNzPSdjaGVja291dC1mYWRlaW4nIHN0eWxlPSdiYWNrZ3JvdW5kLWNvbG9yOiBncmF5OyBwb3NpdGlvbjogYWJzb2x1dGU7IGRpc3BsYXk6IGJsb2NrOyB3aWR0aDogMTAwJTsgdG9wOiAwOyBsZWZ0OiAwOyBoZWlnaHQ6IDEwMCU7IHotaW5kZXg6IDk5OTg7Jz48L2Rpdj5cIikuc2hvdygpICAgICBcbiAgIC8vICAgICAgICAgIHZhciBmcmFtZWluID0gZnVuY3Rpb24oKXtcbiAgIC8vICAgICAgICAgICAgICAkKFwiPGlmcmFtZSBpZD0ndGNob3BheS1pZnJhbWUnIGNsYXNzPSdpZnJhbWUtZmFkZWluJyBzdHlsZT0nZGlzcGxheTogYmxvY2s7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgd2lkdGg6IDIwJTsgcGFkZGluZzogMjBweDsgdG9wOiAxMDAlOyBsZWZ0OiAyNy41JTsgcmlnaHQ6IDI3LjUlOyBiYWNrZ3JvdW5kLWNvbG9yOiB3aGl0ZTsgYm9yZGVyLXJhZGl1czogMzBweDsgaGVpZ2h0OiA2MDBweDsgbWFyZ2luOiAwIGF1dG87IHotaW5kZXg6IDk5OTk7JyBzcmM9Jy9jaGVja291dCc+PC9pZnJhbWU+XCIpLmFwcGVuZFRvKCQoJ2h0bWwnKSkuYW5pbWF0ZSh7dG9wOiBcIisxMCVcIn0sIDUwMCwgJ2Vhc2VJbk91dEJhY2snKVxuICAgLy8gICAgICAgICAgICAgIC8vICQoJ2h0bWwnKS5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWZyYW1lLWZhZGVpblwiIGlkPVwiY2xvc2UtYnV0dG9uXCIgc3R5bGU9XCJcIj54PGJ1dHRvbj4nKS5hbmltYXRlKHt0b3A6IFwiMTAlXCJ9LCA1MDAsICdlYXNlSW5PdXRCYWNrJylcbiAgIC8vICAgICAgICAgIH0gICAgXG4gICAvLyAgICAgICAgICBzZXRUaW1lb3V0KGZyYW1laW4sIDUwMClcbiBcbiAgIC8vICAgICAgfSlcblxuICAgICAgICAvL3dpdGhvdXQgSnF1ZXJ5XG5cbiAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjaGVja291dC1idXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJjbGlja2VkIHRoZSBtb3VzZVwiLGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdodG1sJykpXG4gICAgICAgIC8vICAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaHRtbCcpLmluc2VydEFkamFjZW50SFRNTCgnYWZ0ZXJiZWdpbicsICc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImlmcmFtZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiAvPicpO1xuICAgICAgICAvLyAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBcIjxkaXYgaWQ9J2NoZWNrb3V0LWJnJyBjbGFzcz0nY2hlY2tvdXQtZmFkZWluJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjogZ3JheTsgcG9zaXRpb246IGFic29sdXRlOyBkaXNwbGF5OiBibG9jazsgd2lkdGg6IDEwMCU7IHRvcDogMDsgbGVmdDogMDsgaGVpZ2h0OiAxMDAlOyB6LWluZGV4OiA5OTk4Oyc+PC9kaXY+XCIpO1xuICAgICAgICAvLyAgICAgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnPGxpbmsgcmVsPVwic3R5bGVzaGVldFwiIGhyZWY9XCJpZnJhbWUuY3NzXCIgdHlwZT1cInRleHQvY3NzXCIgLz4nKTtcbiAgICAgICAgLy8gICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCI8ZGl2IGlkPSdjaGVja291dC1iZycgY2xhc3M9J2NoZWNrb3V0LWZhZGVpbicgc3R5bGU9J2JhY2tncm91bmQtY29sb3I6IGdyYXk7IHBvc2l0aW9uOiBhYnNvbHV0ZTsgZGlzcGxheTogYmxvY2s7IHdpZHRoOiAxMDAlOyB0b3A6IDA7IGxlZnQ6IDA7IGhlaWdodDogMTAwJTsgei1pbmRleDogOTk5ODsnPjwvZGl2PlwiKVxuXG4gICAgICAgIC8vICAgICB2YXIgZnJhbWVpbiA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2h0bWwnKS5pbnNlcnRBZGphY2VudEhUTUwoJ2FmdGVyYmVnaW4nLCBcIjxpZnJhbWUgaWQ9J3RjaG9wYXktaWZyYW1lJyBjbGFzcz0naWZyYW1lLWZhZGVpbicgc3R5bGU9J2Rpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHdpZHRoOiAyMCU7IHBhZGRpbmc6IDIwcHg7IHRvcDogMTAwJTsgbGVmdDogMjcuNSU7IHJpZ2h0OiAyNy41JTsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7IGJvcmRlci1yYWRpdXM6IDMwcHg7IGhlaWdodDogNjAwcHg7IG1hcmdpbjogMCBhdXRvOyB6LWluZGV4OiA5OTk5Oycgc3JjPScvY2hlY2tvdXQnPjwvaWZyYW1lPlwiKVxuICAgICAgICAvLyAgICAgICAgIC8vICQoJ2h0bWwnKS5hcHBlbmQoJzxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiaWZyYW1lLWZhZGVpblwiIGlkPVwiY2xvc2UtYnV0dG9uXCIgc3R5bGU9XCJcIj54PGJ1dHRvbj4nKS5hbmltYXRlKHt0b3A6IFwiMTAlXCJ9LCA1MDAsICdlYXNlSW5PdXRCYWNrJylcbiAgICAgICAgLy8gICAgIH0gICAgXG4gICAgICAgIC8vICAgICBzZXRUaW1lb3V0KGZyYW1laW4sIDUwMClcblxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyAkKFwiI2Nsb3NlLWJ1dHRvblwiKS5vbignY2xpY2snLCBmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCIjY2hlY2tvdXQtYmdcIilcbiAgICAgICAgLy8gICAgICQoJyNjaGVja291dC1iZycpLnRvZ2dsZUNsYXNzKFwiY2hlY2tvdXQtZmFkZWluIGNoZWNrb3V0LWZhZGVvdXRcIilcbiAgICAgICAgLy8gICAgIHZhciBmcmFtZWluID0gZnVuY3Rpb24oKXtcbiAgICAgICAgLy8gICAgICAgICAkKFwiI3RjaG9wYXktaWZyYW1lXCIpLmFuaW1hdGUoe3RvcDogXCItMTAlXCJ9LCA1MDAsICdlYXNlSW5PdXRCYWNrJykudG9nZ2xlQ2xhc3MoXCJpZnJhbWUtZmFkZWluIGlmcmFtZS1mYWRlb3V0XCIpXG4gICAgICAgIC8vICAgICB9ICAgIFxuICAgICAgICAvLyAgICAgc2V0VGltZW91dChmcmFtZWluLCA1MDApXG4gICAgICAgIC8vICAgICAkKCdodG1sJykucmVtb3ZlKCc8bGluayByZWw9XCJzdHlsZXNoZWV0XCIgaHJlZj1cImlmcmFtZS5jc3NcIiB0eXBlPVwidGV4dC9jc3NcIiAvPicpXG4gXG4gICAgICAgIC8vIH0pICAgICAgICBcblxuXG5cbiAgICBcblxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NoZWNrb3V0Jywge1xuICAgICAgICB1cmw6ICcvY2hlY2tvdXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2lmcmFtZS9pZnJhbWUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdpZnJhbWVDdHJsJ1xuICAgICAgICAvLyAsXG4gICAgICAgIC8vIGRhdGE6IHtcbiAgICAgICAgLy8gXHRhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgLy8gfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2lmcmFtZUN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cblxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICRzY29wZS5sb2dpbiA9IHt9O1xuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKGxvZ2luSW5mbykge1xuXG4gICAgICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UubG9naW4obG9naW5JbmZvKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc2NvcGUuZXJyb3IgPSAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nO1xuICAgICAgICB9KTtcblxuICAgIH07XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWVtYmVyc09ubHknLCB7XG4gICAgICAgIHVybDogJy9tZW1iZXJzLWFyZWEnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxpbWcgbmctcmVwZWF0PVwiaXRlbSBpbiBzdGFzaFwiIHdpZHRoPVwiMzAwXCIgbmctc3JjPVwie3sgaXRlbSB9fVwiIC8+JyxcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCRzY29wZSwgU2VjcmV0U3Rhc2gpIHtcbiAgICAgICAgICAgIFNlY3JldFN0YXNoLmdldFN0YXNoKCkudGhlbihmdW5jdGlvbiAoc3Rhc2gpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuc3Rhc2ggPSBzdGFzaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmZhY3RvcnkoJ1NlY3JldFN0YXNoJywgZnVuY3Rpb24gKCRodHRwKSB7XG5cbiAgICB2YXIgZ2V0U3Rhc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvbWVtYmVycy9zZWNyZXQtc3Rhc2gnKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZXRTdGFzaDogZ2V0U3Rhc2hcbiAgICB9O1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9zaWdudXAvc2lnbnVwLmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnU2lnblVwQ3RybCdcbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTaWduVXBDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgJGh0dHApIHtcblxuICAgIGNvbnNvbGUubG9nKFwieW91J3ZlIGhpdCB0aGUgc2lnbnVwQ3RybFwiKVxuICAgICRzY29wZS5lcnJvciA9IG51bGw7XG5cbiAgICAkc2NvcGUuc2VuZExvZ2luID0gZnVuY3Rpb24gKHNpZ251cEluZm8pIHtcblxuICAgICAgICAkc2NvcGUuZXJyb3IgPSBudWxsO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwic2lnbnVwIG9iamVjdCxcIiwgc2lnbnVwSW5mbyApXG5cbiAgICAgICAgY29uc29sZS5sb2coXCJBdXRoU2VydmljZVwiLCBBdXRoU2VydmljZSlcblxuICAgICAgICAvLyBhdXRoRkNULnBvc3RTaWduVXBGb3JtKHNpZ251cEluZm8pXG4gICAgICAgIFxuICAgICAgICBBdXRoU2VydmljZS5zaWdudXAoc2lnbnVwSW5mbykudGhlbihmdW5jdGlvbiAodXNlcikge1xuXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FjY2NvdW50Jyk7XG5cbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLmVycm9yID0gJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJztcbiAgICAgICAgfSk7XG5cbiAgICB9O1xuXG4gICAgJGh0dHAuZ2V0KCcvYXBpL3JlZ2lzdGVyL21vY2staGFzaCcpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuICAgICAgICAgICBcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICAgIFxuICAgIH0pXG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndHV0b3JpYWwnLCB7XG4gICAgICAgIHVybDogJy90dXRvcmlhbCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdUdXRvcmlhbEN0cmwnLFxuICAgICAgICByZXNvbHZlOiB7XG4gICAgICAgICAgICB0dXRvcmlhbEluZm86IGZ1bmN0aW9uIChUdXRvcmlhbEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVHV0b3JpYWxGYWN0b3J5LmdldFR1dG9yaWFsVmlkZW9zKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5mYWN0b3J5KCdUdXRvcmlhbEZhY3RvcnknLCBmdW5jdGlvbiAoJGh0dHApIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFR1dG9yaWFsVmlkZW9zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3R1dG9yaWFsL3ZpZGVvcycpLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignVHV0b3JpYWxDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgdHV0b3JpYWxJbmZvKSB7XG5cbiAgICAkc2NvcGUuc2VjdGlvbnMgPSB0dXRvcmlhbEluZm8uc2VjdGlvbnM7XG4gICAgJHNjb3BlLnZpZGVvcyA9IF8uZ3JvdXBCeSh0dXRvcmlhbEluZm8udmlkZW9zLCAnc2VjdGlvbicpO1xuXG4gICAgJHNjb3BlLmN1cnJlbnRTZWN0aW9uID0geyBzZWN0aW9uOiBudWxsIH07XG5cbiAgICAkc2NvcGUuY29sb3JzID0gW1xuICAgICAgICAncmdiYSgzNCwgMTA3LCAyNTUsIDAuMTApJyxcbiAgICAgICAgJ3JnYmEoMjM4LCAyNTUsIDY4LCAwLjExKScsXG4gICAgICAgICdyZ2JhKDIzNCwgNTEsIDI1NSwgMC4xMSknLFxuICAgICAgICAncmdiYSgyNTUsIDE5MywgNzMsIDAuMTEpJyxcbiAgICAgICAgJ3JnYmEoMjIsIDI1NSwgMSwgMC4xMSknXG4gICAgXTtcblxuICAgICRzY29wZS5nZXRWaWRlb3NCeVNlY3Rpb24gPSBmdW5jdGlvbiAoc2VjdGlvbiwgdmlkZW9zKSB7XG4gICAgICAgIHJldHVybiB2aWRlb3MuZmlsdGVyKGZ1bmN0aW9uICh2aWRlbykge1xuICAgICAgICAgICAgcmV0dXJuIHZpZGVvLnNlY3Rpb24gPT09IHNlY3Rpb247XG4gICAgICAgIH0pO1xuICAgIH07XG5cbn0pOyIsImFwcC5mYWN0b3J5KCdBY2NvdW50RmFjdG9yeScsIGZ1bmN0aW9uICgkaHR0cCwgJHN0YXRlLCBBdXRoU2VydmljZSwgU2Vzc2lvbiwgJGxvY2FsU3RvcmFnZSkge1xuXG5cdHZhciBnZXRBY2NvdW50SW5mbyA9IGZ1bmN0aW9uKHVzZXIpe1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvYWNjb3VudC8nICsgdXNlci50Y2hvUGF5SWQpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UuZGF0YSlcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0pXG5cdH1cblxuXHR2YXIgZWRpdEFjY291bnQgPSBmdW5jdGlvbihwcm9wZXJ0eSl7XG5cdFx0aWYocHJvcGVydHkgPT09ICdtZXJjaGFudElkJykgJHN0YXRlLmdvKFwibWVyY2hhbnRJZC1lZGl0XCIpO1xuXHRcdGlmKHByb3BlcnR5ID09PSBcImVtYWlsXCIpICRzdGF0ZS5nbyhcImVtYWlsLWVkaXRcIik7XG5cdFx0aWYocHJvcGVydHkgPT09IFwicGhvbmVcIikgJHN0YXRlLmdvKFwicGhvbmUtZWRpdFwiKTtcblx0XHRpZihwcm9wZXJ0eSA9PT0gXCJkZXNjcmlwdGlvblwiKSAkc3RhdGUuZ28oXCJkZXNjcmlwdGlvbi1lZGl0XCIpO1xuXHRcdGlmKHByb3BlcnR5ID09PSBcImNhbGxiYWNrVXJsXCIpICRzdGF0ZS5nbyhcImNhbGxiYWNrVXJsLWVkaXRcIik7XG5cdFx0aWYocHJvcGVydHkgPT09IFwic2VsbGVyQWNjb3VudFwiKSAkc3RhdGUuZ28oXCJzZWxsZXJBY2NvdW50LWVkaXRcIik7XG5cdFx0aWYocHJvcGVydHkgPT09IFwicGFzc3dvcmRcIikgJHN0YXRlLmdvKFwicGFzc3dvcmQtZWRpdFwiKTtcblx0XHRpZihwcm9wZXJ0eSA9PT0gXCJ3ZWJBcHBEb21haW5cIikgJHN0YXRlLmdvKFwid2ViQXBwRG9tYWluLWVkaXRcIik7XG5cblxuXHR9XG5cblx0dmFyIGNhbmNlbEVkaXQgPSBmdW5jdGlvbigpe1xuXHRcdGRlbGV0ZSAkbG9jYWxTdG9yYWdlLmN1cnJlbnRQcm9wZXJ0eVxuXHRcdCRzdGF0ZS5nbygnYWNjb3VudCcpXG5cdFx0cmV0dXJuXG5cdH1cblxuXHR2YXIgc3VibWl0RWRpdENhcmQgPSBmdW5jdGlvbih1c2VyLCBzY29wZSl7XG5cdFx0XG5cdFx0dmFyIGxvZ2luVXNlciA9IHtcblx0XHRcdGVtYWlsOiB1c2VyLmVtYWlsLCBcblx0XHRcdHBhc3N3b3JkOiB1c2VyLnBhc3N3b3JkXG5cdFx0fVxuXG5cdFx0Ly9pZiB1c2VyLnByb3BlcnR5ID09PSBcImVtYWlsXCIgfHwgdXNlci5wcm9wZXJ0eSA9PT0gXCJwYXNzd29yZFwiXG5cdFx0Ly9sb2cgb3V0IGV2ZW50XG5cdFx0Ly9zdGF0ZSBjaGFuZ2UgdG8gbG9naW5cblxuXHRcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvYWNjb3VudC9lZGl0JywgdXNlcikudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cblx0XHRcdGlmKHJlc3BvbnNlLmRhdGEuZXJyb3IgPT09IFwiaW52YWxpZCBwYXNzd29yZFwiKXtcblx0XHRcdFx0Ly9zZXQgc29tZSB2YXJpYWJsZSB0byB0cnVlLCBsaW5rIGl0IHRvIG5nLXNob3cgb2YgcGFzc3dvcmQgYWxlcnQgZWxlbWVudFxuXHRcdFx0XHQvL3N0YXRlLmdvIHNhbWUgcGFnZVxuXHRcdFx0XHRzY29wZS5mYWlsUGFzcyA9IHRydWU7XG5cdFx0XHRcdCRzdGF0ZS5nbyh1c2VyLnByb3BlcnR5K1wiLWVkaXRcIik7XG5cdFx0XHRcdHJldHVybiBcblxuXHRcdFx0fVxuXHRcdFx0ZWxzZXtcblxuXHRcdFx0XHRTZXNzaW9uLnVzZXIgPSByZXNwb25zZS5kYXRhXG5cdFx0XHRcdGRlbGV0ZSAkbG9jYWxTdG9yYWdlLmN1cnJlbnRQcm9wZXJ0eVxuXG5cdFx0ICAgIFx0aWYodXNlci5wcm9wZXJ0eSA9PT0gXCJlbWFpbFwiIHx8IHVzZXIucHJvcGVydHkgPT09IFwicGFzc3dvcmRcIil7XG5cdFx0XHRcdFx0QXV0aFNlcnZpY2UubG9nb3V0KCkudGhlbihmdW5jdGlvbigpe1xuXG5cdFx0XHRcdFx0XHQkc3RhdGUuZ28oJ2xvZ2luJyk7XHRcdCAgICBcdFx0XG5cdFx0XHQgICAgXHRcdHJldHVyblxuXG5cdFx0XHRcdFx0fSlcblx0XHQgICAgXHR9XG5cdFx0ICAgIFx0ZWxzZXtcblxuXHRcdFx0XHRcdCRzdGF0ZS5nbygnYWNjb3VudCcpO1xuXHRcdCAgICAgICAgICAgIHJldHVybiBcblx0XHQgICAgXHRcdFxuXHRcdCAgICBcdH1cblxuXG5cblx0XHQgICAgfVxuXG5cdFx0fSlcblxuXHRcdC8vb25jZSB0aGlzIGNhbGwgdG8gcm91dGUgYW5kIHNhdmUgaGFzIG9jY3VyZWRcblx0XHQvL3JvdXRlIHJldHVybnMgbmV3IHVzZXIgb2JqZWN0XG5cdFx0Ly9pbml0aWF0ZSBuZXcgTG9nIGluIGV2ZW50IHRvIHBlcnNpc3QgdXBkYXRlZCB1c2VyIGluZm8gb24gc2Vzc2lvblxuXHRcdC8vc3RhdGUuZ28oXCJhY2NvdW50XCIpXG5cdH1cblxuXHRyZXR1cm4ge1xuXHQgICAgICAgIGdldEFjY291bnRJbmZvOiBnZXRBY2NvdW50SW5mbyxcblx0ICAgICAgICBlZGl0QWNjb3VudDogZWRpdEFjY291bnQsXHRcblx0ICAgICAgICBzdWJtaXRFZGl0Q2FyZDogc3VibWl0RWRpdENhcmQsXG5cdCAgICAgICAgY2FuY2VsRWRpdDogY2FuY2VsRWRpdCAgICAgICAgICBcblx0fTtcblxufSk7IiwiYXBwLmZhY3RvcnkoJ0Z1bGxzdGFja1BpY3MnLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIFtcbiAgICAgICAgJ2h0dHBzOi8vcGJzLnR3aW1nLmNvbS9tZWRpYS9CN2dCWHVsQ0FBQVhRY0UuanBnOmxhcmdlJyxcbiAgICAgICAgJ2h0dHBzOi8vZmJjZG4tc3Bob3Rvcy1jLWEuYWthbWFpaGQubmV0L2hwaG90b3MtYWsteGFwMS90MzEuMC04LzEwODYyNDUxXzEwMjA1NjIyOTkwMzU5MjQxXzgwMjcxNjg4NDMzMTI4NDExMzdfby5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItTEtVc2hJZ0FFeTlTSy5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3OS1YN29DTUFBa3c3eS5qcGcnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItVWo5Q09JSUFJRkFoMC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I2eUl5RmlDRUFBcWwxMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFLVQ3NWxXQUFBbXFxSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFdlpBZy1WQUFBazkzMi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFZ05NZU9YSUFJZkRoSy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NFUXlJRE5XZ0FBdTYwQi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NDRjNUNVFXOEFFMmxHSi5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBZVZ3NVNXb0FBQUxzai5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBYUpJUDdVa0FBbElHcy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0NBUU93OWxXRUFBWTlGbC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0ItT1FiVnJDTUFBTndJTS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I5Yl9lcndDWUFBd1JjSi5wbmc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I1UFRkdm5DY0FFQWw0eC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I0cXdDMGlDWUFBbFBHaC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0IyYjMzdlJJVUFBOW8xRC5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0J3cEl3cjFJVUFBdk8yXy5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0JzU3NlQU5DWUFFT2hMdy5qcGc6bGFyZ2UnXG4gICAgXTtcbn0pOyIsImFwcC5mYWN0b3J5KCdSYW5kb21HcmVldGluZ3MnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgZ2V0UmFuZG9tRnJvbUFycmF5ID0gZnVuY3Rpb24gKGFycikge1xuICAgICAgICByZXR1cm4gYXJyW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpXTtcbiAgICB9O1xuXG4gICAgdmFyIGdyZWV0aW5ncyA9IFtcbiAgICAgICAgJ0hlbGxvLCB3b3JsZCEnLFxuICAgICAgICAnQXQgbG9uZyBsYXN0LCBJIGxpdmUhJyxcbiAgICAgICAgJ0hlbGxvLCBzaW1wbGUgaHVtYW4uJyxcbiAgICAgICAgJ1doYXQgYSBiZWF1dGlmdWwgZGF5IScsXG4gICAgICAgICdJXFwnbSBsaWtlIGFueSBvdGhlciBwcm9qZWN0LCBleGNlcHQgdGhhdCBJIGFtIHlvdXJzLiA6KScsXG4gICAgICAgICdUaGlzIGVtcHR5IHN0cmluZyBpcyBmb3IgTGluZHNheSBMZXZpbmUuJyxcbiAgICAgICAgJ+OBk+OCk+OBq+OBoeOBr+OAgeODpuODvOOCtuODvOanmOOAgicsXG4gICAgICAgICdXZWxjb21lLiBUby4gV0VCU0lURS4nLFxuICAgICAgICAnOkQnLFxuICAgICAgICAnWWVzLCBJIHRoaW5rIHdlXFwndmUgbWV0IGJlZm9yZS4nXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZmFjdG9yeSgnQ2hlY2tvdXRGYWN0b3J5JywgZnVuY3Rpb24gKCRodHRwLCAkc3RhdGUsIEF1dGhTZXJ2aWNlLCBTZXNzaW9uLCAkbG9jYWxTdG9yYWdlKSB7XG5cblxuXG5cdHZhciBzdWJtaXRUcmFuc2FjdGlvbiA9IGZ1bmN0aW9uKHRyYW5zYWN0aW9uT2JqZWN0LCBicm93c2VyRG9tYWluKXtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9jaGVja291dC92YWxpZGF0ZScsIFxuXHRcdFx0e1xuXHRcdFx0XHR0cmFuc2FjdGlvbk9iamVjdDogdHJhbnNhY3Rpb25PYmplY3QsIFxuXHRcdFx0XHRicm93c2VyRG9tYWluOiBicm93c2VyRG9tYWluXG5cblx0XHRcdH0pLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHQvL1RPIERPXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhXG5cdFx0fSlcblx0fVxuXG5cdHJldHVybiB7XG5cdCAgICAgICAgc3VibWl0VHJhbnNhY3Rpb246IHN1Ym1pdFRyYW5zYWN0aW9uICAgICAgICBcblx0fTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjYWxsYmFja1VybC1lZGl0Jywge1xuICAgICAgICB1cmw6ICcvY2FsbGJhY2tVcmwtZWRpdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZWRpdC9jYWxsYmFja1VybC1lZGl0L2NhbGxiYWNrVXJsLWVkaXQuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdDYWxsYmFja1VybEVkaXRDdHJsJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICBcdGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQ2FsbGJhY2tVcmxFZGl0Q3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsICRsb2NhbFN0b3JhZ2UsIEFjY291bnRGYWN0b3J5KSB7XG5cblx0QXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcil7XG5cdFx0XG5cdFx0Ly90byBkaXNwbGF5IGluIGVkaXQgZm9ybVxuXHRcdCRzY29wZS5jdXJyZW50UHJvcGVydHkgPSAkbG9jYWxTdG9yYWdlLmN1cnJlbnRQcm9wZXJ0eVxuXHRcdFxuXHRcdC8vcG9wdWxhdGVkIGZyb20gc2Vzc2lvblxuXHRcdCRzY29wZS51c2VyID0ge307XG5cdFx0JHNjb3BlLnVzZXIudGNob1BheUlkID0gdXNlci50Y2hvUGF5SWRcblx0XHQkc2NvcGUudXNlci5lbWFpbCA9IHVzZXIuZW1haWxcblx0XHRcblx0XHQvL3BvcHVsYXRlZCBieSBlZGl0IGZvcm1cblx0XHQkc2NvcGUudXNlci5wYXNzd29yZFxuXG5cdFx0Ly9VTklRVUUgUFJPUEVSVFkgVE8gRURJVFxuXHRcdCRzY29wZS51c2VyLmNhbGxiYWNrVXJsXG5cdFx0JHNjb3BlLnVzZXIucHJvcGVydHkgPSBcImNhbGxiYWNrVXJsXCJcblxuXHRcdC8vc3VibWl0IHRoZSBlZGl0ZWQgYWNjb3VudCBpbmZvXG5cdFx0JHNjb3BlLnN1Ym1pdEVkaXRDYXJkID0gZnVuY3Rpb24oKXtcblx0XHRcdEFjY291bnRGYWN0b3J5LnN1Ym1pdEVkaXRDYXJkKCRzY29wZS51c2VyLCAkc2NvcGUpXHRcdFx0XG5cdFx0fVxuXG5cdFx0JHNjb3BlLmNhbmNlbEVkaXQgPSBBY2NvdW50RmFjdG9yeS5jYW5jZWxFZGl0XG5cblx0fSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGVzY3JpcHRpb24tZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2Rlc2NyaXB0aW9uLWVkaXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2VkaXQvZGVzY3JpcHRpb24tZWRpdC9kZXNjcmlwdGlvbi1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRGVzY3JpcHRpb25FZGl0Q3RybCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgXHRhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Rlc2NyaXB0aW9uRWRpdEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkbG9jYWxTdG9yYWdlLCBBY2NvdW50RmFjdG9yeSkge1xuXG5cdEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXHRcdFxuXHRcdC8vdG8gZGlzcGxheSBpbiBlZGl0IGZvcm1cblx0XHQkc2NvcGUuY3VycmVudFByb3BlcnR5ID0gJGxvY2FsU3RvcmFnZS5jdXJyZW50UHJvcGVydHlcblx0XHRcblx0XHQvL3BvcHVsYXRlZCBmcm9tIHNlc3Npb25cblx0XHQkc2NvcGUudXNlciA9IHt9O1xuXHRcdCRzY29wZS51c2VyLnRjaG9QYXlJZCA9IHVzZXIudGNob1BheUlkXG5cdFx0JHNjb3BlLnVzZXIuZW1haWwgPSB1c2VyLmVtYWlsXG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgYnkgZWRpdCBmb3JtXG5cdFx0JHNjb3BlLnVzZXIucGFzc3dvcmRcblxuXHRcdC8vVU5JUVVFIFBST1BFUlRZIFRPIEVESVRcblx0XHQkc2NvcGUudXNlci5kZXNjcmlwdGlvblxuXHRcdCRzY29wZS51c2VyLnByb3BlcnR5ID0gXCJkZXNjcmlwdGlvblwiXG5cblx0XHQvL3N1Ym1pdCB0aGUgZWRpdGVkIGFjY291bnQgaW5mb1xuXHRcdCRzY29wZS5zdWJtaXRFZGl0Q2FyZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRBY2NvdW50RmFjdG9yeS5zdWJtaXRFZGl0Q2FyZCgkc2NvcGUudXNlciwgJHNjb3BlKVx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHQkc2NvcGUuY2FuY2VsRWRpdCA9IEFjY291bnRGYWN0b3J5LmNhbmNlbEVkaXRcblxuXHR9KTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZW1haWwtZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL2VtYWlsLWVkaXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2VkaXQvZW1haWwtZWRpdC9lbWFpbC1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnRW1haWxFZGl0Q3RybCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgXHRhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0VtYWlsRWRpdEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkbG9jYWxTdG9yYWdlLCBBY2NvdW50RmFjdG9yeSkge1xuXG5cdEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXHRcdFxuXHRcdC8vdG8gZGlzcGxheSBpbiBlZGl0IGZvcm1cblx0XHQkc2NvcGUuY3VycmVudFByb3BlcnR5ID0gJGxvY2FsU3RvcmFnZS5jdXJyZW50UHJvcGVydHlcblx0XHRcblx0XHQvL3BvcHVsYXRlZCBmcm9tIHNlc3Npb25cblx0XHQkc2NvcGUudXNlciA9IHt9O1xuXHRcdCRzY29wZS51c2VyLnRjaG9QYXlJZCA9IHVzZXIudGNob1BheUlkXG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgYnkgZWRpdCBmb3JtXG5cdFx0JHNjb3BlLnVzZXIucGFzc3dvcmRcblx0XHQkc2NvcGUudXNlci5lbWFpbFxuXHRcdCRzY29wZS51c2VyLnByb3BlcnR5ID0gXCJlbWFpbFwiXG5cblx0XHQvL3N1Ym1pdCB0aGUgZWRpdGVkIGFjY291bnQgaW5mb1xuXHRcdCRzY29wZS5zdWJtaXRFZGl0Q2FyZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRBY2NvdW50RmFjdG9yeS5zdWJtaXRFZGl0Q2FyZCgkc2NvcGUudXNlciwgJHNjb3BlKVx0XHRcdFxuXHRcdH1cblxuXHRcdCRzY29wZS5jYW5jZWxFZGl0ID0gQWNjb3VudEZhY3RvcnkuY2FuY2VsRWRpdFxuXG5cdH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ21lcmNoYW50SWQtZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL21lcmNoYW50SWQtZWRpdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZWRpdC9tZXJjaGFudElkLWVkaXQvbWVyY2hhbnRJZC1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnTWVyY2hhbnRJZEVkaXRDdHJsJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICBcdGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTWVyY2hhbnRJZEVkaXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgJGxvY2FsU3RvcmFnZSwgQWNjb3VudEZhY3RvcnkpIHtcblxuXHRBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKXtcblx0XHRcblx0XHQvL3RvIGRpc3BsYXkgaW4gZWRpdCBmb3JtXG5cdFx0JHNjb3BlLmN1cnJlbnRQcm9wZXJ0eSA9ICRsb2NhbFN0b3JhZ2UuY3VycmVudFByb3BlcnR5XG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgZnJvbSBzZXNzaW9uXG5cdFx0JHNjb3BlLnVzZXIgPSB7fTtcblx0XHQkc2NvcGUudXNlci50Y2hvUGF5SWQgPSB1c2VyLnRjaG9QYXlJZFxuXHRcdCRzY29wZS51c2VyLmVtYWlsID0gdXNlci5lbWFpbFxuXHRcdFxuXHRcdC8vcG9wdWxhdGVkIGJ5IGVkaXQgZm9ybVxuXHRcdCRzY29wZS51c2VyLnBhc3N3b3JkXG5cblx0XHQvL1VOSVFVRSBQUk9QRVJUWSBUTyBFRElUXG5cdFx0JHNjb3BlLnVzZXIubWVyY2hhbnRJZFxuXHRcdCRzY29wZS51c2VyLnByb3BlcnR5ID0gXCJtZXJjaGFudElkXCJcblxuXHRcdC8vc3VibWl0IHRoZSBlZGl0ZWQgYWNjb3VudCBpbmZvXG5cdFx0JHNjb3BlLnN1Ym1pdEVkaXRDYXJkID0gZnVuY3Rpb24oKXtcblx0XHRcdEFjY291bnRGYWN0b3J5LnN1Ym1pdEVkaXRDYXJkKCRzY29wZS51c2VyLCAkc2NvcGUpXHRcdFx0XG5cdFx0fVxuXG5cdFx0JHNjb3BlLmNhbmNlbEVkaXQgPSBBY2NvdW50RmFjdG9yeS5jYW5jZWxFZGl0XG5cblx0fSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGFzc3dvcmQtZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL3Bhc3N3b3JkLWVkaXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2VkaXQvcGFzc3dvcmQtZWRpdC9wYXNzd29yZC1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAncGFzc3dvcmRFZGl0Q3RybCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgXHRhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ3Bhc3N3b3JkRWRpdEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCBTZXNzaW9uLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkbG9jYWxTdG9yYWdlLCBBY2NvdW50RmFjdG9yeSkge1xuXG5cdEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXHRcdFxuXHRcdGNvbnNvbGUubG9nKCRzY29wZS5yZWdpc3RyYXRpb25Gb3JtKVxuXG5cdFx0Ly90byBkaXNwbGF5IGluIGVkaXQgZm9ybVxuXHRcdCRzY29wZS5jdXJyZW50UHJvcGVydHkgPSBTZXNzaW9uLnVzZXIuZW1haWxcblx0XHQkc2NvcGUucGFzc0NoZWNrID0gZmFsc2U7XG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgZnJvbSBzZXNzaW9uXG5cdFx0JHNjb3BlLnVzZXIgPSB7fTtcblx0XHQkc2NvcGUudXNlci50Y2hvUGF5SWQgPSB1c2VyLnRjaG9QYXlJZFxuXHRcdCRzY29wZS51c2VyLmVtYWlsID0gdXNlci5lbWFpbFxuXHRcdFxuXHRcdC8vcG9wdWxhdGVkIGJ5IGVkaXQgZm9ybVxuXHRcdCRzY29wZS51c2VyLnBhc3N3b3JkXG5cdFx0JHNjb3BlLnVzZXIubmV3UGFzc3dvcmRPbmVcblx0XHQkc2NvcGUudXNlci5uZXdQYXNzd29yZFR3b1xuXHRcdCRzY29wZS51c2VyLnByb3BlcnR5ID0gXCJwYXNzd29yZFwiXG5cblx0XHQvL3N1Ym1pdCB0aGUgZWRpdGVkIGFjY291bnQgaW5mb1xuXHRcdCRzY29wZS5zdWJtaXRFZGl0Q2FyZCA9IGZ1bmN0aW9uKCl7XG5cblx0XHRcdGlmKCRzY29wZS51c2VyLm5ld1Bhc3N3b3JkT25lICE9PSAkc2NvcGUudXNlci5uZXdQYXNzd29yZFR3byl7XG5cdFx0XHRcdCRzY29wZS5wYXNzQ2hlY2sgPSB0cnVlO1xuXHRcdFx0XHRyZXR1cm5cblx0XHRcdH1cblx0XHRcdGVsc2V7XG5cdFx0XHRcdGRlbGV0ZSAkc2NvcGUudXNlci5uZXdQYXNzd29yZFR3b1xuXHRcdFx0XHRBY2NvdW50RmFjdG9yeS5zdWJtaXRFZGl0Q2FyZCgkc2NvcGUudXNlciwgJHNjb3BlKVx0XHRcdFxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0JHNjb3BlLmNhbmNlbEVkaXQgPSBBY2NvdW50RmFjdG9yeS5jYW5jZWxFZGl0XG5cblx0fSk7XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGhvbmUtZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL3Bob25lLWVkaXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2VkaXQvcGhvbmUtZWRpdC9waG9uZS1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnUGhvbmVFZGl0Q3RybCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgXHRhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1Bob25lRWRpdEN0cmwnLCBmdW5jdGlvbiAoJHNjb3BlLCAkbG9jYWxTdG9yYWdlLCBBdXRoU2VydmljZSwgJHN0YXRlLCBBY2NvdW50RmFjdG9yeSkge1xuXG5cdEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpe1xuXHRcdFxuXHRcdC8vdG8gZGlzcGxheSBpbiBlZGl0IGZvcm1cblx0XHQkc2NvcGUuY3VycmVudFByb3BlcnR5ID0gJGxvY2FsU3RvcmFnZS5jdXJyZW50UHJvcGVydHlcblx0XHRcblx0XHQvL3BvcHVsYXRlZCBmcm9tIHNlc3Npb25cblx0XHQkc2NvcGUudXNlciA9IHt9O1xuXHRcdCRzY29wZS51c2VyLnRjaG9QYXlJZCA9IHVzZXIudGNob1BheUlkXG5cdFx0JHNjb3BlLnVzZXIuZW1haWwgPSB1c2VyLmVtYWlsXG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgYnkgZWRpdCBmb3JtXG5cdFx0JHNjb3BlLnVzZXIucGFzc3dvcmRcblx0XHQkc2NvcGUudXNlci5waG9uZVxuXHRcdCRzY29wZS51c2VyLnByb3BlcnR5ID0gXCJwaG9uZVwiXG5cblx0XHQvL3N1Ym1pdCB0aGUgZWRpdGVkIGFjY291bnQgaW5mb1xuXHRcdCRzY29wZS5zdWJtaXRFZGl0Q2FyZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRBY2NvdW50RmFjdG9yeS5zdWJtaXRFZGl0Q2FyZCgkc2NvcGUudXNlciwgJHNjb3BlKVx0XHRcdFxuXHRcdH1cblxuXHRcdCRzY29wZS5jYW5jZWxFZGl0ID0gQWNjb3VudEZhY3RvcnkuY2FuY2VsRWRpdFxuXG5cdH0pO1xuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NlbGxlckFjY291bnQtZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL3NlbGxlckFjY291bnQtZWRpdCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZWRpdC9zZWxsZXJBY2NvdW50LWVkaXQvc2VsbGVyQWNjb3VudC1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnc2VsbGVyQWNjb3VudEVkaXRDdHJsJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICBcdGF1dGhlbnRpY2F0ZTogdHJ1ZVxuICAgICAgICB9XG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignc2VsbGVyQWNjb3VudEVkaXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJGxvY2FsU3RvcmFnZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgQWNjb3VudEZhY3RvcnkpIHtcblxuXHRBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKXtcblx0XHRcblx0XHQvL3RvIGRpc3BsYXkgaW4gZWRpdCBmb3JtXG5cdFx0JHNjb3BlLmN1cnJlbnRQcm9wZXJ0eSA9ICRsb2NhbFN0b3JhZ2UuY3VycmVudFByb3BlcnR5XG5cdFx0XG5cdFx0Ly9wb3B1bGF0ZWQgZnJvbSBzZXNzaW9uXG5cdFx0JHNjb3BlLnVzZXIgPSB7fTtcblx0XHQkc2NvcGUudXNlci50Y2hvUGF5SWQgPSB1c2VyLnRjaG9QYXlJZFxuXHRcdCRzY29wZS51c2VyLmVtYWlsID0gdXNlci5lbWFpbFxuXG5cdFx0Ly9wb3B1bGF0ZWQgYnkgZWRpdCBmb3JtXG5cdFx0JHNjb3BlLnVzZXIucGFzc3dvcmRcblx0XHQkc2NvcGUudXNlci5zZWxsZXJBY2NvdW50XG5cdFx0JHNjb3BlLnVzZXIucHJvcGVydHkgPSBcInNlbGxlckFjY291bnRcIlxuXG5cdFx0Ly9zdWJtaXQgdGhlIGVkaXRlZCBhY2NvdW50IGluZm9cblx0XHQkc2NvcGUuc3VibWl0RWRpdENhcmQgPSBmdW5jdGlvbigpe1xuXHRcdFx0QWNjb3VudEZhY3Rvcnkuc3VibWl0RWRpdENhcmQoJHNjb3BlLnVzZXIsICRzY29wZSlcdFx0XHRcblx0XHR9XG5cblx0XHQkc2NvcGUuY2FuY2VsRWRpdCA9IEFjY291bnRGYWN0b3J5LmNhbmNlbEVkaXRcblxuXHR9KTtcblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd3ZWJBcHBEb21haW4tZWRpdCcsIHtcbiAgICAgICAgdXJsOiAnL3dlYkFwcERvbWFpbi1lZGl0JyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9lZGl0L3dlYkFwcERvbWFpbi1lZGl0L3dlYkFwcERvbWFpbi1lZGl0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnd2ViQXBwRG9tYWluRWRpdEN0cmwnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgIFx0YXV0aGVudGljYXRlOiB0cnVlXG4gICAgICAgIH1cbiAgICB9KTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCd3ZWJBcHBEb21haW5FZGl0Q3RybCcsIGZ1bmN0aW9uICgkc2NvcGUsICRsb2NhbFN0b3JhZ2UsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsIEFjY291bnRGYWN0b3J5KSB7XG5cblx0QXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcil7XG5cdFx0XG5cdFx0Ly90byBkaXNwbGF5IGluIGVkaXQgZm9ybVxuXHRcdCRzY29wZS5jdXJyZW50UHJvcGVydHkgPSAkbG9jYWxTdG9yYWdlLmN1cnJlbnRQcm9wZXJ0eVxuXHRcdFxuXHRcdC8vcG9wdWxhdGVkIGZyb20gc2Vzc2lvblxuXHRcdCRzY29wZS51c2VyID0ge307XG5cdFx0JHNjb3BlLnVzZXIudGNob1BheUlkID0gdXNlci50Y2hvUGF5SWRcblx0XHQkc2NvcGUudXNlci5lbWFpbCA9IHVzZXIuZW1haWxcblxuXHRcdC8vcG9wdWxhdGVkIGJ5IGVkaXQgZm9ybVxuXHRcdCRzY29wZS51c2VyLnBhc3N3b3JkXG5cdFx0JHNjb3BlLnVzZXIud2ViQXBwRG9tYWluXG5cdFx0JHNjb3BlLnVzZXIucHJvcGVydHkgPSBcIndlYkFwcERvbWFpblwiXG5cblx0XHQvL3N1Ym1pdCB0aGUgZWRpdGVkIGFjY291bnQgaW5mb1xuXHRcdCRzY29wZS5zdWJtaXRFZGl0Q2FyZCA9IGZ1bmN0aW9uKCl7XG5cdFx0XHRBY2NvdW50RmFjdG9yeS5zdWJtaXRFZGl0Q2FyZCgkc2NvcGUudXNlciwgJHNjb3BlKVx0XHRcdFxuXHRcdH1cblxuXHRcdCRzY29wZS5jYW5jZWxFZGl0ID0gQWNjb3VudEZhY3RvcnkuY2FuY2VsRWRpdFxuXG5cdH0pO1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFNlY3Rpb24nLCBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG5hbWU6ICdAJyxcbiAgICAgICAgICAgIHZpZGVvczogJz0nLFxuICAgICAgICAgICAgYmFja2dyb3VuZDogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvdHV0b3JpYWwvdHV0b3JpYWwtc2VjdGlvbi90dXRvcmlhbC1zZWN0aW9uLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuY3NzKHsgYmFja2dyb3VuZDogc2NvcGUuYmFja2dyb3VuZCB9KTtcbiAgICAgICAgfVxuICAgIH07XG59KTsiLCJhcHAuZGlyZWN0aXZlKCd0dXRvcmlhbFNlY3Rpb25NZW51JywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHJlcXVpcmU6ICduZ01vZGVsJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy90dXRvcmlhbC90dXRvcmlhbC1zZWN0aW9uLW1lbnUvdHV0b3JpYWwtc2VjdGlvbi1tZW51Lmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgc2VjdGlvbnM6ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJzLCBuZ01vZGVsQ3RybCkge1xuXG4gICAgICAgICAgICBzY29wZS5jdXJyZW50U2VjdGlvbiA9IHNjb3BlLnNlY3Rpb25zWzBdO1xuICAgICAgICAgICAgbmdNb2RlbEN0cmwuJHNldFZpZXdWYWx1ZShzY29wZS5jdXJyZW50U2VjdGlvbik7XG5cbiAgICAgICAgICAgIHNjb3BlLnNldFNlY3Rpb24gPSBmdW5jdGlvbiAoc2VjdGlvbikge1xuICAgICAgICAgICAgICAgIHNjb3BlLmN1cnJlbnRTZWN0aW9uID0gc2VjdGlvbjtcbiAgICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHNlY3Rpb24pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICB9XG4gICAgfTtcbn0pOyIsImFwcC5kaXJlY3RpdmUoJ3R1dG9yaWFsVmlkZW8nLCBmdW5jdGlvbiAoJHNjZSkge1xuXG4gICAgdmFyIGZvcm1Zb3V0dWJlVVJMID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiAnaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvJyArIGlkO1xuICAgIH07XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0UnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL3R1dG9yaWFsL3R1dG9yaWFsLXZpZGVvL3R1dG9yaWFsLXZpZGVvLmh0bWwnLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdmlkZW86ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcbiAgICAgICAgICAgIHNjb3BlLnRydXN0ZWRZb3V0dWJlVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoZm9ybVlvdXR1YmVVUkwoc2NvcGUudmlkZW8ueW91dHViZUlEKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7IiwiYXBwLmRpcmVjdGl2ZSgncGF5RnJhbWUnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIENoZWNrb3V0RmFjdG9yeSwgQVVUSF9FVkVOVFMsICRzdGF0ZSwgJGh0dHApIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9pZnJhbWUvaWZyYW1lLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICBcdC8vQXV0aGVudGljYXRlIERvbWFpblxuXHRcdCAgICBzY29wZS5lbnRlcmluZm8gPSB0cnVlO1xuXG4gICAgICAgIFx0Y29uc29sZS5sb2coXCJwcmVsaXN0ZW5lclwiKVxuXG4gICAgICAgIFx0dmFyIGNvbW1Eb21haW4gXG5cblxuICAgICAgICBcdFxuICAgICAgICBcdC8vY29tbXVuaWNhdGlvbiBiZXR3ZWVuIHdlYiBhcHAgYW5kIGlmcmFtZVxuICAgICAgICBcdGZ1bmN0aW9uIHJlY2VpdmVNZXNzYWdlKGV2ZW50KVxuXHRcdFx0e1x0XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiSUZSQU1FIENPTU1VTklDQVRJT04gTElWRVwiLCBldmVudClcblx0XHRcdFxuXG5cdFx0XHRcdGlmKGV2ZW50Lm9yaWdpbiA9PT0gY29tbURvbWFpbiAmJiBldmVudC5kYXRhLmhhc093blByb3BlcnR5KFwicmVzXCIpKXtcblx0XHQgICAgICAgIFx0c2NvcGUuYXV0aG9yaXppbmcgPSBmYWxzZTtcblx0XHQgICAgICAgIFx0c2NvcGUucGF5bWVudHByb2Nlc3NlZCA9IHRydWU7XG5cdFx0ICAgICAgICBcdHNjb3BlLiRhcHBseSgpO1xuXHRcdCAgICAgICAgXHRjb25zb2xlLmxvZyhcImluIHJlc29sdmVcIilcblx0XHRcdFx0XHRyZXR1cm4gXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb21tRG9tYWluID0gZXZlbnQub3JpZ2luXG5cblxuXG5cdFx0XHRcdC8vQ29udHJvbGxlciBhY2Nlc3NlcyBwYXJlbnQgd2luZG93IGFuZCBhc3NpZ25zIGJ1dHRvbiBjb250YWluZXIgXG5cdFx0XHQgICAgLy9kYXRhLWF0dHJpYnV0ZXMgdG8gc2NvcGUgdmFyaWFibGVzXG5cdFx0XHQgICAgc2NvcGUuaWZyYW1lLmNoYXJnZUFtb3VudCA9IGV2ZW50LmRhdGEuY2hhcmdlQW1vdW50XG5cdFx0XHQgICAgc2NvcGUuaWZyYW1lLnRyYW5zYWN0aW9uSGFzaFZhbHVlPSBldmVudC5kYXRhLnRyYW5zYWN0aW9uSGFzaFZhbHVlXG5cdFx0XHQgICAgc2NvcGUuaWZyYW1lLmFwaUtleSA9IGV2ZW50LmRhdGEuYXBpS2V5XG5cdFx0ICAgICAgICBzY29wZS5pZnJhbWUudGltZXN0YW1wID0gZXZlbnQuZGF0YS50aW1lc3RhbXBcblx0XHQgICAgICAgIHNjb3BlLiRhcHBseSgpO1xuXG5cdFx0ICAgIFxuXG5cblxuXG5cdFx0XHRcdFxuXG5cblx0XHRcdFx0Ly8gdmFyIG9yaWdpbiA9IHtcblx0XHRcdFx0Ly8gXHRpbmN1bWJlbnREb21haW46IGV2ZW50Lm9yaWdpblxuXHRcdFx0XHQvLyB9XG5cdFx0XHQgLy8gIC8vIERvIHdlIHRydXN0IHRoZSBzZW5kZXIgb2YgdGhpcyBtZXNzYWdlPyAgKG1pZ2h0IGJlXG5cdFx0XHQgLy8gIC8vIGRpZmZlcmVudCBmcm9tIHdoYXQgd2Ugb3JpZ2luYWxseSBvcGVuZWQsIGZvciBleGFtcGxlKS5cblx0XHRcdFx0Ly8gJGh0dHAucG9zdChcImFwaS9jaGVja291dC9jb21tLWV2YWxcIiwgb3JpZ2luKS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cblx0XHRcdFx0Ly8gICBjb25zb2xlLmxvZyhcImluY3VtYmVudCBldmFsIHJlc3BvbnNlOlwiLCByZXNwb25zZSlcblx0XHRcdFx0ICBcblx0XHRcdFx0ICAvLyBpZihyZXNwb25zZS5kYXRhID09PSB0cnVlKXtcblx0XHRcdFx0Ly8gICAvLyBldmVudC5zb3VyY2UgaXMgcG9wdXBcblx0XHRcdFx0Ly8gICAvLyBldmVudC5kYXRhIGlzIFwiaGkgdGhlcmUgeW91cnNlbGYhICB0aGUgc2VjcmV0IHJlc3BvbnNlIGlzOiByaGVlZWVldCFcIlxuXHRcdFx0XHQvLyAgIFx0XHRjb25zb2xlLmxvZyhcInRjaG9wYXkgZXZhbHVhdGVkIGluY3VtYmVudCBhcyB0cnVlXCIpXG5cblx0XHRcdFx0ICBcdFx0Ly8gdmFyIHBhcmVudFdpbmRvdyA9IHdpbmRvdy5wYXJlbnQ7XG5cblx0XHRcdFx0ICBcdFx0Ly8gcGFyZW50V2luZG93LnBvc3RNZXNzYWdlKFwiUkVTUE9OU0UgQ09OVEFDVCBGUk9NIElGUkFNRSBCQUNLIFRPIFdFQkFQUFwiLCAnaHR0cDovL2xvY2FsaG9zdDoxMzM4LycpO1xuXHRcdFx0XHQvLyAgIFx0XHQvLyBjb25zb2xlLmxvZyhldmVudC5kYXRhKVxuXG5cdFx0XHRcdC8vICAgfWVsc2V7XG5cdFx0XHRcdCAgXHRcdFxuXHRcdFx0XHQvLyAgIH1cblxuXG5cdFx0XHRcdC8vIH0pXG5cdFx0XHR9XG5cdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgcmVjZWl2ZU1lc3NhZ2UsIGZhbHNlKTtcblxuXG5cblxuICAgICAgICBcdC8vRk9SIFRFU1RJTkc6IGJlY2F1c2Ugb2YgbmVzdGVkIGluZGV4Lmh0bWxcbiAgICAgICAgXHQkKFwiI2NoZWNrb3V0LWJ1dHRvblwiKS5yZW1vdmUoKVxuXG5cbiAgICAgICAgXHRjb25zb2xlLmxvZyhcInRoZSBpZnJhbWUgZGlyZWN0aXZlIGxpbmsgaXMgcnVubmluZ1wiKVxuXG4gICAvLyAgICAgXHRcdC8vQlVJTERJTkcgVEhFIFRSQU5TQUNUSU9OIE9CSkVDVCAoU0VORCBUTyBUQ0hPUEFZKVxuXG5cdFx0XHQvLyB2YXIgYXBpUHVibGljS2V5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0Y2hvcGF5LXNjcmlwdFwiKS5nZXRBdHRyaWJ1dGUoXCJkYXRhLWtleVwiKVxuXHRcdFx0Ly8gdmFyIGFtb3VudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGNob3BheS1zY3JpcHRcIikuZ2V0QXR0cmlidXRlKFwiZGF0YS1hbW91bnRcIilcblx0XHRcdC8vIHZhciB0aW1lc3RhbXBlZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGNob3BheS1zY3JpcHRcIikuZ2V0QXR0cmlidXRlKFwiZGF0YS10aW1lc3RhbXBcIilcblx0XHRcdC8vIHZhciB0cmFuc2FjdGlvbkhhc2ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRjaG9wYXktc2NyaXB0XCIpLmdldEF0dHJpYnV0ZShcImRhdGEtdHJhbnNhY3Rpb25oYXNodmFsdWVcIilcblxuXG5cdFx0XHQvL2NoZWNrb3V0Q29tcGxldGUgZnVuY3Rpb24gdG8gY2FsbCBvbiB0cmFuc2FjdGlvbiBvdXRjb21lXG5cdFx0XHQvLyB3aW5kb3cucGFyZW50LmNoZWNrb3V0Q29tcGxldGVcblxuXHRcdFx0Ly8gY29uc29sZS5sb2codGltZXN0YW1wKVxuXHRcdFx0Ly8gY29uc29sZS5sb2codHJhbnNBdXRoSWQpXG5cdFx0XHRcblx0XG5cblx0XHRcdC8vIGNvbnNvbGUubG9nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGNob3BheS1zY3JpcHRcIikpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhhbW91bnQpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyhhcGlQdWJsaWNLZXkpXG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aW1lc3RhbXBlZClcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRyYW5zYWN0aW9uSGFzaClcblxuXHRcdFxuXG5cdFx0ICAgXG5cdFx0ICAgIC8vQnVpbGQgVHJhbnNhY3Rpb24gT2JqZWN0IFNjYWZmb2xkXG5cdFx0ICAgIHNjb3BlLmlmcmFtZSA9IHt9O1xuXG5cdFx0ICAgIFxuXHRcdCAgICAvLyBzY29wZS5pZnJhbWUud2ViQXBwRG9tYWluID0gXCJodHRwOi8vbG9jYWxob3N0OjEzMzdcIlxuXHRcdCAgICAvLyBpZihhbmd1bGFyLmVsZW1lbnQod2luZG93LnBhcmVudC53aW5kb3cubG9jYXRpb24pWzBdWydvcmlnaW4nXSA9PT0gc2NvcGUuaWZyYW1lLndlYkFwcERvbWFpbikgc2NvcGUuZW50ZXJpbmZvID0gdHJ1ZTtcblx0XHQgICAgLy8gaWYoYW5ndWxhci5lbGVtZW50KHdpbmRvdy5wYXJlbnQud2luZG93LmxvY2F0aW9uKVswXVsnb3JpZ2luJ10gIT09IHNjb3BlLmlmcmFtZS53ZWJBcHBEb21haW4pIHNjb3BlLm1lcmNoYW50ZXJyb3IgPSB0cnVlO1xuXHRcdCAgICBcblx0XHQgICAgLy9TdGF0ZSBDaGFuZ2VzIChuZy1pZikgQWxsIGZhbHNleSB2YWx1ZXMuXG5cdFx0ICAgIHNjb3BlLmF1dGhvcml6aW5nIFxuXHRcdCAgICBzY29wZS5tZXJjaGFudGVycm9yXG5cdFx0ICAgIHNjb3BlLnBheW1lbnRlcnJvclxuXHRcdCAgICBzY29wZS5wYXltZW50cHJvY2Vzc2VkXG5cblx0XHRcdCAgICAvL2hpZGUgbmF2YmFyXG5cdFx0XHQgICAgLy8gYW5ndWxhci5lbGVtZW50KHdpbmRvdy5kb2N1bWVudFsnYm9keSddWydjaGlsZE5vZGVzJ11bMV0pLnJlbW92ZSgpXG5cblx0XHQgICAgXG5cblx0ICAgICAgICAvLyBjb25zb2xlLmxvZyhcImlmcmFtZSBvYmplY3RcIiwgc2NvcGUuaWZyYW1lKVxuXG5cblxuXHRcdCAgICAvL1B1bGwgcmVzdCBvZiBwcm9wZXJ0aWVzIGZyb20gaWZyYW1lXG5cdFx0ICAgIHNjb3BlLmlmcmFtZS5idXllckFjY291bnRcblx0XHQgICAgc2NvcGUuaWZyYW1lLnBpblxuXG5cdFx0ICAgIC8vR2V0IGJ1eWVyIGxvY2F0aW9uXG5cdFx0ICAgIG5hdmlnYXRvci5nZW9sb2NhdGlvbi5nZXRDdXJyZW50UG9zaXRpb24oZnVuY3Rpb24oZ2VvKXtcblx0XHQgICAgICAgIGNvbnNvbGUubG9nKGdlbylcblx0XHQgICAgICAgIHNjb3BlLmlmcmFtZS5sb2NhdGlvbiA9IGdlb1xuXHRcdCAgICB9KSAgICBcblxuXHRcdCAgICAvLyBjb25zb2xlLmxvZygkKHdpbmRvdy5wYXJlbnQpKVxuXHRcdCAgICBcblxuXG5cdFx0ICAgIC8vIHNjb3BlLmNsb3NlSWZyYW1lID0gZnVuY3Rpb24oKXtcblxuXHRcdCAgICAvLyBcdGNvbnNvbGUubG9nKFwieW91IGp1c3QgY2xpY2tlZCB0aGUgY2xvc2UgYnV0dG9uXCIpXG5cdFx0ICAgIFx0XG5cdFx0ICAgIC8vIFx0Ly8gJCh3aW5kb3cucGFyZW50LndpbmRvdy5kb2N1bWVudC5hbGxbNDVdKS5hbmltYXRlKHt0b3A6IFwiMTAwJVwiLCBvcGFjaXR5OiAwfSwgNTAwLCAnZWFzZUluT3V0QmFjaycpXG5cdFx0ICAgIC8vIFx0JCh3aW5kb3cucGFyZW50LndpbmRvdy5kb2N1bWVudC5hbGxbNDZdKS5hbmltYXRlKHt0b3A6IFwiMTAwJVwiLCBvcGFjaXR5OiAwfSwgNTAwLCAnZWFzZUluT3V0QmFjaycpO1xuXHRcdCAgICAvLyBcdHZhciBjbG9zZSA9IGZ1bmN0aW9uKCl7XG5cdFx0ICAgIC8vIFx0XHQkKHdpbmRvdy5wYXJlbnQud2luZG93LmRvY3VtZW50LmFsbFs0Nl0pLnJlbW92ZSgpXG5cdFx0ICAgIC8vIFx0XHQvL1RPIERPIFJFTU9WRSBCQUNLR1JPVU5EIERJVlxuXHRcdCAgICAvLyBcdFx0Ly8gJCh3aW5kb3cucGFyZW50LndpbmRvdy5kb2N1bWVudC5jaGlsZHJlblswXS5jaGlsZHJlblsyXS5jb250ZXh0KS5yZW1vdmUoKVxuXHRcdCAgICAvLyBcdH1cblx0XHQgICAgLy8gXHRzZXRUaW1lb3V0KGNsb3NlLCA5MDApXG5cdFx0ICAgIC8vIH1cblxuXHRcdCAgICAvLyAudG9nZ2xlQ2xhc3MoXCJpZnJhbWUtZmFkZWluIGlmcmFtZS1mYWRlb3V0XCIpXG5cblxuXG5cdFx0ICAgIHNjb3BlLnNvbWVGdW5jID0gZnVuY3Rpb24oKXtcblx0XHQgICAgICAgIC8vY3JlYXRlIGEgSlNPTiBvYmplY3QgZnJvbSB0aGlzXG5cdFx0ICAgICAgICAvL3NlbmQgYXBpIGNhbGwgdG8gYmFja2VuZCwgY3JlYXRlIGFuZCBzYXZlIGEgZGF0YWJhc2Ugb2JqZWN0IFxuXHRcdCAgICAgICAgLy90YWtlIEFQSSBrZXkgYW5kIHNlYXJjaCBkYXRhYmFzZVxuXG5cdFx0ICAgICAgICAvL3NldCB0aW1lc3RhbXAgb24gdHJhbnNhY3Rpb25cblx0XHQgICAgICAgIC8vT1VUREFURUQgd2l0aCBuZXcgdHJhbnNhdXRoIGhhc2hcblx0XHQgICAgICAgIC8vIHNjb3BlLmlmcmFtZS50aW1lc3RhbXAgPSBEYXRlLm5vdygpLnRvU3RyaW5nKClcblx0XHQgICAgICAgIFxuXHRcdCAgICAgICAgLy9oaWRlIGVudGVyaW5mbyBzaG93IGF1dGhvcml6aW5nIHRyYW5zYWN0aW9uXG5cdCAgICAgICAgXHRzY29wZS5lbnRlcmluZm8gPSBmYWxzZTtcblx0ICAgICAgICBcdHNjb3BlLmF1dGhvcml6aW5nID0gdHJ1ZTtcblxuXHRcdCAgICAgICAgY29uc29sZS5sb2coXCJ0cmFuc2FjdGlvbiBvYmplY3QgdG8gYmUgc3VibWl0dGVkIHRvIGRhdGFiYXNlXCIsIHNjb3BlLmlmcmFtZSlcblxuXHRcdCAgICAgICAgLy9vbmNlIG91dGNvbWUgcmV0dXJucyBmcm9tIGJhY2sgZW5kLCB3ZSBjb21tdW5pY2F0ZSB0byBtZXJjaGFudCBhcHBcblxuXHRcdCAgICAgICAgdmFyIHBhcmVudFdpbmRvdyA9IHdpbmRvdy5wYXJlbnQ7XG5cblx0XHQgIFx0XHRwYXJlbnRXaW5kb3cucG9zdE1lc3NhZ2UoXCJUUkFOU0FDVElPTiBPVVRDT01FIEZST00gSUZSQU1FXCIsIGNvbW1Eb21haW4pO1xuXHQgICAgICAgIFx0XG5cdCAgICAgICAgXHQvLyBWYWxpZGF0ZSBXZWIgQXBwIEFwaSBLZXkgYW5kIFNlY3JldFxuXHQgICAgICAgIFx0dmFyIHN1Ym1pdFRyYW5zYWN0aW9uID0gZnVuY3Rpb24odHJhbnNhY3Rpb25PYmplY3Qpe1xuXHRcdFx0XHRcdC8vTk9URSBPTiBIVFRQIFJFUVVFU1QgSU4gQ09OVFJPTExFUlxuXHRcdFx0XHRcdC8vdGhlIHNlY3VyaXR5IGdhaW5zIGJ5IGhhdmluZyB0aGlzIGNhbGwgaW4gdGhlIGNvbnRyb2xsZXIgb3V0bWF0Y2ggZ2FpbnMgb2YgbW9kdWxhcml0eVxuXHRcdFx0XHRcdC8vYnkgaGF2aW5nIHRoaXMgY2FsbCBoZXJlLCB3ZSBhcmUgYWJsZSB0byBwYXNzIHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gZGlyZWN0bHkgaW50byBvdXIgY2FsbFxuXHRcdFx0XHRcdC8vd2l0aCB0aGUgc21hbGxlc3QgY2hhbmNlIG9mIGl0cyB2YWx1ZSBiZWluZyBtYW5pcHVsYXRlZCBiZWZvcmUgc3VibWlzc2lvblxuXHRcdFx0XHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2NoZWNrb3V0L3ZhbGlkYXRlJywgXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdHRyYW5zYWN0aW9uT2JqZWN0OiB0cmFuc2FjdGlvbk9iamVjdCwgXG5cdFx0XHRcdFx0XHRcdGJyb3dzZXJEb21haW46IGNvbW1Eb21haW5cblxuXHRcdFx0XHRcdFx0fSkudGhlbihmdW5jdGlvbihyZXNwb25zZSl7XG5cdFx0XHRcdFx0XHRcdC8vVE8gRE9cblxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInRjaG9wYXkgaWZyYW1lIHJlY2VpdmVkIG91dGNvbWUgb2JqZWN0IGZyb20gdGNob3BheSBiYWNrIGVuZDogXCIsIHJlc3BvbnNlLmRhdGEpXG5cblx0XHRcdFx0XHRcdFx0cGFyZW50V2luZG93LnBvc3RNZXNzYWdlKHJlc3BvbnNlLmRhdGEsIGNvbW1Eb21haW4pO1xuXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBzY29wZS5pZnJhbWU7XG5cdFx0XHRcdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0fVxuXHRcdFx0XHRzdWJtaXRUcmFuc2FjdGlvbihzY29wZS5pZnJhbWUpXG5cblx0XHQgICAgfVxuICAgICAgICB9XG4gICAgfVxufSkiLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0Fib3V0Jywgc3RhdGU6ICdhYm91dCcgfSxcbiAgICAgICAgICAgICAgICAvLyB7IGxhYmVsOiAnUmVnaXN0ZXInLCBzdGF0ZTogJ3NpZ251cCd9XG4gICAgICAgICAgICAgICAgLy8geyBsYWJlbDogJ1R1dG9yaWFsJywgc3RhdGU6ICd0dXRvcmlhbCcgfSxcbiAgICAgICAgICAgICAgICAvLyB7IGxhYmVsOiAnTWVtYmVycyBPbmx5Jywgc3RhdGU6ICdtZW1iZXJzT25seScsIGF1dGg6IHRydWUgfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgIC8vICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7IiwiYXBwLmRpcmVjdGl2ZSgncmFuZG9HcmVldGluZycsIGZ1bmN0aW9uIChSYW5kb21HcmVldGluZ3MpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmFuZG8tZ3JlZXRpbmcvcmFuZG8tZ3JlZXRpbmcuaHRtbCcsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSkge1xuICAgICAgICAgICAgc2NvcGUuZ3JlZXRpbmcgPSBSYW5kb21HcmVldGluZ3MuZ2V0UmFuZG9tR3JlZXRpbmcoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==