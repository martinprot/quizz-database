// public/js/appRoutes.js

var routeModule = angular.module('appRoutes', []);

routeModule.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider
        // home page
        .when('/quizz', {
            templateUrl: 'views/quizz.html',
            controller: 'QuizzController'
        })

        // // nerds page that will use the NerdController
        // .when('/questions', {
        //     templateUrl: 'views/questions.html',
        //     controller: 'QuestionController'
        // });
        .otherwise({
        	redirectTo: '/'
      	});

    $locationProvider.html5Mode(true);

}]);
