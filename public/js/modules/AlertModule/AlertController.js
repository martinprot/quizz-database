var alertModule = angular.module('AlertModule', []);

alertModule.controller('AlertController', function ($scope, $modalInstance, data) {

  $scope.title = data.title;
  $scope.message = data.message;
  $scope.okButton = data.okButton;
  $scope.cancelButton = data.cancelButton;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});