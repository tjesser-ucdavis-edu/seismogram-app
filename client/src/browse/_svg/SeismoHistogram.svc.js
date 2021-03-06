class SeismoHistogram {
  
  constructor() {
  }

  init(id) {
    this.svgDomEl = document.getElementById(id);
    this.svgEl = d3.select("#"+id);
    
    this.resize();

    this.timeToXCoord = d3.time.scale.utc().range([0, this.width]);
    this.idxToXCoord = d3.scale.linear().range([0, this.width])
    this.yScale = d3.scale.linear().range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.timeToXCoord)
      .orient("top");

    this.barsEl = this.svgEl.append("g");

    this.xAxisEl = this.svgEl.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + this.height + ")");
  }

  resize() {
    this.width = this.svgDomEl.parentElement.offsetWidth;
    this.height = 200;

    this.svgEl
      .attr("width", this.width)
      .attr("height", this.height);
  }

  initBackground(lowDate, highDate, numBins, data) {
    this.numBins = numBins;
    this.timeToXCoord.domain([lowDate, highDate]);
    this.idxToXCoord.domain([0, numBins]);
    this.yScale.domain([0, d3.max(d3.values(data))]);
    this.barWidth = Math.floor(this.width / numBins);

    this.renderBackground(data);
  }

  binObjectToBinArray(binObject) {
    
    // Turns an object like:
    // {
    //   3: count,
    //   5: otherCount,
    //   ...
    // }
    // into an array like:
    // [0, 0, 0, count, 0, otherCount, ...]

    var binArray = [];
    for (var i = 0; i < this.numBins; i++) {
      if (i in binObject) {
        binArray[i] = binObject[i];
      } else {
        binArray[i] = 0;
      }
    }
    return binArray;
  }

  renderBackground(histogramObject) {
    this.render("background", histogramObject);
  }

  renderOverlay(histogramObject) {
    this.render("overlay", histogramObject);
  }

  render(className, histogramObject) {
    var binArray = this.binObjectToBinArray(histogramObject);

    var barGroups = this.barsEl.selectAll(".bar."+className)
      .data(binArray);

    // enter
    var bars = barGroups.enter().append("g")
      .attr("class", "bar "+className);

    bars.append("rect")
      .attr("x", 1)
      .attr("width", this.barWidth - 1);

    // update
    barGroups.attr("transform", (d,i) => "translate(" + this.idxToXCoord(i) + "," + this.yScale(d) + ")");
    barGroups.select("rect").attr("height", (d) => this.height - this.yScale(d));

    // exit
    barGroups.exit().remove();

    // axis
    this.xAxisEl.call(this.xAxis);
  }

}

export { SeismoHistogram };
