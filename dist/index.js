'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

;(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : window.GMapPolygon = factory();
})(undefined, function () {
    'use strict';

    var GMapPolygon = function () {
        function GMapPolygon(options) {
            _classCallCheck(this, GMapPolygon);

            if (!options.map) {
                return console.error('options.map is required');
            }
            this.options = options;

            this.coords = [];
            this.polyline = null;
            this.polygon = null;
            this.handles = null;
            this.handlePolyline = null;
            this.markers = null;
            this.startingPoint = null;
            this.polygonIsComplete = false;
            this.listeners = [];
        }

        _createClass(GMapPolygon, [{
            key: 'init',
            value: function init(path) {
                this.options.map.setOptions({ draggableCursor: 'crosshair' });

                if (path && path.length) {
                    this.coords = path;
                    this.setEditMode();
                } else {
                    this.addListener(this.options.map, 'click', this.onShapeClicked, 'map');
                    this.listeners.push( // add to the list even if listenOnce in case of multiple initializations
                    google.maps.event.addListenerOnce(this.options.map, 'click', this.onMapFirstClick.bind(this)));
                }

                return this;
            }
        }, {
            key: 'addListener',
            value: function addListener(instance, eventType, cb, context) {
                var callback = context !== undefined ? cb.bind(this, context) : cb.bind(this);
                this.listeners.push(google.maps.event.addListener(instance, eventType, callback));
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                // removes all the gmap shapes
                this.destroyShape([this.handlePolyline, this.startingPoint, this.polyline, this.polygon]);
                this.destroyShape(this.markers);
                this.destroyShape(this.handles);
                // remove all the listeners
                this.destroyMapListeners();

                return this;
            }
        }, {
            key: 'destroyShape',
            value: function destroyShape(shapes) {
                if (!Array.isArray(shapes)) {
                    shapes = [shapes];
                }
                shapes.forEach(function (shape) {
                    if (shape) {
                        google.maps.event.clearInstanceListeners(shape);
                        shape.setMap(null);
                        shape = null;
                    }
                });
            }
        }, {
            key: 'destroyMapListeners',
            value: function destroyMapListeners() {
                this.listeners.forEach(function (listener) {
                    return google.maps.event.removeListener(listener);
                });
                this.listeners = [];
            }
        }, {
            key: 'getMarker',
            value: function getMarker(latLng) {
                var iconOptions = extend({
                    path: google.maps.SymbolPath.CIRCLE
                }, this.options.styles.point);

                return new google.maps.Marker({
                    position: latLng,
                    map: this.options.map,
                    icon: iconOptions
                });
            }
        }, {
            key: 'drawStartingPoint',
            value: function drawStartingPoint(latLng) {
                this.startingPoint = this.getMarker(latLng);
                this.addListener(this.startingPoint, 'click', this.onStartingPointClicked);
            }
        }, {
            key: 'drawPolyline',
            value: function drawPolyline(path) {
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

                    this.addListener(this.polyline, 'click', this.onShapeClicked, 'polyline');
                    if (this.startingPoint) {
                        this.startingPoint.setOptions({ zIndex: 200 });
                    }
                } else {
                    this.polyline.setOptions(params);
                }
            }
        }, {
            key: 'drawPolygon',
            value: function drawPolygon() {
                var style = this.polygonIsComplete ? this.options.styles.polygonHighlight : this.options.styles.polygonMask,
                    params = extend({
                    map: this.options.map,
                    path: this.coords
                }, style);

                if (!this.polygon) {
                    // The polygon has not yet been created, so let's do it and bind the events
                    this.polygon = new google.maps.Polygon(params);

                    this.addListener(this.polygon, 'mousemove', this.onMouseMove);
                    this.addListener(this.polygon, 'click', this.onShapeClicked, 'polygon');

                    if (this.startingPoint) {
                        this.startingPoint.setOptions({ zIndex: 200 });
                    }
                } else {
                    this.polygon.setOptions(params);
                }
            }
        }, {
            key: 'updateHandles',
            value: function updateHandles() {
                var coords = this.coords,
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
        }, {
            key: 'drawHandles',
            value: function drawHandles() {
                var self = this,
                    iconOptions = extend({
                    path: google.maps.SymbolPath.CIRCLE
                }, this.options.styles.handle);

                this.handles = this.coords.map(function (c, i) {
                    var marker = new google.maps.Marker({
                        map: self.options.map,
                        icon: iconOptions,
                        draggable: true
                    });

                    self.addListener(marker, 'drag', self.onHandleDragged, i);
                    self.addListener(marker, 'dragend', self.onHandleDragEnded, i);
                    return marker;
                });

                this.updateHandles();
            }
        }, {
            key: 'addCoord',
            value: function addCoord(latLng) {
                this.coords.push(latLng);
                this.drawPolyline();

                if (this.coords.length > 2) {
                    this.drawPolygon();
                }
            }
        }, {
            key: 'insertCoordAt',
            value: function insertCoordAt(index, latLng) {
                this.coords.splice(index, 0, latLng);
            }
        }, {
            key: 'setPolygonComplete',
            value: function setPolygonComplete() {
                this.polygonIsComplete = true;
                // remove the lines & starting point
                this.destroyShape([this.polyline, this.startingPoint]);
                if (this.options.polygonCallback) {
                    this.options.polygonCallback(this.coords);
                }
                this.setEditMode();
            }
        }, {
            key: 'setEditMode',
            value: function setEditMode() {
                this.polygonIsComplete = true;
                this.destroyMapListeners();
                this.destroyShape([this.polygon, this.handlePolyline]);
                this.destroyShape(this.handles);
                this.destroyShape(this.markers);
                // draw the polygon before the markers so that is lays underneath
                this.drawPolygon();
                // kill all the listeners

                var self = this;
                this.markers = this.coords.map(function (c, i) {
                    var marker = self.getMarker(c);
                    marker.setOptions({
                        draggable: true,
                        zIndex: 200
                    });

                    self.addListener(marker, 'drag', self.onMarkerDragged);
                    return marker;
                });

                this.destroyShape(this.polyline);
                this.drawHandles();
            }

            /**
            *  EVENT FLOW
            */

        }, {
            key: 'onMapFirstClick',
            value: function onMapFirstClick(event) {
                this.drawStartingPoint(event.latLng);
                this.addListener(this.options.map, 'mousemove', this.onMouseMove);
                if (this.options.markerPlacedCallback) {
                    this.options.markerPlacedCallback();
                }
            }
        }, {
            key: 'onMarkerDragged',
            value: function onMarkerDragged() {
                this.coords = this.markers.map(function (m) {
                    return m.getPosition();
                });
                this.drawPolygon();
                this.updateHandles();
                // don't forget to fire the polygon callback to notify of the new position
                if (this.options.polygonCallback) {
                    this.options.polygonCallback(this.coords);
                }
            }
        }, {
            key: 'onHandleDragged',
            value: function onHandleDragged(i, event) {
                // draw a line between a & b which
                var n = (i + 1) % this.coords.length,
                    path = [this.coords[i], event.latLng, this.coords[n]],
                    params = extend({
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
        }, {
            key: 'onHandleDragEnded',
            value: function onHandleDragEnded(i, event) {
                this.insertCoordAt(i + 1, event.latLng);
                this.setEditMode();

                // don't forget to fire the polygon callback to notify of the new position
                if (this.options.polygonCallback) {
                    this.options.polygonCallback(this.coords);
                }
            }
        }, {
            key: 'onMouseMove',
            value: function onMouseMove(event) {
                if (this.polygonIsComplete) {
                    return;
                }
                var path = this.coords.slice(0);
                path.push(event.latLng);
                this.drawPolyline(path);
            }
        }, {
            key: 'onShapeClicked',
            value: function onShapeClicked(shape, event) {
                this.addCoord(event.latLng);
            }
        }, {
            key: 'onStartingPointClicked',
            value: function onStartingPointClicked() {
                if (this.coords.length < 3) {
                    return;
                }
                this.setPolygonComplete();
            }
        }]);

        return GMapPolygon;
    }();

    ;

    function extend(out) {
        out = out || {};
        for (var i = 1; i < arguments.length; i++) {
            if (!arguments[i]) {
                continue;
            }
            for (var key in arguments[i]) {
                if (arguments[i].hasOwnProperty(key)) {
                    out[key] = arguments[i][key];
                }
            }
        }
        return out;
    };

    return GMapPolygon;
});