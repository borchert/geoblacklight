//= require geoblacklight/viewers/map

GeoBlacklight.Viewer.Esrimapservice = GeoBlacklight.Viewer.Map.extend({
  layerInfo: {},

  // default feature styles
  defaultStyles: {
      'esriGeometryPoint': '', 
      'esriGeometryMultipoint': '',
      'esriGeometryPolyline': {color: 'blue', weight: 3 },
      'esriGeometryPolygon': {color: 'blue', weight: 2 }
  },

  load: function() {
    this.options.bbox = L.bboxToBounds(this.data.mapBbox);
    this.map = L.map(this.element).fitBounds(this.options.bbox);
    this.map.addLayer(this.selectBasemap());
    this.map.addLayer(this.overlay);
    if (this.data.available) {
      this.getEsriLayer();
    } else {
      this.addBoundsOverlay(this.options.bbox);
    }
  },

  getEsriLayer: function() {
    var _this = this;

    // remove any trailing slash from endpoint url
    _this.data.url = _this.data.url.replace(/\/$/, '');

    L.esri.get = L.esri.Request.get.JSONP;
    L.esri.get(_this.data.url, {}, function(error, response){
      if(!error) {
         _this.layerInfo = response;

         // add layer to map
        if (_this.addPreviewLayer()) {

          // add control if layer is added
          _this.addOpacityControl();
        }
      }
    });
  },

  addPreviewLayer: function() {

    // set esri leaflet options
    var options = { opacity: 1 };
    var esriMapServiceLayer;
    var service = this.data.fragment;

    // Define layer based on service type
    switch(service) {
      case 'mapService':
        // check if this is a dynamic map service
        if (this.layerInfo.singleFusedMapCache === false && this.layerInfo.supportsDynamicLayers !== false) {
          esriMapServiceLayer = L.esri.dynamicMapLayer(this.data.url, options);

        // check if this is a tile map and layer and for correct spatial reference
        } else if (this.layerInfo.singleFusedMapCache === true && this.layerInfo.spatialReference.wkid === 102100) {

          /**
            * TODO:  perhaps allow non-mercator projections and custom scales
            *        - use Proj4Leaflet
          */
          esriMapServiceLayer = L.esri.tiledMapLayer(this.data.url, options);
        }
        break;
      case 'featureService':
        // set default style
        options.style = this.getFeatureStyle();
        esriMapServiceLayer = L.esri.featureLayer(this.data.url, options);

        // feature layers can have inspection
        this.setupInspection();
        break;
      case 'imageService':
        esriMapServiceLayer = L.esri.imageMapLayer(this.data.url, options);
        break;
    }

    // if it exists, add layer to map
    if (esriMapServiceLayer) {
      this.overlay.addLayer(esriMapServiceLayer);
      return true;
    }
  },

  getFeatureStyle: function() {
    var _this = this;

    // lookup style hash based on layer geometry type and return function
    return function(feature) { return _this.defaultStyles[_this.layerInfo.geometryType]; };
  },

  addOpacityControl: function() {
    this.map.addControl(new L.Control.LayerOpacity(this.overlay));
  },

  setupInspection: function() {
    // TODO: setup feature layer inspection
  }
});
