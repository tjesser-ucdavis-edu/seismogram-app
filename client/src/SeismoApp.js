import {Gradient} from "../bower_components/redfish-core/lib/Util/Gradient.js";

var angular = window.angular;

import { SeismoMain } from "./SeismoMain.ctrl.js";
import { SeismoMap } from "./map/SeismoMap.svc.js";
import { SeismoQuery } from "./SeismoQuery.svc.js";
import { SeismoTimeNubbin } from "./seismo-query-nubbins/SeismoTimeNubbin.dir.js";
import { SeismoQueryNubbins } from "./seismo-query-nubbins/SeismoQueryNubbins.dir.js";
import { LeafletMap } from "./map/LeafletMap.dir.js";

angular.module("SeismoApp", [])
  .controller("SeismoMain", SeismoMain)
  .service("SeismoMap", SeismoMap)
  .service("SeismoQuery", SeismoQuery)
  .directive("seismoTimeNubbin", SeismoTimeNubbin)
  .directive("seismoQueryNubbins", SeismoQueryNubbins)
  .directive("leafletMap", LeafletMap)
  .run([function() {
    console.log("Seismo is running.");
  }]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ["SeismoApp"]);
});
