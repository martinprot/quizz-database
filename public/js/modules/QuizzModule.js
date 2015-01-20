// public/js/controllers/QuizzController.js
var quizzModule = angular.module('QuizzModule', ['LoginModule']);

quizzModule.controller('QuizzController', function($scope, $location, Quizz) {
	
    $scope.title = 'Liste des quizzes';
    
    $scope.open = function(quizz) {
	    $location.path("/quizz/" + quizz._id + "/question");
	};

    Quizz.get().success(function(quizzes) {
    	$scope.quizzes = quizzes;
    });
});

quizzModule.factory('Quizz', function($http, Session) {

    return {
        // call to GET all quizzes
        get : function() {
            return $http.get('/api/quizz');
        },

        // call to POST and create a new quizz
        create : function(quizzData) {
            return $http.post('/api/quizz', quizzData);
        },

        // call to PUT a quizz
        update : function(id, quizzData) {
            return $http.put('/api/quizz/' + id, quizzData);
        },
        
        // call to DELETE a quizz
        delete : function(id) {
            return $http.delete('/api/quizz/' + id);
        }
    }       

});
