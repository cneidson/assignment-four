// this is my mapboxGL token
// the base style includes data provided by mapbox, this links the requests to my account

mapboxgl.accessToken = 'pk.eyJ1IjoiY25laWRzb24iLCJhIjoiY2s3MmhkcHVpMDJiNDNlcjk5MXc5ejdzeSJ9.m2VrsWCLMueCL2O1gumaQA';


// we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-73.991780, 40.676]
var initialZoom = 13


// create an object to hold the initialization options for a mapboxGL map
var initOptions = {
  container: 'map-container', // put the map in this container
  style: 'mapbox://styles/mapbox/dark-v10', // use this basemap
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
  map.addSource('evacuation_routes', {
    type: 'geojson',
    data: './data/evacuation_routes.geojson',
  });

  // let's make sure the source got added by logging the current map state to the console
  console.log(map.getStyle().sources)

  // add a layer for our custom source
  map.addLayer({
    id: 'fill-evacuation_routes',
    type: 'fill',
    source: 'evacuation_routes',
    paint: {
      'fill-color': {
        type: 'categorical',
        property: 'LandUse',
        stops: [
          [
            '01',
            LandUseLookup(1).color,
          ],
          [
            '02',
            LandUseLookup(2).color,
          ],
          [
            '03',
            LandUseLookup(3).color,
          ],
          [
            '04',
            LandUseLookup(4).color,
          ],
          [
            '05',
            LandUseLookup(5).color,
          ],
          [
            '06',
            LandUseLookup(6).color,
          ],
          [
            '07',
            LandUseLookup(7).color,
          ],
          [
            '08',
            LandUseLookup(8).color,
          ],
          [
            '09',
            LandUseLookup(9).color,
          ],
          [
            '10',
            LandUseLookup(10).color,
          ],
          [
            '11',
            LandUseLookup(11).color,
          ],

        ]
      }
    }
  })

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
      'line-width': 2,
      'line-opacity': 0.9,
      'line-color': 'white',
    }
  });

  // listen for the mouse moving over the map and react when the cursor is over our data

  map.on('mousemove', function (e) {
    // query for the features under the mouse, but only in the lots layer
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['fill-pluto-bk-cd6'],
    });

    // if the mouse pointer is over a feature on our layer of interest
    // take the data for that feature and display it in the sidebar
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

      var hoveredFeature = features[0]
      var featureInfo = `
        <h4>${hoveredFeature.properties.Address}</h4>
        <p><strong>Land Use:</strong> ${LandUseLookup(parseInt(hoveredFeature.properties.LandUse)).description}</p>
        <p><strong>Zoning:</strong> ${hoveredFeature.properties.ZoneDist1}</p>
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
