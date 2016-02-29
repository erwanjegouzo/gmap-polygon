window.initMap = function () {

    var mapContainer = document.createElement('div');
    mapContainer.id = 'map';
    document.body.appendChild(mapContainer);

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
            var gMapPolygon = new GMapPolygon({});
            expect(console.error).toHaveBeenCalled();
        });
    });

};