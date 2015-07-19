//= require geoblacklight/viewers/esri
var globalval;
GeoBlacklight.Viewer.Mapservice = GeoBlacklight.Viewer.Esri.extend({
  
  getPreviewLayer: function() {

    // set esri leaflet options
    var options = { opacity: 1 };

    // check if this is a dynamic map service
    if (this.layerInfo.singleFusedMapCache === false && this.layerInfo.supportsDynamicLayers !== false) {
      var esriDynamicMapLayer = L.esri.dynamicMapLayer(this.data.url, options);

      //setup feature inspection
      this.setupInspection(esriDynamicMapLayer);

      return esriDynamicMapLayer;

    // check if this is a tile map and layer and for correct spatial reference
    } else if (this.layerInfo.singleFusedMapCache === true && this.layerInfo.spatialReference.wkid === 102100) {

      /**
        * TODO:  allow non-mercator projections and custom scales
        *        - use Proj4Leaflet
      */

      // 
      var esriTiledMapLayer = L.esri.tiledMapLayer(this.data.url, options);

      //setup feature inspection
      this.setupInspection(esriTiledMapLayer);

      return esriTiledMapLayer;
    }
  },

  setupInspection: function(layer) { 
    var _this = this;
    this.map.on('click', function(e) {
      _this.appendLoadingMessage();

      // query layer at click location
      L.esri.Tasks.identifyFeatures({
          url: layer.options.url,
          useCors: true
      })
      .tolerance(0)
      .returnGeometry(false)
      .on(_this.map)
      .at(e.latlng)
      .run(function(error, featureCollection, response){
        if (error) {
          _this.appendErrorMessage();
        } else {
          _this.populateAttibuteTable(featureCollection.features[0])
        };
      });
    });
  }
});
