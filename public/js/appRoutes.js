// public/js/appRoutes.js

var routeModule = angular.module('appRoutes', ['LoginModule']);

routeModule.config(function($routeProvider, $locationProvider, AUTH_RESTRICTION) {

    $routeProvider
    	.when('/login', {
    		templateUrl: 'views/login.html',
    		controller: 'LoginController',
            data: {
				restricted: AUTH_RESTRICTION.none
            }
    	})
        // Quizz list
        .when('/quizz', {
            templateUrl: 'views/quizz.html',
            controller: 'QuizzController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        .when('/quizz/:quizz_id/question', {
            templateUrl: 'views/questions.html',
            controller: 'QuestionController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        // Question list
        .when('/question', {
            templateUrl: 'views/questions.html',
            controller: 'QuestionController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        .otherwise({
        	redirectTo: '/'
      	});

    $locationProvider.html5Mode(true);

});

routeModule.run(function ($rootScope, $location, $cookieStore, AuthService, AUTH_EVENTS) {
	$rootScope.$on('$routeChangeStart', function (event, next) {
		if(next.data) {
			var restriction = next.data.restricted;
			if (!AuthService.isAuthorized(restriction)) {
				event.preventDefault();
				if (AuthService.isAuthenticated()) {
					// user is not allowed
					$rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
					console.log(AUTH_EVENTS.notAuthorized);
				} else {
					// user is not logged in
					$rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
					console.log(AUTH_EVENTS.notAuthenticated);
					$location.path("/login");
				}
			}
		} // no data, no problem
	});
});
