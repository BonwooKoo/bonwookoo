# Data Directory

## GeoJSON Option (Alternative to Mapbox Tileset)

If you prefer to use GeoJSON instead of Mapbox tilesets, place your converted file here:

```
assets/data/seoul-streets.geojson
```

## Convert GPKG to GeoJSON

Using GDAL/ogr2ogr:
```bash
ogr2ogr -f GeoJSON seoul-streets.geojson your-file.gpkg
```

Using QGIS:
1. Open your GPKG in QGIS
2. Right-click layer → Export → Save Features As...
3. Format: GeoJSON
4. CRS: EPSG:4326 (WGS84)
5. Save to this directory

## Update map.js

After placing GeoJSON here, update `assets/js/dashboard/map.js`:

```javascript
// Replace the tileset source with:
map.addSource('seoul-streets', {
  type: 'geojson',
  data: 'assets/data/seoul-streets.geojson'
});

// Remove 'source-layer' from addLayer() calls
```

## Note

GeoJSON is simpler but slower for large datasets.
Mapbox tilesets are recommended for production use.
