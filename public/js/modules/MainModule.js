// public/js/controllers/MainModule.js
var mainModule = angular.module('MainModule', []);

mainModule.controller('MainController', function($rootScope, $scope, AuthService, Session) {
	$scope.currentUser = null;

	$scope.setCurrentUser = function(user) {
		$scope.currentUser = user;
	}
	
	// When app is up, refresh the session
	if(Session.token) {
		AuthService.refreshSession().success(function(user) {
			$scope.setCurrentUser(user);
		});
	}

	$scope.disconnectUser = function() {
		console.log("test");
		AuthService.disconnect();
		$scope.setCurrentUser(null);
	}
});
