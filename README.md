
# gmap-polygon
> A lightweight Javascript polygon drawing library for Google Maps V3

## Installation

You can install ESLint using npm:

    npm install gmap-polygon

## Features
- supports drag & drop
- doesn't support IE8
- No dependencies

## Configuration

```
var gMapPolygon = new GMapPolygon({
    map: {}, // google map instance
    polygonCallback: (),
    markerPlacedCallback: (),
    styles: {
        line: {},
        point: {},
        polygonHighlight: {},
        polygonMask: {},
        handle: {}, 
        handleLine: {}
    }
});

```

## Options
### line: [PolyLine Options](https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions)

### point: [MarkerShape Options](https://developers.google.com/maps/documentation/javascript/reference#MarkerShape)
### polygonHighlight: [Polygon Options](https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions)
### polygonMask: Polygon Options
### handle: [PolyLine Options]
### handleLine: [PolyLine Options]


## License

Freely distributable under the terms of the MIT license.
