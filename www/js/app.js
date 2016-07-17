// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic','ngCordova'])
// bower install angular-mocks --save
// <script src="lib/angular-mocks/angular-mocks.js"></script>
// https://docs.angularjs.org/api/ngMockE2E
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function ($stateProvider, $urlRouterProvider, USER_ROLES) {
  $stateProvider
  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })
  .state('main', {
    url: '/',
    abstract: true,
    templateUrl: 'templates/main.html',
    controller: 'MenuCtrl'
  })
  .state('main.dash', {
    url: 'main/dash',
    views: {
        'dash-tab': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashCtrl'
        }
    }
  })
  .state('main.capital', {
    url: 'main/capital',
    views: {
        'capital-tab': {
          templateUrl: 'templates/capital.html',
          controller: 'DashCtrl'
        }
    }
  })
    .state('modal', {
    url: '/modal',
    templateUrl: 'templates/cadastro.html',
    controller: 'CadastroCtrl'
  })
    
   .state('main.litoral', {
    url: 'main/litoral',
    views: {
        'litoral-tab': {
          templateUrl: 'templates/litoral.html',
          controller: 'DashCtrl'
        }
    }
  })
   .state('main.interior', {
    url: 'main/interior',
    views: {
        'interior-tab': {
          templateUrl: 'templates/interior.html',
          controller: 'DashCtrl'
        }
    }
  })
   .state('main.mapa', {
    url: 'main/mapa',
    views: {
        'mapa-tab': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
    }
  })
.state('main.mapa_user', {
    url: 'main/mapa_user',
    views: {
        'mapa_user-tab': {
          templateUrl: 'templates/mapa_user.html',
          controller: 'MapCtrl'
        }
    }
  })
  .state('main.admin', {
    url: 'main/admin',
    views: {
        'admin-tab': {
          templateUrl: 'templates/admin.html',
          controller: 'AdminCtrl'
        }
    },
    data: {
      authorizedRoles: [USER_ROLES.admin]
    }
  });
  $urlRouterProvider.otherwise(function($injector, $location){
      var $state = $injector.get("$state");
      $state.go('login');
  });
  //$urlRouterProvider.otherwise('/main/dash');
})



.run(function ($rootScope, $state, AuthService, AUTH_EVENTS) {
  $rootScope.$on('$stateChangeStart', function (event,next, nextParams, fromState) {

    if ('data' in next && 'authorizedRoles' in next.data) {
      var authorizedRoles = next.data.authorizedRoles;
      if (!AuthService.isAuthorized(authorizedRoles)) {
        event.preventDefault();
        $state.go($state.current, {}, {reload: true});
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      }
    }

    if (!AuthService.isAuthenticated()) {
      if (next.name !== 'login') {
        event.preventDefault();
        $state.go('login');
      }
    }
  });
});
