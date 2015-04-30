// public/js/controllers/QuizzController.js
var quizzModule = angular.module('QuizzModule', ['LoginModule']);

quizzModule.controller('QuizzListController', function($scope, $location, QuizzService) {
	
    $scope.title = 'Liste des quizzes';
    
    $scope.open = function(quizz) {
	    $location.path("/quizz/" + quizz._id);
	};
	
	$scope.newQuizz = function() {
		// Open edit view
		var newpath = $location.path() + "/new";
		$location.path(newpath);
	}

    QuizzService.get().success(function(quizzes) {
    	$scope.quizzes = quizzes;
    });
});

quizzModule.controller('QuizzController', function($scope, $route, $location, quizz, QuizzService) {
	var editing = !!quizz;
	
	if(editing)	{
		$scope.action = "Edition";
		$scope.quizz = quizz;
		$scope.buttonCaption = "Mettre à jour";
	}
	else {
		$scope.action = "Nouveau quizz";
		$scope.buttonCaption = "Enregistrer";
	}
	$scope.submit = function(quizz) {
		if(quizz.name && quizz.locale) {
			if(!editing) {
				QuizzService.create(quizz);
				$location.path("/quizz");
			}
			else {
				var file = document.getElementById('quizz_csv').files[0];
				
				var fd = new FormData();
			    fd.append("csv", file);
			    fd.append("name", quizz.name);
			    fd.append("locale", quizz.locale);
				QuizzService.uploadCSV(quizz._id, fd).then(function(result) {
					if(result.data.notSaved.length)
						$scope.notAdded = result.data.notSaved;
				    
					$scope.$broadcast('QuestionListChanged');
				});
			}
		} else {
			// do form coloration	
		}
	}
});

quizzModule.factory('QuizzService', function($http, Session) {

    return {
        // call to GET all quizzes
        get : function() {
            return $http.get('/api/quizz');
        },
        getQuizz : function(quizzId) {
            return $http.get('/api/quizz/' + quizzId);
        },
        // call to POST and create a new quizz
        create : function(quizzData) {
            return $http.post('/api/quizz', quizzData);
        },

        // call to PUT a quizz
        update : function(id, quizzData) {
            return $http.put('/api/quizz/' + id, quizzData);
        },
        
		uploadCSV : function(id, formData) {
		    return $http.post("/api/quizz/"+ id + "/csv/", formData, {
		        withCredentials: true,
		        headers: {'Content-Type': undefined },
		        transformRequest: angular.identity
		    });
		},
		
        // call to DELETE a quizz
        delete : function(id) {
            return $http.delete('/api/quizz/' + id);
        }
    }       

});
