// public/js/services/QuizzService.js
var quizzService = angular.module('QuizzService', []);
quizzService.factory('Quizz', ['$http', function($http) {

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

}]);
