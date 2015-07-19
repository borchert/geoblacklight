//= require geoblacklight/viewers/esri

GeoBlacklight.Viewer.DynamicMapLayer = GeoBlacklight.Viewer.Esri.extend({
  layerID: null,

  // override to parse between dynamic layer types
  getEsriLayer: function() {
    var _this = this;

    // remove any trailing slash from endpoint url
    _this.data.url = _this.data.url.replace(/\/$/, '');

    // if the last seg is an integer, slice and save as layer ID
    var pathArray = this.data.url.replace(/\/$/, '').split('/');
    var lastSegment = pathArray[pathArray.length - 1];
    if (Number(lastSegment) === parseInt(lastSegment, 10)) {
      this.layerID = lastSegment;
      this.data.url = this.data.url.slice(0,-(lastSegment.length + 1));
    }

    L.esri.get = L.esri.Request.get.JSONP;
    L.esri.get(_this.data.url, {}, function(error, response){
      if(!error) {
        _this.layerInfo = response;

        // get layer
        var layer = _this.getPreviewLayer();

        // add layer to map
        if (_this.addPreviewLayer(layer)) {

          // add control if layer is added
          _this.addOpacityControl();
        }
      }
    });
  },

  getPreviewLayer: function() {

    // set esri leaflet options
    var options = { opacity: 1 };

    // console.log(this.layerID);
    if (this.layerID) {
      options.layers = [this.layerID];
    }

    var esriDynamicMapLayer = L.esri.dynamicMapLayer(this.data.url, options);

    // setup feature inspection
    this.setupInspection(esriDynamicMapLayer);
    return esriDynamicMapLayer;
  },

  setupInspection: function(layer) { 
    var _this = this;
    this.map.on('click', function(e) {
      _this.appendLoadingMessage();

      // query layer at click location
      var identify = L.esri.Tasks.identifyFeatures({
          url: layer.options.url,
          useCors: true
      })
        .tolerance(0)
        .returnGeometry(false)
        .on(_this.map)
        .at(e.latlng);

      // query specific layer if layerID is set
      if (_this.layerID) {
        identify.layers('ID: ' + _this.layerID);
      }

      identify.run(function(error, featureCollection, response){
        if (error) {
          _this.appendErrorMessage();
        } else {
          _this.populateAttibuteTable(featureCollection.features[0]);
        }
      });
    });
  }
});
