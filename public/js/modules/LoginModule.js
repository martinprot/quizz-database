// public/js/controllers/LoginController.js
var loginModule = angular.module('LoginModule', []);

loginModule.constant('AUTH_EVENTS', {
  loginSuccess: 	'auth-login-success',
  loginFailed: 		'auth-login-failed',
  logoutSuccess: 	'auth-logout-success',
  sessionTimeout: 	'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 	'auth-not-authorized'
});

loginModule.constant('AUTH_RESTRICTION', {
  none:		0,
  user:		1,
  admin:	2
});

loginModule.controller('LoginController', function($scope, $rootScope, $location, AUTH_EVENTS, AuthService) {
	// initialisation
	$scope.credentials = {
		email: "",
		password: ""
	};
	
	$scope.login = function(credentials) {
		if(!credentials.email) 			$scope.message = "Merci d'entrer votre email.";
		else if(!credentials.password) 	$scope.message = "Merci d'entrer votre mot de passe.";
		else {
			AuthService.login({email: credentials.email, passwd: credentials.password}).then(
				function (response) {
					$rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
					$scope.setCurrentUser(response.data);
					$location.path("/");
			    },
			    function () {
					$rootScope.$broadcast(AUTH_EVENTS.loginFailed);
				});
		}
	}
});


loginModule.factory('AuthService', function($http, Session, AUTH_RESTRICTION) {
	var authService = {};
	// here, we pre-declare it because authService is used in one of its methods

	// login
	authService.login = function(credentials) {
		return $http.post("/api/session", credentials).success( function(user) {
			Session.create(user.token, user._id, user.isAdmin);
			return user;
		});
	};
	
	// loginWithToken
	authService.refreshSession = function() {
		return $http.get("/api/session").success( function(user) {
			Session.create(user.token, user._id, user.isAdmin);
			return user;
		});
	};
	
	// disconnect
	authService.disconnect = function() {
		return $http.delete("/api/session", {access_token: Session.token}).success( function(user) {
			Session.destroy();
		});
	};
	
	// isAuthenticated
	authService.isAuthenticated = function() {
		return !!Session.userId; // Session.userId => object  !Session.userId => 0  !!Session.userId => 1
	};
	
	// isAuthorized
	authService.isAuthorized = function(restriction) {
		if(restriction == AUTH_RESTRICTION.user)
			return authService.isAuthenticated();
		else if(restriction == AUTH_RESTRICTION.admin)
			return authService.isAuthenticated() && Session.isAdmin;
		else
			return true;
	}
	
	return authService;
});


loginModule.service('Session', function($cookieStore, $http) {
	this.create = function(token, userId, isAdmin) {
		this.token 		= token;
		this.userId		= userId;
		this.isAdmin	= isAdmin;
		
		$cookieStore.put('qfSession', this);
		$http.defaults.headers.common['Authorization'] = "Bearer " + token;
	}
	this.destroy = function() {
		this.token 		= null;
		this.userId		= null;
		this.isAdmin	= false;
		
		$cookieStore.remove('qfSession');
		$http.defaults.headers.common['Authorization'] = null;
	}
	return this;
});

// Recover Session after refresh
loginModule.run(function ($http, $cookieStore, Session) {
	var session = $cookieStore.get('qfSession');
	if(!!session) {
		Session.create(session.token, session.userId, session.isAdmin);
	}
});
