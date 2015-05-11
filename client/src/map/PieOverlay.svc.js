import {LeafletD3Overlay} from "./LeafletD3Overlay.js";

var log = function(base, exp) {
  return Math.log(exp) / Math.log(base);
};

var MIN_RADIUS = 5; // pixels

var seismogramArea = 0.5; // pixels

var d3 = window.d3;

class PieOverlay extends LeafletD3Overlay {

  constructor(SeismoData) {
    super();
    this.SeismoData = SeismoData;
  }

  init(leafletMap) {
    super.init(leafletMap);
    this.overlay = this.createGroup();

    leafletMap.on("viewreset", () => {
      this.renderStations();
    });
  }

  renderStatuses() {
    var stationStatuses = this.SeismoData.stationStatuses;

    // expects stationStatuses to be a dictionary of station objects:
    // {
    //   <stationId>: {
    //     status: [
    //       <numFilesNotStarted>,
    //       <numFilesOngoing>,
    //       <numFilesNeedAttention>,
    //       <numFilesComplete>
    //     ]
    //   },
    //   ...
    // }

    var pieLayout = d3.layout.pie() // generates parameters for pie arcs
      .sort(null); // don't sort (i.e. draw slices in order of array index)
    var arc = d3.svg.arc(); // generates arc path data

    var pieSegments = this.overlay
      .selectAll(".inner-segments")
      .selectAll("path")
      .data((station) => {

        // The <g class="inner-segments"> elements are already associated with
        // station data in renderStations(). Here we associate children <path>
        // elements with arcs generated from stationStatus data.

        // Only draw pies for stations included in the stationStatuses query results
        var stationStatus = stationStatuses[station.stationId];
        if (!stationStatus) {
          return "";
        }

        // calculate pie radius as a fraction of total radius
        var totalNumFiles = station.numFiles,
            maxRadius = station.radius,
            curNumFiles = stationStatus.status.reduce((total, val) => total + val),
            curRadius = maxRadius * curNumFiles / totalNumFiles;

        // create arc data expected by d3.svg.arc()
        var data = pieLayout(stationStatus.status);
        data.forEach((arcData) => {
          arcData.outerRadius = curRadius;
          arcData.innerRadius = 0;
        });
        return data;
      });

    // append and style new path elements
    pieSegments.enter()
      .append("path")
      .attr("class", (d, i) => {
        var classMap = ["not-started","ongoing","needs-attention","complete"];
        return classMap[i];
      });

    // bind the path "d" attribute to data generated by d3.svg.arc()
    pieSegments.transition().attrTween("d", function(d) {
      if (typeof this.prevRadius === "undefined") {
        this.prevRadius = 0;
      }
      var i = d3.interpolate(this.prevRadius, d.outerRadius);
      this.prevRadius = d.outerRadius;
      return function(t) { d.outerRadius = i(t); return arc(d); };
    });
    // pieSegments.attr("d", arc);

    // remove old segments
    pieSegments.exit().remove();
  }

  renderStations() {
    var stationData = this.SeismoData.stations;

    // expects stations to be an array of station objects:
    // [
    //   {
    //     lat: <latitude of station>,
    //     lon: <longitude of station>,
    //     numFiles: <number of seismograms recorded at this station>
    //   },
    //   ...
    // ]

    // bind data to <g class="station"> elements
    var stations = this.overlay.selectAll(".station")
      .data(stationData);

    // append new <g> elements
    var newStations = stations.enter()
      .append("g").attr("class", "station");

    // calculate the radius for each station
    newStations.each((station) => {
      var circleArea = seismogramArea * station.numFiles;
      var radius = log(1.1, Math.sqrt(circleArea / Math.PI));

      // TODO: Where is the best place to filter out stations
      // with 0 files associated with them?

      if (station.numFiles > 0 && radius < MIN_RADIUS) {
        radius = MIN_RADIUS;
      }

      if (station.numFiles === 0) radius = 0;

      station.radius = radius;
    });

    // position stations
    stations.attr("transform", (station) => {
      // TODO: this check could be done somewhere else;
      // maybe would make sense to filter out such stations
      // before passing them to the overlay to render?
      if (station.lat === null || station.lon === null) {
        console.warn("Station has invalid lat or lon", station);
        return;
      }
      var pixelXY = this.project(station.lon, station.lat);
      return "translate(" + pixelXY.x + "," + pixelXY.y + ")";
    });

    // each <g> has an outer-circle and several inner-segments
    newStations.append("circle")
        .attr("class", "outer-circle");
    newStations.append("g")
        .attr("class", "inner-segments");

    // style the outer-circle
    stations.selectAll(".outer-circle")
      .attr("r", (station) => station.radius+1); // add 1 for a small border

    // delete old stations
    stations.exit().remove();
  }

}

export { PieOverlay };
