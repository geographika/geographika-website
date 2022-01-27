mapboxgl.accessToken = 'pk.eyJ1IjoiZ2VvZ3JhcGhpa2EiLCJhIjoiY2oxeTM0YzJrMDAwNTMybWJhMm9rcHh2OCJ9.t_CxqXa-6nkLVL3CRPf7dw';

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [2.415488713696627, 48.86389219224954],
    zoom: 11
});

map.on('load', function () {

    map.addLayer({
        "id": "title",
        "type": "fill",
        "source": {
            "type": "geojson",
            "data": geographika
        },
        'layout': {},
        'paint': {
            'fill-color': '#088',
            'fill-opacity': 0.8
        }
    });
});

// style: 'mapbox://styles/mapbox/light-v9'
// style: 'mapbox://styles/mapbox/streets-v9'
// style: 'mapbox://styles/mapbox/outdoors-v9'

// https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2/14/8575/5771.vector.pbf?access_token=pk.eyJ1IjoibXNsZWUiLCJhIjoiclpiTWV5SSJ9.P_h8r37vD8jpIH1A6i1VRg