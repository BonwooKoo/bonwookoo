# Dashboard Quick Start ⚡

## 3-Step Setup

### 1️⃣ Add Radar Charts (1 minute)

Place 6 PNG files in `assets/images/clusters/`:
- cluster1.png
- cluster2.png
- cluster3.png
- cluster4.png
- cluster5.png
- cluster6.png

---

### 2️⃣ Setup Mapbox Token (2 minutes) 🔒

**⚠️ IMPORTANT: Don't commit your token to GitHub!**

```bash
# 1. Create config file from template
cd assets/js/dashboard
cp config.example.js config.js

# 2. Get your token
# Go to: https://account.mapbox.com/
# Copy your "Default public token"

# 3. Edit config.js and paste your token
# Open config.js in your editor and add:
const MAPBOX_CONFIG = {
  accessToken: 'pk.eyJ...YOUR_REAL_TOKEN',  // ← Paste here
  tilesetId: 'YOUR_TILESET_ID'              // ← Add later
};
```

**Why this is safe:**
- ✅ `config.js` is in `.gitignore` (won't be pushed to GitHub)
- ✅ `config.example.js` is committed (template only, no real token)
- ✅ Your token stays on your computer only

---

### 3️⃣ Upload GPKG to Mapbox (10 minutes)

**Option A: Use Mapbox Tileset (Recommended)**

1. Go to: https://studio.mapbox.com/tilesets/
2. Click "New tileset"
3. Upload your `.gpkg` file
4. Wait for processing (5-10 min)
5. Copy Tileset ID (e.g., `username.abc123`)
6. Open `config.js` (NOT map.js!)
7. Update the tilesetId:
   ```javascript
   const MAPBOX_CONFIG = {
     accessToken: 'pk.eyJ...',  // Already added
     tilesetId: 'username.abc123'  // ← Add here
   };
   ```

**Option B: Use GeoJSON (Simpler, slower)**

1. Convert GPKG to GeoJSON:
   ```bash
   ogr2ogr -f GeoJSON assets/data/seoul-streets.geojson your-file.gpkg
   ```

2. Edit `map.js` line 125:
   ```javascript
   map.addSource('seoul-streets', {
     type: 'geojson',
     data: 'assets/data/seoul-streets.geojson'
   });
   ```

3. Remove `'source-layer'` from line 134

---

## Test It! 🧪

```bash
python3 -m http.server 8000
```

Open: http://localhost:8000/cluster-dashboard.html

**Should see:**
✅ Map of Seoul
✅ Streets colored by cluster
✅ Click street → Radar chart appears
✅ Language toggle works

---

## Deploy 🚀

### For GitHub Pages:

**⚠️ Security Note:** You have 2 options:

**Option A: URL-Restricted Token (Recommended)**
```bash
# 1. Create a new token at https://account.mapbox.com/
# 2. Add URL restriction: https://[username].github.io/*
# 3. Add this token to config.js
# 4. Remove config.js from .gitignore
# 5. Commit and push:
git add .
git commit -m "Add cluster dashboard"
git push origin main
```

**Option B: Keep Private**
```bash
# Keep config.js in .gitignore (don't push token)
# Use GitHub Pro to make repository private
# Or deploy elsewhere (Netlify, Vercel, etc.)
```

**See SECURE_SETUP_GUIDE.md for detailed security instructions!**

Done! 🎉

---

## Troubleshooting

**Map blank?**
→ Check console (F12), verify token

**No streets?**
→ Check tileset ID, verify source-layer name

**No radar chart?**
→ Check image filenames match exactly

**Full guide:** See CLUSTER_DASHBOARD_SETUP.md
