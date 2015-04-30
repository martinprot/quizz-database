// public/js/appRoutes.js

var routeModule = angular.module('appRoutes', ['LoginModule', 'QuestionModule']);

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
            templateUrl: 'views/quizzlist.html',
            controller: 'QuizzListController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        // Quizz list
        .when('/quizz/new', {
            templateUrl: 'views/quizz.html',
            controller: 'QuizzController',
            data: {
				restricted: AUTH_RESTRICTION.user
            },
            resolve: {
				quizz: function(){return null;}
			}
        })
        .when('/quizz/:quizz_id', {
            templateUrl: 'views/quizz.html',
            controller: 'QuizzController',
            data: {
				restricted: AUTH_RESTRICTION.user
            },
            resolve: {
				quizz: function($route, QuizzService) {
					// The $routeParams is updated only after a route is changed. So using $route
					return QuizzService.getQuizz($route.current.params.quizz_id).then(function(result) {
						return result.data;
					});
				}
			}
        })
        .when('/quizz/:quizz_id/question', {
            templateUrl: 'views/questions.html',
            controller: 'QuestionListController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        // Question list
        .when('/question', {
            templateUrl: 'views/questions.html',
            controller: 'QuestionListController',
            data: {
				restricted: AUTH_RESTRICTION.user
            }
        })
        // new Question 
        .when('/quizz/:quizz_id/question/new', {
            templateUrl: 'views/question.html',
            controller: 'QuestionController',
            data: {
				restricted: AUTH_RESTRICTION.user
            },
            resolve: {
				question: function(){return null;}
			}
        })
        .when('/question/new', {
            templateUrl: 'views/question.html',
            controller: 'QuestionController',
            data: {
				restricted: AUTH_RESTRICTION.user
            },
            resolve: {
				question: function(){return null;}
			}
        })
        // Question edit
        .when('/question/:question_id', {
            templateUrl: 'views/question.html',
            controller: 'QuestionController',
            data: {
				restricted: AUTH_RESTRICTION.user
            },
            resolve: {
				question: function($route, QuestionService) {
					// The $routeParams is updated only after a route is changed. So using $route
					return QuestionService.get($route.current.params.question_id).then(function(result) {
						return result.data;
					});
				}
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
