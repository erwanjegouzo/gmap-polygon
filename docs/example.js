function initMap() {
    var polygons = [];
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7, lng: -73.989},
        zoom: 12
    }),
    shapes = [
        /*N*/[[40.72930763943153,-74.06776428222656],[40.66918118282895,-74.07669067382812],[40.668660370488446,-74.06158447265625],[40.700300207273926,-74.05919046720658],[40.66970199110193,-74.05025482177734],[40.67021727328825,-74.03361037763887],[40.72982797782921,-74.03034210205078],[40.7290474687069,-74.04441833496094],[40.677513627085006,-74.0420150756836],[40.728527124205996,-74.05540466308594]],
        /*Y*/[[40.72982797782921,-74.0152359008789],[40.69834018178775,-73.99429321289062],[40.670483195884735,-74.01248931884766],[40.670483195884735,-73.99635314941406],[40.73190929073142,-73.95378112792969],[40.73138896860918,-73.97335052490234],[40.709531765423854,-73.9874267578125],[40.730088145502236,-74.00390625]],
        /*C*/[[40.732429608784805,-73.9438247680664],[40.670222795307346,-73.94691467285156],[40.670483195884735,-73.89472961425781],[40.68311692416296,-73.89404967817597],[40.68141910186579,-73.93077850341797],[40.718379593199494,-73.9324951171875],[40.7219442986328,-73.89353614069353],[40.73412061435749,-73.8936996459961]]
    ];

    function polygonCallback(path) {
        path = path.map(function(c) {
            return [c.lat(), c.lng()];
        });
        console.log('path', JSON.stringify(path));
        createPolygon();
    }

    function markerPlacedCallback() {
        console.log('[markerPlacedCallback]');
    }

    function createPolygon(path) {
        var gMapPolygon = new GMapPolygon({
            map: map,
            polygonCallback: polygonCallback,
            markerPlacedCallback: markerPlacedCallback,
            styles: {
                line: { strokeColor: '#f91560', strokeOpacity: 1, strokeWeight: 2},
                point: { strokeColor: '#f91560', strokeOpacity: 1, strokeWeight: 3, fillColor: '#FFB347', fillOpacity: 1, scale: 8 },
                handleLine: { strokeColor: '#FFB347',strokeOpacity: 1,strokeWeight: 2 },
                polygonHighlight: { strokeColor: '#f91560', strokeOpacity: 1, strokeWeight: 2, fillColor: '#f91560', fillOpacity: 0.2 },
                polygonMask: { strokeWeight: 0, fillColor: '#f91560', fillOpacity: 0.2 },
                handle: { strokeColor: '#FFB347', strokeOpacity: 1, strokeWeight: 3, fillColor: '#F4C5CE', fillOpacity: 1, scale: 6 }
            }
        });
        polygons.push(gMapPolygon);
        gMapPolygon.init(path);
    }

    function reset() {
        polygons.forEach(p => p.destroy());
        polygons = [];
        createPolygon();
    }

    document.querySelector('#button-clear').onclick = reset;

    shapes.forEach(function (shape) {
        var coords = shape.map(function (coord) {
            return new google.maps.LatLng(coord[0], coord[1]);
        });
        createPolygon(coords);
    });
}