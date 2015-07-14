class SeismoView {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismoEditor, SeismoImageMap,
              Loading, SeismoStatus, SeismoServer, SeismoData, ImageMapLoader) {

    window.viewScope = $scope;

    Loading.reset();

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.Loading = Loading;

    $scope.detailsShowing = false;

    $scope.hasData = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.hasData(file.status));
    };

    $scope.gotoEditor = () => {
      $scope.go("/edit/" + SeismoImageMap.currentFile.name);
    };

    $scope.logShowing = false;
    $scope.log = "";

    $scope.showLog = () => {
      var file = SeismoImageMap.currentFile;
      var token = Math.random();
      var url = "logs/" + file.name + ".txt?token="+token;

      $scope.log = "";

      $http({url: url}).then((res) => {
        $scope.log = res.data;
      }).catch(() => {
        $scope.log = "A log is not available for this file...";
      }).then(() => {
        $scope.logShowing = true;
      });
    };

    $scope.hideLog = () => {
      $scope.logShowing = false;
    };

    ImageMapLoader.load($routeParams.filename);
  }
}

export { SeismoView };