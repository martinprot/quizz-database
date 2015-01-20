// public/js/controllers/QuestionController.js
var questionModule = angular.module('QuestionModule', ['LoginModule']);

questionModule.controller('QuestionController', function($scope, $location, $routeParams, Question) {
	$scope.title = 'Liste des questions';

	if($routeParams.quizz_id) {
		// user is asking for questions relative to a quizz
		Question.getForQuizz($routeParams.quizz_id).success(function(questions) {
	    	$scope.questions = questions;
	    });
	}
    else {
    	// user is asking for all questions.
	    Question.getAll().success(function(questions) {
	    	$scope.questions = questions;
	    });
	}
	
	$scope.editQuestion = function(question) {
		// Open edit view
		$location.path("/question/" + question._id); // add get parameter to edit ?
	}
	$scope.removeQuestion = function(question) {
		// delete on server
		Question.delete(question._id).success(function(result) {
			// then delete on interface
			var index = $scope.questions.indexOf(question);
  			$scope.questions.splice(index, 1);
		});
	}
});

questionModule.factory('Question', function($http, Session) {

    return {
        // call to GET all questions
        getAll : function() {
            return $http.get('/api/question');
        },
        
        getForQuizz : function(quizzId) {
            return $http.get('/api/quizz/' + quizzId + '/question');
        },
        
        get : function(id) {
            return $http.get('/api/question/' + id);
        },
        
        put : function(id, body) {
	        if(Session.token) {
        		body = {access_token: Session.token};
        	}
            return $http.get('/api/question/' + id, body);
        },

        delete : function(id) {
        	var body = "";
        	if(Session.token) {
        		body = {access_token: Session.token};
        	}
            return $http.delete('/api/question/' + id, { data: body} );
        }
    }       

});
