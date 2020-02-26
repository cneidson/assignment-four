// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account

mapboxgl.accessToken = 'pk.eyJ1IjoiY25laWRzb24iLCJhIjoiY2s3MmhkcHVpMDJiNDNlcjk5MXc5ejdzeSJ9.m2VrsWCLMueCL2O1gumaQA';

// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-73.977361, 40.764295]
var initialZoom = 13

// create an object to hold the initialization options for a mapboxGL map
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/light-v10', // use this basemap
  center: initialCenterPoint, // initial view center
  zoom: initialZoom, // initial view zoom level (0-18)
}

// create the new map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

  // add a geojson source to the map using our external geojson file
  map.addSource('historic', {
    type: 'geojson',
    data: './data/historic.geojson',
  });

  // let's make sure the source got added by logging the current map state to the console
  console.log(map.getStyle().sources)

  // add a layer for our custom source
  map.addLayer({
    id: 'fill-historic',
    type: 'fill',
    source: 'historic',
    paint: {
  'fill-color': '#67a9cf',
  'fill-opacity': 0.9,
  'fill-outline-color': 'black'
}
});


// add an empty data source, which we will use to highlight the lot the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  })

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-line',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 1.1,
      'line-opacity': 0.8,
      'line-color': 'black',
    }
  });


  // listen for the mouse moving over the map and react when the cursor is over our data

  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-historic'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
      <img src="${hoveredFeature.properties.image_url}"></Br></Br>
        <h3>${hoveredFeature.properties.area_name}</h3>
        <p class="descriptions"><strong>Description:</strong> ${hoveredFeature.properties.other_note}</p>
        <p class="descriptions"><strong>Image Credit:</strong><i> ${hoveredFeature.properties.image_credit}</i></p>
      `
      $('#feature-info').html(featureInfo)

      // set this lot's polygon feature as the data for the highlight source
      map.getSource('highlight-feature').setData(hoveredFeature.geometry);
    } else {
      // if there is no feature under the mouse, reset things:
      map.getCanvas().style.cursor = 'default'; // make the cursor default

      // reset the highlight source to an empty featurecollection
      map.getSource('highlight-feature').setData({
        type: 'FeatureCollection',
        features: []
      });

      // reset the default message
      $('#feature-info').html(defaultText)
    }
  })

})
