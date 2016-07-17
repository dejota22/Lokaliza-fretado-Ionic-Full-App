angular.module('starter')

.service('AuthService', function($q, $http, USER_ROLES) {
  var LOCAL_TOKEN_KEY = '345';
  var username = '';
  var isAuthenticated = false;
  var role = 'admin';
  var authToken;
  var url_api = 'https://assemblysystems.com.br/localiza/';

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      useCredentials(token);
    }
  }

  function storeUserCredentials(token) {
     
    window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
   
    useCredentials(token);
  }

  function useCredentials(token) {
  
    username = token.nome;
    isAuthenticated = true;
    authToken = token;

    if (token.role == 'coordenadores') {
      role = USER_ROLES.admin
       window.localStorage.setItem('role','true');
       window.localStorage.setItem('fretado',token.fretado);
       window.localStorage.setItem('coordenador',token.nome);
       window.localStorage.setItem('id',token.id);
    }
    if (token.role == 'user') {
      role = USER_ROLES.public
       window.localStorage.setItem('role','false');
    }

    // Set the token as header for your requests!
   // $http.defaults.headers.common['X-Auth-Token'] = token;
  }

  function destroyUserCredentials() {
    authToken = undefined;
    username = '';
    isAuthenticated = false;
    $http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(name, pw) {
    return $q(function(resolve, reject) {


         $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
       var link = url_api+'api/user/login/';

       $http.post(link, {user : name,senha:pw}).then(function (res){
            var response = res.data;
              if(response == '"erro"'){
                reject('Login Failed.');
              
              }else{
                console.log(response);
             storeUserCredentials(response);
              resolve('Login success.');
              }

        });

    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };


  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
   isAuthenticated: function() {return isAuthenticated;},
    username: function() {return username;},
    role: function() {return role;}
  };
})


.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
