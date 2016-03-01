window.initMap = function () {

    var mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    document.body.appendChild(mapContainer);

    var gMapPolygon;
    
    var map = new google.maps.Map(mapContainer, {
        center: {lat: 40.7, lng: -73.989},
        zoom: 12
    });

    describe("dependencies", function() {
        it("window.google should be defined", function() {
            expect(window.google.maps).toBeDefined();
        });
        it("window.GMapPolygon should be defined", function() {
            expect(window.GMapPolygon).toBeDefined();
        });
    });

    describe("initialization", function() {
        it("instantiation with a map should throw an error", function() {
            spyOn(console, 'error');
            gMapPolygon = new GMapPolygon({});
            expect(console.error).toHaveBeenCalled();
        });

        it("init with path should trigger the edit mode", function() {
            gMapPolygon = new GMapPolygon({
                map: map,
                styles: {
                    line: {}, point: {}, handleLine: {}, polygonHighlight: {}, polygonMask: {}, handle: {}
                }
            }),
                path = [
                    new google.maps.LatLng(40.7,-74.1),
                    new google.maps.LatLng(40.8,-74.2),
                    new google.maps.LatLng(40.9,-74.3)
                ];

            spyOn(gMapPolygon, 'setEditMode').and.callThrough();
            spyOn(google.maps, 'Polygon');
            gMapPolygon.init(path);
            expect(gMapPolygon.setEditMode).toHaveBeenCalled();
            expect(google.maps.Polygon).toHaveBeenCalled();

        });

        it("init without path should not trigger the edit mode", function() {
            gMapPolygon = new GMapPolygon({
                map: map,
                styles: {
                    line: {}, point: {}, handleLine: {}, polygonHighlight: {}, polygonMask: {}, handle: {}
                }
            });

            spyOn(gMapPolygon, 'setEditMode');
            spyOn(gMapPolygon, 'addListener');
            gMapPolygon.init();

            expect(gMapPolygon.setEditMode).not.toHaveBeenCalled();
            expect(gMapPolygon.addListener).toHaveBeenCalled();
        });

        it("map click event callback should be called", function () {
            gMapPolygon = new GMapPolygon({
                map: map,
                styles: {
                    line: {}, point: {}, handleLine: {}, polygonHighlight: {}, polygonMask: {}, handle: {}
                }
            });
            spyOn(gMapPolygon, 'onMapFirstClick');
            spyOn(gMapPolygon, 'onShapeClicked');
            gMapPolygon.init();
            google.maps.event.trigger(map, 'click', {
                latLng: new google.maps.LatLng(0, 0)
            });
            google.maps.event.trigger(map, 'click', {
                latLng: new google.maps.LatLng(0, 0)
            });

            expect(gMapPolygon.onMapFirstClick).toHaveBeenCalledWith(jasmine.any(Object));
            expect(gMapPolygon.onMapFirstClick.calls.count()).toEqual(1);
            expect(gMapPolygon.onShapeClicked).toHaveBeenCalledWith('map', jasmine.any(Object));
            expect(gMapPolygon.onShapeClicked.calls.count()).toEqual(2);
        });
    });
};