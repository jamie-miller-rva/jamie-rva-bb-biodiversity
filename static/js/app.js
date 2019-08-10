// ==============================================================================
// FUNCTION TO BUILD SAMPLE METADATA PANEL AND GAUGE CHART
// ==============================================================================
function buildMetadata(sample) {
  console.log(sample);
  // Use d3 to select the panel with id of `#sample-metadata`
  var panelMetadata = d3.select("#sample-metadata");

  // Use `.html("") to clear any existing panelMetadata
  panelMetadata.selectAll('p').html('');

  // Use `d3.json` to fetch the sample data (served up by app.py @app.route("/metadata/<sample>"))
  // for the SAMPLE METADATA PANEL and GAUGE chart
  var url = `/metadata/${sample}`;
  d3.json(url).then((sampleMetadata) => {
    console.log(sampleMetadata);

    // ==============================================================================
    // SAMPLE METADATA PANEL
    // =============================================================================
    // Use `Object.entries` to add each key and value pair to the panel    
    Object.entries(sampleMetadata).forEach(([key,value]) => {
      console.log(`${key},${value}`);
      // Use d3 to append new tags for each key-value in the metadata
      // Display each key/value pair from the metadata JSON object
      panelMetadata.append('p').text(`${key}: ${value}`);
    });
  });
}

// ==============================================================================
// FUNCTION TO BUILD PIE AND BUBBLE CHARTS/PLOTS 
// ==============================================================================
function buildCharts(sample) {
  // (served up by @app.route("/samples/<sample>") 
  // for the PIE AND BUBBLE charts/plots
  var url = `/samples/${sample}`;
  d3.json(url).then(function(data) {
    
    // ==============================================================================
    // PIE CHART: 
    // Build a Pie Chart using the top 10 (largest) sample_values
    // Note: sample_values are already sorted in descending order
    // Note: Use slice() to grab the top 10 sample_values, along with associated otu_ids and otu_labels
    //===============================================================================    
    var data2 = [{                                  // Direction and Guidance:
      labels: data.otu_ids.slice(0,10),             // Use otu_ids as the labels
      values: data.sample_values.slice(0,10),       // Use sample_values as the values
      type: 'pie',
      hovertext: data.otu_labels,                   // Use the out_labels as the hovertext
      textinfo: 'percent'
    }]

    var layout2 = {
      title: `Top Bacteria Species Identified in Sample: ${sample}`,
      //height: 500,
      //width: 600,
      text: 'Top 10 "Species” in the Sample',
      colorscale: 'YIGnBu',
      opacity:0.7,
      showlegend: true,
    } 

    Plotly.newPlot('pie', data2, layout2);  

    // ==============================================================================
    // BUBBLE CHART
    // Build a Bubble Chart using the sample data
    // Grab values from the json object
    //===============================================================================      
                                            // Direction and Guidance:
    var xValues = data.otu_ids;             // Use otu_ids for the x values.
    var yValues = data.sample_values;       // Use sample_values for the y values.
    var markerSize = data.sample_values;    // Use sample_values for the marker size.
    var markerColors = data.otu_ids;        // Use otu_ids for the marker colors.
    var textValues  = data.otu_labels;      // Use otu_labels for the text values.
    
    // Create the trace for the bubble plot
    var trace1 = {
      x: xValues,              
      y: yValues,
      text: textValues,
      title: `Sample: ${sample}`,             
      mode: 'markers',           
      marker: {
        color: markerColors,    
        size: markerSize,
        colorscale: 'YIGnBu',
        opacity:0.7,
      }
    };
    var data1 = [trace1];
    var layout1 = {
      xaxis: {title: "Operational Taxonomic Units (OTUs)"},
      yaxis: {title: "Sample Value (Count)"},
      showlegend: false,
    };

    Plotly.newPlot('bubble', data1, layout1);
  });
}

// ==============================================================================
// FUNCTION TO INITIALIZE THE DASHBOARD
//===============================================================================
function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
