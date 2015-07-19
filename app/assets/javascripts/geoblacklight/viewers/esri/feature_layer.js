//= require geoblacklight/viewers/esri

GeoBlacklight.Viewer.FeatureLayer = GeoBlacklight.Viewer.Esri.extend({

  // default feature styles
  defaultStyles: {
    'esriGeometryPoint': '', 
    'esriGeometryMultipoint': '',
    'esriGeometryPolyline': {color: 'blue', weight: 3 },
    'esriGeometryPolygon': {color: 'blue', weight: 2 }
  },

  getPreviewLayer: function() {

    // set esri leaflet options
    var options = { opacity: 1 };

    // set default style
    options.style = this.getFeatureStyle();

    // define feature layer
    var esriFeatureLayer = L.esri.featureLayer(this.data.url, options);

    //setup feature inspection
    this.setupInspection(esriFeatureLayer);

    return esriFeatureLayer;
  },
  
  getFeatureStyle: function() {
    var _this = this;

    // lookup style hash based on layer geometry type and return function
    return function(feature) { 
      return _this.defaultStyles[_this.layerInfo.geometryType]; 
    };
  },

  setupInspection: function(featureLayer) {
    var _this = this;

    // inspect on click    
    featureLayer.on('click', function(e) {
      _this.appendLoadingMessage();

      // query layer at click location
      featureLayer.query()
      .returnGeometry(false)
      .intersects(e.latlng)
      .run(function(error, featureCollection, response){
        if (error) {
          _this.appendErrorMessage();
        } else {
          _this.populateAttibuteTable(featureCollection.features[0]);
        }
      });
    });
  }
});
