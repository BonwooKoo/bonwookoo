# Seoul Street Cluster Dashboard - Setup Guide

## 🎯 Overview

This dashboard visualizes Seoul's street network grouped into 6 morphological clusters, allowing interactive exploration of urban form patterns.

**User Flow:**
1. Click "landing image 2" on homepage → Navigate to dashboard
2. View Seoul streets colored by cluster (1-6)
3. Click any street → See cluster characteristics via radar chart
4. Explore morphological patterns across the city

---

## 📋 Prerequisites

### What You Need:

1. **GPKG File** - Your Seoul street network data
   - ✅ Format: GeoPackage (`.gpkg`)
   - ✅ Geometry: LineString (WGS84)
   - ✅ Required field: `cluster` (values: '1', '2', '3', '4', '5', '6')
   - ✅ Bounding box: Seoul area

2. **Mapbox Account** (Free tier works)
   - Sign up at: https://www.mapbox.com/
   - Get access token from: https://account.mapbox.com/

3. **Radar Chart Images** - 6 PNG files (one per cluster)
   - Your characteristic visualizations
   - Variables: building, BCR, FAR, lively_idx, safe_img, plant, tree, sky, person, signboard, road, sidewalk, utd

---

## 🚀 Setup Steps

### Step 1: Add Radar Chart Images

Place your 6 cluster radar chart PNG files in:
```
assets/images/clusters/
  ├── cluster1.png
  ├── cluster2.png
  ├── cluster3.png
  ├── cluster4.png
  ├── cluster5.png
  └── cluster6.png
```

**Tips:**
- Use transparent backgrounds (PNG format)
- Recommended size: 400-600px width
- Ensure they match the cluster colors in the legend

---

### Step 2: Get Mapbox Access Token

1. Go to https://account.mapbox.com/
2. Copy your **Default public token**
3. Open `assets/js/dashboard/map.js`
4. Replace line 24:
   ```javascript
   mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // ← Paste your token here
   ```

---

### Step 3: Upload GPKG to Mapbox (Create Tileset)

**Why tilesets?**
- Fast rendering for large datasets
- Automatic optimization by Mapbox
- Works seamlessly with vector tiles

**Upload Process:**

1. **Go to Mapbox Studio**
   - Visit: https://studio.mapbox.com/tilesets/

2. **Click "New tileset"**

3. **Upload your GPKG**
   - Drag and drop your `.gpkg` file
   - Or click "Select a file"

4. **Wait for processing**
   - Usually takes 5-10 minutes
   - Mapbox converts GPKG → Vector tiles

5. **Get Tileset ID**
   - After processing, click on your tileset
   - Copy the **Tileset ID** (format: `username.abc123xyz`)
   - Example: `bonwookoo.seoul-streets-6clusters-xyz789`

6. **Update map.js**
   - Open `assets/js/dashboard/map.js`
   - Replace line 27:
     ```javascript
     const TILESET_ID = 'YOUR_TILESET_ID'; // ← Paste tileset ID here
     ```

7. **Verify source-layer name**
   - In Mapbox Studio, inspect your tileset
   - Find the **layer name** (usually matches your filename)
   - If different from 'seoul-streets', update line 134:
     ```javascript
     'source-layer': 'your-actual-layer-name',
     ```

---

### Step 4: Verify GPKG Structure

Your GPKG must have a `cluster` field. Check the data type:

**If cluster is STRING ('1', '2', etc.):**
✅ Current code works! No changes needed.

**If cluster is NUMBER (1, 2, etc.):**
⚠️ Update the color mapping in `map.js` line 142-160:
```javascript
'line-color': [
  'match',
  ['get', 'cluster'],
  1, CLUSTER_COLORS['1'],  // Remove quotes around numbers
  2, CLUSTER_COLORS['2'],
  3, CLUSTER_COLORS['3'],
  4, CLUSTER_COLORS['4'],
  5, CLUSTER_COLORS['5'],
  6, CLUSTER_COLORS['6'],
  '#CCCCCC'
]
```

---

### Step 5: Test Locally

```bash
cd /Users/haeseungsung/Desktop/vibe/bonwoo/bonwookoo
python3 -m http.server 8000
```

Open: http://localhost:8000

**Testing Checklist:**
- [ ] Homepage loads correctly
- [ ] Click landingimage2 → Opens cluster-dashboard.html
- [ ] Map loads and shows Seoul
- [ ] Streets visible and colored by cluster
- [ ] Click a street → Info panel shows cluster info
- [ ] Radar chart displays correctly
- [ ] Language toggle (KR/EN) works
- [ ] Back button returns to homepage
- [ ] Mobile responsive (test on phone)

---

## 🎨 Customization

### Change Cluster Colors

Edit `map.js` line 36-43:
```javascript
const CLUSTER_COLORS = {
  '1': '#4ECDC4',  // Change to your preferred colors
  '2': '#FF6B6B',
  '3': '#4A90E2',
  '4': '#E94B9E',
  '5': '#A8E063',
  '6': '#FFD93D'
};
```

**Important:** Also update legend colors in `cluster-dashboard.html` line 62-87 to match!

### Update Cluster Descriptions

Edit `map.js` line 46-67:
```javascript
const CLUSTER_DESCRIPTIONS = {
  en: {
    '1': 'Your English description...',
    // ... etc
  },
  ko: {
    '1': 'Your Korean description...',
    // ... etc
  }
};
```

---

## 🔧 Alternative: Use GeoJSON Instead of Tileset

**If you don't want to use Mapbox tilesets:**

1. Convert GPKG to GeoJSON:
   ```bash
   ogr2ogr -f GeoJSON seoul-streets.geojson your-file.gpkg
   ```

2. Place GeoJSON in:
   ```
   assets/data/seoul-streets.geojson
   ```

3. Update `map.js` line 125-130:
   ```javascript
   map.addSource('seoul-streets', {
     type: 'geojson',
     data: 'assets/data/seoul-streets.geojson'
   });
   ```

4. Remove `source-layer` from line 134 (not needed for GeoJSON)

**Limitations:**
- ⚠️ Slower for large datasets (>10MB)
- ⚠️ No automatic optimization
- ✅ Easier setup (no Mapbox Studio upload)

---

## 📊 Data Structure Example

Your GPKG should look like:

| geometry | cluster | name (optional) | other fields... |
|----------|---------|-----------------|-----------------|
| LINESTRING(...) | 1 | "Gangnam-daero" | ... |
| LINESTRING(...) | 3 | "Insadong-gil" | ... |
| LINESTRING(...) | 2 | "Teheran-ro" | ... |

**Required:**
- `geometry`: LineString (WGS84, EPSG:4326)
- `cluster`: '1', '2', '3', '4', '5', or '6'

**Optional but recommended:**
- `name` or `road_name`: Street name (shown in info panel)

---

## 🐛 Troubleshooting

### Map doesn't load
- ✅ Check console (F12) for errors
- ✅ Verify Mapbox token is correct
- ✅ Check network tab - tileset loading?

### Streets don't appear
- ✅ Verify tileset ID is correct
- ✅ Check source-layer name matches your tileset
- ✅ Inspect tileset in Mapbox Studio

### Wrong colors
- ✅ Check if `cluster` field is string or number
- ✅ Update 'match' expression accordingly
- ✅ Verify CLUSTER_COLORS values

### Click doesn't work
- ✅ Check layer ID matches: `street-clusters`
- ✅ Verify features have `cluster` property
- ✅ Check console for JavaScript errors

### Radar chart doesn't show
- ✅ Verify image files exist in `assets/images/clusters/`
- ✅ Check filenames match exactly: `cluster1.png`, etc.
- ✅ Ensure images are accessible (check network tab)

---

## 🌐 Deploy to GitHub Pages

After testing locally, deploy:

```bash
git add .
git commit -m "Add interactive cluster analysis dashboard"
git push origin main
```

Your dashboard will be live at:
```
https://[your-username].github.io/bonwookoo/cluster-dashboard.html
```

---

## 📁 File Structure

```
/
├── cluster-dashboard.html        ← Dashboard page
├── index.html                    ← Updated with link to dashboard
├── assets/
│   ├── css/
│   │   └── dashboard.css         ← Dashboard styles
│   ├── js/
│   │   └── dashboard/
│   │       └── map.js            ← Mapbox logic (EDIT THIS)
│   ├── images/
│   │   └── clusters/
│   │       ├── cluster1.png      ← ADD YOUR CHARTS
│   │       ├── cluster2.png
│   │       ├── cluster3.png
│   │       ├── cluster4.png
│   │       ├── cluster5.png
│   │       └── cluster6.png
│   └── data/ (optional)
│       └── seoul-streets.geojson ← If using GeoJSON
```

---

## 🎓 Understanding the Code

### For Junior Developers:

**How the interaction works:**

1. **Map renders streets**
   ```javascript
   map.addLayer({
     paint: {
       'line-color': [ /* colors based on cluster */ ]
     }
   });
   ```

2. **User clicks street**
   ```javascript
   map.on('click', 'street-clusters', handleStreetClick);
   ```

3. **Get cluster from feature**
   ```javascript
   const cluster = feature.properties.cluster; // '1', '2', etc.
   ```

4. **Show radar chart**
   ```javascript
   radarChart.src = CLUSTER_CHARTS[cluster]; // cluster1.png
   ```

5. **Display description**
   ```javascript
   description.textContent = CLUSTER_DESCRIPTIONS[lang][cluster];
   ```

**Why Mapbox?**
- Vector tiles = fast rendering
- Built-in zoom/pan controls
- Handles large datasets efficiently
- Professional cartography

---

## ✅ Quick Start Checklist

Before going live:

- [ ] Radar charts placed in `assets/images/clusters/`
- [ ] Mapbox token added to `map.js`
- [ ] GPKG uploaded to Mapbox Studio
- [ ] Tileset ID added to `map.js`
- [ ] Source-layer name verified
- [ ] Tested locally (all interactions work)
- [ ] Cluster descriptions updated (if needed)
- [ ] Colors customized (optional)
- [ ] Mobile tested
- [ ] Console has no errors

---

## 🚀 Next Steps

### Enhancements (Optional):

1. **Add filtering**
   - Show only one cluster at a time
   - Toggle clusters on/off via legend

2. **Add statistics**
   - Total streets per cluster
   - Average characteristics
   - Distribution charts

3. **Export features**
   - Download selected streets
   - Export cluster data

4. **Add 3D buildings**
   - Mapbox 3D extrusion
   - Pitch/rotate controls

5. **Time-based analysis**
   - Animate cluster evolution
   - Compare different time periods

---

## 📞 Support

If you encounter issues:

1. Check browser console (F12)
2. Verify Mapbox Studio tileset is processed
3. Test with a small GeoJSON first
4. Check this guide's troubleshooting section

---

## 🎉 Summary

You now have:
- ✅ Interactive cluster dashboard
- ✅ Mapbox-powered visualization
- ✅ Radar chart integration
- ✅ Bilingual support (EN/KO)
- ✅ Mobile responsive design
- ✅ Accessible navigation

**Next:** Upload your radar charts and Mapbox tileset to see your research come to life!
