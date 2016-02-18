;(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    global.moment = factory()
}(this, function () { 'use strict';

    class Polygon {
        constructor(options) {
            if (!options.map) {
                return console.error('options.map is required');
            }

            this.options = options;
            return this.destroy().initialize();
        }

        initialize(path) {

            console.log('[GMapPolygon] initialize', path);

            this.options.map.setOptions({ draggableCursor: 'crosshair' });

            if (path && path.length) {
                this.coords = path;
                this.setEditMode();
            } else {
                this.mapListeners['map clicked'] = google.maps.event.addListener(this.options.map, 'click', this.onShapeClicked.bind(this, 'map'));
                this.mapListeners['map click once'] = google.maps.event.addListenerOnce(this.options.map, 'click', this.onMapFirstClick.bind(this));
            }

            return this;
        }

        destroy() {
            console.log('[GMapPolygon] destroy', this.startingPoint);
            this.destroyShapeListeners();

            // removes all the gmap shapes
            this.destroyShape([this.handlePolyline, this.startingPoint, this.polyline, this.polygon]);
            this.destroyShape(this.markers);
            this.destroyShape(this.handles);

            // remove all the listeners
            this.destroyMapListeners();

            // reset the properties
            this.coords = [];

            this.mapListeners = {};
            this.polyline = null;
            this.polygon = null;
            this.handles = null;
            this.handlePolyline = null;
            this.markers = null;
            this.startingPoint = null;
            this.polygonIsComplete = false;

            return this;
        }

        destroyShape(shapes) {
            if (!Array.isArray(shapes)) {
                shapes = [shapes];
            }

            shapes.forEach(function (s) {
                if (s && s.setMap) {
                    s.setMap(null);
                    s = null;
                }
            });
        }

        destroyMapListeners() {
            var listeners = this.mapListeners || {};
            Object.keys(listeners).forEach(key => google.maps.event.removeListener(listeners[key]));
            listeners = null;
        }

        destroyShapeListeners() {
            if (this.polyline) { google.maps.event.clearInstanceListeners(this.polyline); }
            if (this.startingPoint) { google.maps.event.clearInstanceListeners(this.startingPoint); }
            if (this.polygon) { google.maps.event.clearInstanceListeners(this.polygon); }
        }

        getMarker(latLng) {
            var iconOptions = extend({
                path: google.maps.SymbolPath.CIRCLE
            }, this.options.styles.point);

            return new google.maps.Marker({
                position: latLng,
                map: this.options.map,
                icon: iconOptions
            });
        }

        drawStartingPoint(latLng) {
            this.startingPoint = this.getMarker(latLng);
            google.maps.event.addListener(this.startingPoint, 'click', this.onStartingPointClicked.bind(this));
            google.maps.event.addListener(this.startingPoint, 'mousemove', this.onMouseMove.bind(this));
        }

        drawPolyline(path) {
            path = path || this.coords;

            if (!path.length) {
                //not enough coords
                return;
            }

            var params = extend({
                path: path,
                map: this.options.map
            }, this.options.styles.line);

            if (!this.polyline) {
                // The Polyline has not yet been created, so let's do it and bind the events
                this.polyline = new google.maps.Polyline(params);

                this.mapListeners['polyline click'] = google.maps.event.addListener(this.polyline, 'click', this.onShapeClicked.bind(this, 'polyline'));
                if (this.startingPoint) {
                    this.startingPoint.setOptions({zIndex: 200});
                }
            } else {
                this.polyline.setOptions(params);
            }
        }

        drawPolygon() {
            var style = this.polygonIsComplete ? this.options.styles.polygonHighlight : this.options.styles.polygonMask;

            var params = extend({
                map: this.options.map,
                path: this.coords
            }, style);

            if (!this.polygon) {
                // The polygon has not yet been created, so let's do it and bind the events
                this.polygon = new google.maps.Polygon(params);

                this.mapListeners['polygon mousemove'] = google.maps.event.addListener(this.polygon, 'mousemove', this.onMouseMove.bind(this));
                this.mapListeners['polygon click'] = google.maps.event.addListener(this.polygon, 'click', this.onShapeClicked.bind(this, 'polygon'));

                if (this.startingPoint) { 
                    this.startingPoint.setOptions({zIndex: 200});
                }
            } else {
                this.polygon.setOptions(params);
            }
        }

        updateHandles() {
            var self = this,
                coords = this.coords,
                l = coords.length;

            this.handles.forEach(function (handle, i) {
                var nextIndex = (i + 1) % l,
                    distance = google.maps.geometry.spherical.computeDistanceBetween(coords[i], coords[nextIndex]),
                    latLng = distance > 7 ? google.maps.geometry.spherical.interpolate(coords[i], coords[nextIndex], 0.5) : coords[i],
                    zIndex = distance > 7 ? 200 : 0;

                handle.setOptions({
                    position: latLng,
                    zIndex: zIndex
                });
            });
        }

        drawHandles() {
            const coords = this.coords,
                self = this,
                l = coords.length,
                iconOptions = extend({
                    path: google.maps.SymbolPath.CIRCLE
                }, this.options.styles.handle);

            this.handles = coords.map(function (c, i) {
               const marker = new google.maps.Marker({
                    map: self.options.map,
                    icon: iconOptions,
                    draggable: true
                });

                self.mapListeners['handle drag ' + i] = google.maps.event.addListener(marker, 'drag', self.onHandleDragged.bind(self, i));
                self.mapListeners['handle dragend ' + i] = google.maps.event.addListener(marker, 'dragend', self.onHandleDragEnded.bind(self, i));
                return marker;
            });

            this.updateHandles();
        }

        addCoord(latLng) {
            this.coords.push(latLng);
            this.drawPolyline();

            if (this.coords.length > 2) {
                this.drawPolygon();
            }
        }

        insertCoordAt(index, latLng) {
            this.coords.splice(index, 0, latLng);
        }

        setPolygonComplete() {
            this.polygonIsComplete = true;
            this.destroyShapeListeners();
            // remove the lines & starting point
            this.destroyShape([this.polyline, this.startingPoint]);
            if (this.options.polygonCallback) { this.options.polygonCallback(this.getPathLatLng()); }
            this.setEditMode();
        }

        setEditMode() {
            this.polygonIsComplete = true;

            this.destroyShape(this.markers);
            this.destroyShape(this.polygon);
            this.destroyShape(this.handles);
            this.destroyShape(this.handlePolyline);

            // draw the polygon before the markers so that is lays underneath
            this.drawPolygon();

            // kill all the listeners
            this.destroyMapListeners();

            const self = this;
            this.markers = this.coords.map(function (c, i) {
                const marker = self.getMarker(c);
                marker.setOptions({
                    draggable: true,
                    zIndex: 200
                });

                self.mapListeners['marker drag ' + i] = google.maps.event.addListener(marker, 'drag', self.onMarkerDragged.bind(self));
                return marker;
            });

            this.destroyShape(this.polyline);
            this.drawHandles();
        }


        /**
        *  EVENT FLOW
        */
        onMapFirstClick(event) {
            this.drawStartingPoint(event.latLng);
            this.mapListeners['map mousemove'] = google.maps.event.addListener(this.options.map, 'mousemove', this.onMouseMove.bind(this));
            if (this.options.markerPlacedCallback) { this.options.markerPlacedCallback(); }
        }

        onMarkerDragged() {
            this.coords = this.markers.map(m => m.getPosition());
            this.drawPolygon();
            this.updateHandles();
            // don't forget to fire the polygon callback to notify of the new position
            if (this.options.polygonCallback) { this.options.polygonCallback(this.getPathLatLng()); }
        }

        onHandleDragged(i, event) {
            // draw a line between a & b which
            var l = this.coords.length,
                n = (i + 1) % l,
                latLngA = this.coords[i],
                latLngC = this.coords[n],
                path = [latLngA, event.latLng, latLngC];

            var params = extend({
                path: path,
                map: this.options.map
            }, this.options.styles.handleLine);

            if (!this.handlePolyline) {
                // The Polyline has not yet been created, so let's do it and bind the events
                this.handlePolyline = new google.maps.Polyline(params);
            } else {
                this.handlePolyline.setOptions(params);
            }
        }

        onHandleDragEnded(i, event) {
            this.insertCoordAt(i + 1, event.latLng);
            this.setEditMode();

            // don't forget to fire the polygon callback to notify of the new position
            if (this.options.polygonCallback) { this.options.polygonCallback(this.getPathLatLng()); }
        }

        onMouseMove(event) {
            if (this.polygonIsComplete) { return; } //TODO: shouldn't be necessary

            var path = this.coords.slice(0);
            path.push(event.latLng);
            this.drawPolyline(path);
        }

        onShapeClicked(shape, event) {
            this.addCoord(event.latLng);
        }

        onStartingPointClicked() {
            if (this.coords.length < 3) {
                return;
            }
            this.setPolygonComplete();
        }

        getPathLatLng() {
            return this.coords.map( function(c) {
                return {
                    latitude: c.lat(),
                    longitude: c.lng()
                };
            });
        }
    };

    function extend(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) { continue; }
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) { out[key] = arguments[i][key]; }
            }
        }
        return out;
    };

    return Polygon;

}));
