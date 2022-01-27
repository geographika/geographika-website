var token = 'pk.eyJ1IjoiZ2VvZ3JhcGhpa2EiLCJhIjoiY2oxeTM0YzJrMDAwNTMybWJhMm9rcHh2OCJ9.t_CxqXa-6nkLVL3CRPf7dw';


var vectorLayer = new ol.layer.Vector({
    source: new ol.source.Vector({
        projection: 'EPSG:4326',
        url: './_static/geographika.json',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'green',
            lineDash: [4],
            width: 3
        }),
        fill: new ol.style.Fill({
            color: 'rgba(0, 0, 255, 0.1)'
        })
    })
});

// https://www.mapbox.com/help/mapbox-with-openlayers/
// style: 'mapbox://styles/mapbox/light-v9'
// style: 'mapbox://styles/mapbox/streets-v9'
// style: 'mapbox://styles/mapbox/outdoors-v9'

var map = new ol.Map({
    layers: [
      new ol.layer.Tile({
          opacity: 0.4,
          source: new ol.source.XYZ({
              url: 'https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token=' + token
          })
      }),
	  vectorLayer
    ],
    target: 'map',
    view: new ol.View({
        center: [3864368, 5375442],
        zoom: 6
    })
});