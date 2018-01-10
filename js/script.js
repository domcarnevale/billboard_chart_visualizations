
var chartGroup = "chartGroup";
var mapChart = dc.leafletChoroplethChart("#us-chart");
var pieChart = dc.pieChart("#pie");
var bubbleChart = dc.scatterPlot("#bubblechart");
var lineChart = dc.lineChart("#linechart");

//Loads in cleaned song data (Processed in a separate python script)
d3.csv("song_data.csv", function(error, data) {

  //Convert fields that should be numeric to numeric values
  data.forEach(function (d) {
    d['Start of fade out'] = +d['Start of fade out']
    d['Latitude'] = +d['Latitude']
    d['End of fade in'] = +d['End of fade in']
    d['Tempo'] = +d['Tempo']
    d['Longitude'] = +d['Longitude']
    d['Artist Hotttnesss'] = +d['Artist Hotttnesss']
    d['Year'] = +d['Year']
    d['Duration'] = +d['Duration']
    d['Loudness'] = +d['Loudness']
    d['Song Hotttnesss'] = +d['Song Hotttnesss']
    d['Time signature'] = +d['Time signature']
    d['Energy'] = +d['Energy']
    d['Danceability'] = +d['Danceability']
    d['Top Position'] = +d['Top Position']
    d['Entry Year'] = +d['Entry Year']
  });

  //Create crossfilter object
  var xf = crossfilter(data);

  //Filters values from the specified group, whose values have been filtered
  //by another visualization. 
  function remove_empty_bins(source_group) {
    return {
        all:function () {
            return source_group.all().filter(function(d) {
              //if the group contains multiple fields
              if (typeof d == 'object'){
                return d.value['count'] != 0;
              } else {
                return d.value != 0;
              }
            });
        }
    };
  }

  //The following define the crossfilter dimensions from the data
  var locationDimension = xf.dimension(function(d){
    return d['State'];
  });
  var modeDimension = xf.dimension(function(d) {
    return d['Mode'];
  });
  var monthDimension = xf.dimension(function(d) {
    return d['Entry Month'];
  });
  var keyDimension = xf.dimension(function(d) {
    return d['Key'];
  });
  var yearDimension = xf.dimension(function(d) {
    return d['Entry Year'];
  });
  
  //These dimensions are two-dimensional and are used by the bubble chart.
  //The Math.ceil(...) call maps the top position to its corresponding bucket
  //(i.e. top 10, top 20, etc.)
  var bubbleMonthDimension = xf.dimension(function(d) {
    return [Math.ceil(d['Top Position'] / 10) * 10, d['Entry Month']];
  });
  var bubbleKeyDimension = xf.dimension(function(d) {
    return [Math.ceil(d['Top Position'] / 10) * 10, d['Key']];
  });
  var bubbleModeDimension = xf.dimension(function(d) {
    return [Math.ceil(d['Top Position'] / 10) * 10, d['Mode']];
  });
  
  
  //The following groups are created from crossfilter dimensions using reduce
  //functions to make the necessary computations for plotting
  var modeGroup = modeDimension.group().reduceCount();
  var monthGroup = monthDimension.group().reduceCount();
  var keyGroup = keyDimension.group().reduceCount();
  
  var locationGroup = locationDimension.group().reduce(
    function(p, v) {
      ++p.count;
      return p;
    },

    function(p, v) {
      --p.count;
      return p;
    },

    function() {
      return {count: 0};
    }
  );

  var tempoYearGroup = yearDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var durationYearGroup = yearDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var loudnessYearGroup = yearDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var tempoTopMonthGroup = bubbleMonthDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var tempoTopKeyGroup = bubbleKeyDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var tempoTopModeGroup = bubbleModeDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Tempo'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var durationTopMonthGroup = bubbleMonthDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var durationTopKeyGroup = bubbleKeyDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var durationTopModeGroup = bubbleModeDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Duration'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var loudnessTopMonthGroup = bubbleMonthDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var loudnessTopKeyGroup = bubbleKeyDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  var loudnessTopModeGroup = bubbleModeDimension.group().reduce(
    function(p, v) {
      ++p.count;
      p.sum += v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(p, v) {
      --p.count;
      p.sum -= v['Loudness'];
      p.avg = p.count ? p.sum / p.count : 0;
      return p;
    },

    function(){
      return {count: 0, sum: 0, avg: 0}
    }
  );

  //Loads the map data to place US State heatmap components. All visualizations
  //are wrapped in this function to allow for coordinated filtering.
  d3.json("us-states.json", function (error, statesJson) {
    
    //Pie chart labels used to map color scales
    var colorMonthScale = ["January", "February", "March", "April", "May",
    "June", "July", "August", "September", "October", "November", "December"];
    var colorKeyScale = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
    var colorModeScale = ["Minor", "Major"];

    //The following arrays are used to map the dropdown menus to the correct
    //dimension
    var dimensionArray = [modeDimension, monthDimension, keyDimension]
    var groupArray = [modeGroup, monthGroup, keyGroup]
    var colorArray = [colorModeScale, colorMonthScale, colorKeyScale]
    
    //Get the value of the pie chart dropdown and retrieves the correct
    //dimension to be used to generate the pie chart
    var pieDrop = document.getElementById("piedrop");
    var indexP = pieDrop.options[pieDrop.selectedIndex].value;
    var pieDimension = dimensionArray[indexP];
    var pieGroup = groupArray[indexP];
    var pieColor = colorArray[indexP];

    //Re-assigns the necessary dimensions and groups and re-renders the
    //visualizations associated with them when the pie chart dropdown 
    //is changed
    pieDrop.onchange = function() {
      indexP = pieDrop.options[pieDrop.selectedIndex].value;
      
      //Re-assign
      pieDimension = dimensionArray[indexP];
      pieGroup = groupArray[indexP];
      pieColor = colorArray[indexP];
      bubbleDimension = dimensionTopArray[indexP];
      bubbleGroup = groupTopArray[indexP][indexB];
      
      //Re-render
      pieChart.dimension(pieDimension);
      pieChart.group(pieGroup);
      pieChart.colorDomain(pieColor)
      pieChart.render();
      bubbleChart.dimension(bubbleDimension);
      bubbleChart.group(remove_empty_bins(bubbleGroup));
      bubbleChart.colorDomain(pieColor)
      bubbleChart.render();
    }

    //Defines pie chart visualization properties
    pieChart
      .width(250)
      .height(250)
      .dimension(pieDimension)
      .group(pieGroup)
      .externalLabels(30)
      .externalRadiusPadding(55)
      .minAngleForLabel(0.05)
      .colors(d3.scale.ordinal().range(['#a6cee3','#1f78b4','#b2df8a',
        '#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a',
        '#ffff99','#b15928']))
      .colorDomain(pieColor)
      .colorAccessor(function(d) { return d.key; })

    //Get the value of the line chart dropdown and retrieves the correct
    //dimension to be used to generate the line chart
    var lineDrop = document.getElementById("linedrop");
    var index = lineDrop.options[lineDrop.selectedIndex].value;
    var groupYearArray = [durationYearGroup, tempoYearGroup, loudnessYearGroup]
    var titleArray = ["Average Duration (ms)", "Average Tempo (bpm)", "Average Loudness (dB)"]
    var lineGroup = groupYearArray[index];
    var lineTitle = titleArray[index];
    
    //Defines bubble chart visualization properties
    lineChart
      .width(850)
      .height(250)
      .x(d3.scale.linear().domain([1958, 2015]))
      .y(d3.scale.linear().domain([d3.min(lineGroup.all(), function(d) { return d.value.avg; }), d3.max(lineGroup.all(), function(d) { return d.value.avg; })]))
      .dimension(yearDimension)
      .group(lineGroup)
      .yAxisLabel(lineTitle)
      .xAxisLabel("Year")
      .keyAccessor(function(d) { return d.key; })
      .valueAccessor(function(d) { return d.value.avg; })
      //.elasticY(true)
      .on('preRedraw', function(chart){
        chart.y().domain([d3.min(chart.group().all(), function(d) { return d.value.avg; }), d3.max(chart.group().all(), function(d) { return d.value.avg; })])
      })
      .xAxis().ticks(10).tickFormat(d3.format('d'));

    //Re-assigns the necessary dimensions and groups and re-renders the
    //visualizations associated with them when the line chart dropdown 
    //is changed
    lineDrop.onchange = function() {
      index = lineDrop.options[lineDrop.selectedIndex].value;
      lineGroup = groupYearArray[index];
      lineTitle = titleArray[index];
      lineChart.group(lineGroup);
      lineChart.yAxisLabel(lineTitle);
      lineChart.y(d3.scale.linear().domain([d3.min(lineGroup.all(), 
        function(d) { return d.value.avg; }), d3.max(lineGroup.all(), 
        function(d) { return d.value.avg; })]));
      lineChart.render();
    }

    //Get the value of the bubble chart dropdown and, along with the currently
    //selected pie chart dimension, retrieves the correct dimension to be used
    //to generate the bubble chart
    var bubbleDrop = document.getElementById("bubbledrop");
    var indexB = bubbleDrop.options[bubbleDrop.selectedIndex].value;
    var groupTopArray = [
      [durationTopModeGroup, tempoTopModeGroup, loudnessTopModeGroup],
      [durationTopMonthGroup, tempoTopMonthGroup, loudnessTopMonthGroup],
      [durationTopKeyGroup, tempoTopKeyGroup, loudnessTopKeyGroup]
    ]
    var dimensionTopArray = [bubbleModeDimension, bubbleMonthDimension, bubbleKeyDimension]
    var bubbleGroup = groupTopArray[indexP][indexB];
    var bubbleDimension = dimensionTopArray[indexP];
    var bubbleTitle = titleArray[indexB];

    //Re-assigns the necessary dimensions and groups and re-renders the
    //visualizations associated with them when the bubble chart dropdown 
    //is changed
    bubbleDrop.onchange = function() {
      indexB = bubbleDrop.options[bubbleDrop.selectedIndex].value;
      bubbleGroup = groupTopArray[indexP][indexB];
      bubbleTitle = titleArray[indexB];
      bubbleChart.group(bubbleGroup);
      bubbleChart.yAxisLabel(bubbleTitle);
      bubbleChart.render();
    }

    //Defines bubble chart visualization properties
    bubbleChart
      .width(460)
      .height(400)
      .x(d3.scale.linear().domain([0, 110]))
      .yAxisLabel(bubbleTitle)
      .xAxisLabel("Top Position on Charts")
      .elasticY(true)
      .brushOn(false)
      .dimension(bubbleDimension)
      .group(remove_empty_bins(bubbleGroup))
      .keyAccessor(function(d) { return d.key[0]; })
      .valueAccessor(function(d) {return d.value.avg; })
      .colors(d3.scale.ordinal().range(['#a6cee3','#1f78b4','#b2df8a',
        '#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a',
        '#ffff99','#b15928']))
      .colorAccessor(function(d) { return d.key[1]; })
      .colorDomain(pieColor)
      .symbolSize(10)
      .on('preRedraw', function(chart) {
        console.log(remove_empty_bins(bubbleGroup).all());
        console.log(bubbleGroup);
        chart.dimension(bubbleDimension);
        chart.group(remove_empty_bins(bubbleGroup));
        chart.colorDomain(pieColor)
        chart.colorAccessor(function(d) { return d.key[1]; });
      });
      
    //Defines map visualization properties
    mapChart
      .width(450)
      .height(350)
      .title(function(d) {
        return "State: " + d.key + "\nTotal Songs: " + d.value.count
      })
      .dimension(locationDimension)
      .group(remove_empty_bins(locationGroup))
      .colors(d3.scale.quantize()
        .domain([0, d3.max(remove_empty_bins(locationGroup).all(), 
          function(d) { return d.value.count; })])
        .range(['#ffffcc','#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a',
        '#e31a1c','#bd0026','#800026']))
      .colorAccessor(function(d) { return d.value.count })
      .brushOn(true)  
      .mapOptions({ zoomControl:false, scrollWheelZoom:false })
      .geojson(statesJson.features)
      .featureKeyAccessor(function(feature) {
          return feature.properties.name;
      })
      .legend(dc.leafletLegend().position('bottomright'))
      //ensures map fits to window
      .center([38.09024, -95.712891])
      .zoom(4)
      //recompute heatmap when other charts are filtered
      .on('preRedraw', function(chart){
        chart.colorDomain([0, d3.max(chart.group().all(), function(d) { return d.value.count; })])
      });

    //Renders charts on the page
    dc.renderAll();
  });
});
