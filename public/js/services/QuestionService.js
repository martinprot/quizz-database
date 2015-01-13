// public/js/services/questionService.js
var questionService = angular.module('QuestionService', []);
questionService.factory('Question', ['$http', function($http) {

    return {
        // call to GET all questions
        get : function() {
            return $http.get('/api/question');
        },

        // call to DELETE a question
        delete : function(id) {
            return $http.delete('/api/question/' + id);
        }
    }       

}]);
