class SeismoView {
  constructor($scope, $routeParams, $timeout, $http, $q, SeismoEditor, SeismoImageMap,
              Loading, SeismoStatus, SeismoServer, SeismoData) {

    window.viewScope = $scope;

    Loading.reset();

    $scope.SeismoImageMap = SeismoImageMap;
    $scope.SeismoData = SeismoData;
    $scope.Loading = Loading;

    $scope.detailsShowing = false;

    $scope.canEdit = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited"));
    };

    $scope.logShowing = false;
    $scope.log = "";

    $scope.hasLog = () => {
      var file = SeismoImageMap.currentFile;
      return file && (SeismoStatus.is(file.status, "Complete") ||
                      SeismoStatus.is(file.status, "Edited") ||
                      SeismoStatus.is(file.status, "Failed"));
    };

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

    var main = () => {
      var filename = $routeParams.filename;

      if (SeismoData.gotDataAlready) {
        var files = SeismoData.filesQueryData.files;
        var fileObject = files.find((file) => file.name === filename);
        $timeout(() => SeismoImageMap.loadImage(fileObject));
      } else {
        $q.all({
          stations: $http({ url: SeismoServer.stationsUrl }),
          file: $http({ url: SeismoServer.fileUrl + "/" + filename })
        }).then((res) => {
          SeismoData.setStationQueryData(res.stations.data);
          SeismoImageMap.loadImage(res.file.data);
        }).catch(() => {
          Loading.start("Seismogram not found.");
        });
      }
    };

    main();
  }
}

export { SeismoView };
