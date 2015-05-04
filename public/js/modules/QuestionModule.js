// public/js/controllers/QuestionController.js
var questionModule = angular.module('QuestionModule', ['LoginModule', 'ui.bootstrap', 'AlertModule']);

questionModule.controller('QuestionListController', function($scope, $location, $routeParams, $modal, QuestionService) {

	var loadQuestions = function(quizzId) {
		if(quizzId) {
			// user is asking for questions relative to a quizz
			QuestionService.getForQuizz($routeParams.quizz_id).success(function(questions) {
		    	$scope.questions = questions;
		    });			
		}
		else {
	    	// user is asking for all questions.
		    QuestionService.getAll().success(function(questions) {
		    	$scope.questions = questions;
		    });
		}
	}
	loadQuestions($routeParams.quizz_id);
		
	$scope.newQuestion = function(question) {
		// Open edit view
		var newpath = $location.path() + "/new";
		$location.path(newpath);
	}
	$scope.editQuestion = function(question) {
		// Open edit view
		$location.path("/question/" + question._id);
	}
	var removeQuestion = function(question) {
		// delete on server
		QuestionService.delete(question._id).success(function(result) {
			// then delete on interface
			var index = $scope.questions.indexOf(question);
  			$scope.questions.splice(index, 1);
		});
	}
	$scope.selectAll = function(removeAll) {
		$scope.questions.forEach(function(question) {
			question.toRemove = removeAll;
		});
	}
	
	$scope.askRemoveQuestion = function(question) {
		var modalInstance = $modal.open({
			templateUrl: 'js/modules/AlertModule/alertView.html',
			controller: 'AlertController',
			size: "sm",
			resolve: {
				data : function() {
				return {title: "Attention",
						message: "Voulez vous supprimer cette question ?",
						okButton: "Supprimer",
						cancelButton: "Annuler"};
				}
			}
		});
		modalInstance.result.then(function () {
			removeQuestion(question);
		}, function () {
			
		});
	}
	
	$scope.askRemoveMulti = function(question) {
		var toRemove = $scope.questions.filter(function(question){
			return question.toRemove;
		})
		var caption = toRemove.map(function(elem){
			return elem.customId;
		}).join(", ");
		var modalInstance = $modal.open({
			templateUrl: 'js/modules/AlertModule/alertView.html',
			controller: 'AlertController',
			size: "sm",
			resolve: {
				data : function() {
				return {title: "Attention",
						message: "Voulez vous supprimer les questions suivantes : \n" + caption,
						okButton: "Supprimer",
						cancelButton: "Annuler"};
				}
			}
		});
		modalInstance.result.then(function () {
			// delete on server
			var toRemoveIds = toRemove.map(function(elem){
				return elem._id;
			});
			QuestionService.deleteMultiple(toRemoveIds).success(function(result) {
				// then delete on interface
				toRemove.forEach(function(question) {
					var index = $scope.questions.indexOf(question);
		  			$scope.questions.splice(index, 1);
				});
			});
		}, function () {
			
		});
	}
	
	$scope.$on('QuestionListChanged', function(event, data) { 
		loadQuestions($routeParams.quizz_id);
	});
});

questionModule.controller('QuestionController', function($scope, $routeParams, $location, question, QuestionService) {
	var editing = !!question;

	if(editing) {
		$scope.action = "Modifier";
		$scope.question = question;
		$scope.choice = [];
		
		var i = 0;
		$scope.choices = question.choices.map(function(string) {
			return {text: string, index: i++};
		});
	}
	else { // new question
		$scope.action = "Nouvelle question";
		$scope.choices = [{text: "", index: 0},
						  {text: "", index: 1},
						  {text: "", index: 2},
						  {text: "", index: 3}];
	}
	
	$scope.saveQuestion = function() {
		var returnToQuestionList = function() { $location.path("/question"); };
		// set edited choices
		$scope.question.choices = $scope.choices.map(function(object){ return object.text });
		if(editing) {
			QuestionService.put(question._id, $scope.question).success(returnToQuestionList);
		}
		else {	
			if($routeParams.quizz_id) {
				QuestionService.postForQuizz($routeParams.quizz_id, $scope.question).success(returnToQuestionList);
			} else {
				QuestionService.post($scope.question).success(returnToQuestionList);
			}
		}
	};
});

questionModule.factory('QuestionService', function($http, Session) {

    return {
        // call to GET all questions
        getAll : function() {
            return $http.get('/api/question');
        },
        
        getForQuizz : function(quizzId) {
            return $http.get('/api/quizz/' + quizzId + '/question');
        },
        postForQuizz : function(quizzId, body) {
            return $http.post('/api/quizz/' + quizzId + '/question', body);
        }, 
        
        get : function(id) {
            return $http.get('/api/question/' + id);
        },
        
        post : function(body) {
            return $http.post('/api/question/', body);
        }, 
        
        put : function(id, body) {
            return $http.put('/api/question/' + id, body);
        },

        delete : function(id) {
            return $http.delete('/api/question/' + id);
        },
        deleteMultiple : function(ids) {
			var body = {toRemove: ids};
			var config = {
			    method: "DELETE",
			    url: "/api/question",
			    data: body,
			    headers: {"Content-Type": "application/json;charset=utf-8"}
			};
			return $http(config);
        }
    }       

});
