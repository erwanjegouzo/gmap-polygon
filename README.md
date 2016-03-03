
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

```js
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

gMapPolygon.init(path);

```

## Options


<table class="table table-bordered table-striped">
  <thead>
  <tr>
    <th>Name</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  </thead>
  <tbody>
      <tr>
        <td>line</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions">PolyLine Options</a></td>
        <td><code>null</code></td>
        <td>Style of the polygon segments</td>
      </tr>

      <tr>
        <td>point</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#MarkerShape">MarkerShape Options</a></td>
        <td><code>null</code></td>
        <td>Style of the marker positioned at a vertex. Let the user modify the polygon shape</td>
      </tr>

      <tr>
        <td>polygonHighlight</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions">Polygon Options</a></td>
        <td><code>null</code></td>
        <td>Style of the polygon in edit mode</td>
      </tr>

      <tr>
        <td>polygonMask</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions">Polygon Options</a></td>
        <td><code>null</code></td>
        <td></td>
      </tr>

      <tr>
        <td>handle</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#PolygonOptions">Polygon Options</a></td>
        <td><code>null</code></td>
        <td>Style of the marker created in the middle of a segment. Let the user add vertices to the polygon</td>
      </tr>

      <tr>
        <td>handleLine</td>
        <td><a target="_blank" href="https://developers.google.com/maps/documentation/javascript/reference#PolylineOptions">PolyLine Options</a></td>
        <td><code>null</code></td>
        <td>Style of the line drawn when dragging a handle. Displays the future shape of the polygon</td>
      </tr>
  </tbody>
</table>

## API

#### init(path)
Initializes the instance. Draws a polygon it path is specified.

```js
gmapPolygon.init();

gmapPolygon.init([
    new google.maps.LatLng(40.72, -74.06),
    new google.maps.LatLng(40.66, -74.07),
    new google.maps.LatLng(40.66, -74.06)
]);
```

#### destroy()
Programmatically destroys the instance. Also removes all the google maps events.

```js
gmapPolygon.destroy();
```

## License
Freely distributable under the terms of the MIT license.
