// public/js/controllers/QuizzController.js
var controller = angular.module('QuizzController', []);

controller.controller('QuizzController', function($scope, Quizz) {
	
    $scope.title = 'Liste des quizzes';
    console.log($scope.title);
    Quizz.get().success(function(quizzes) {
    	$scope.quizzes = quizzes;
    });
});
