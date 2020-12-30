// Store API url
let queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"

function markerSize(mag) {
  return mag * 30000;
}

  // Assign colors based on the magnitude
function markerColor(mag) {
    switch (true) {
    case mag > 5:
      return "#ea2c2c";
    case mag > 4:
      return "#ea822c";
    case mag > 3:
      return "#ee9c00";
    case mag > 2:
      return "#eecc00";
    case mag > 1:
      return "#d4ee00";
    default:
      return "#98ee00";
    }
};
// Get request, then send the object to the createFeatures function
d3.json(queryURL, function(data) {
  createFeatures(data.features);
});
//CreateFeatures function
function createFeatures(earthquakeData) {
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature : function (feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" + "<p> Magnitude: " +  feature.properties.mag + "</p>")
    },     pointToLayer: function (feature, latlng) {
      //binds and returns the popup for the markesr
      return new L.circle(latlng,
        {radius: markerSize(feature.properties.mag),
        fillColor: markerColor(feature.properties.mag),
        fillOpacity: 1,
        stroke: false,
    })
  }
  });
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}
function createMap(earthquakes) {
// Define layers to the map
//Satellite layer
  let satelitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });
//Dark layer ***Not working properly, but can't figure out why - Fix later***
  let darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  //Define the object to hold the layers
  var baseMaps = {
    "Satelite Map": satelitemap,
    "Dark Map": darkmap
  };
  // Overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Creating the map, and adding in the layers
  var myMap = L.map("map", {
    center: [31.57853542647338,-99.580078125],
    zoom: 3,
    layers: [satelitemap, earthquakes]
  });

  //Creating the layer control, adding the baseMaps, overlayMaps, and layer control 
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  //var for the legend, in bottom right portion of screen
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
          magnitudes = [0, 1, 2, 3, 4, 5];
  
      for (var i = 0; i < magnitudes.length; i++) {
          div.innerHTML +=
              '<i style="background:' + markerColor(magnitudes[i] + 1) + '"></i> ' + 
      + magnitudes[i] + (magnitudes[i + 1] ? ' - ' + magnitudes[i + 1] + '<br>' : ' + ');
      }
        return div;
  };
  //add legend to map
  legend.addTo(myMap);
}