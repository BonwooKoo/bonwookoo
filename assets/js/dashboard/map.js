/**
 * Seoul Street Cluster Dashboard
 *
 * This script handles:
 * - Mapbox map initialization
 * - Loading Mapbox tileset (from your GPKG data)
 * - Styling streets by cluster (1-6)
 * - Click interaction to show cluster info
 * - Radar chart display
 *
 * SECURITY SETUP:
 * 1. Copy config.example.js to config.js
 * 2. Add your Mapbox token to config.js (NEVER commit config.js to GitHub!)
 * 3. Upload GPKG to Mapbox Studio and add tileset ID to config.js
 */

// ============================================
// CONFIGURATION - LOADED FROM EXTERNAL FILE
// ============================================

// Load configuration from config.js (not committed to GitHub)
// If config.js doesn't exist, the script will show an error message
mapboxgl.accessToken = typeof MAPBOX_CONFIG !== 'undefined' ? MAPBOX_CONFIG.accessToken : null;
const TILESET_ID = typeof MAPBOX_CONFIG !== 'undefined' ? MAPBOX_CONFIG.tilesetId : null;

// 📊 STEP 3: Cluster radar chart images
// Place your cluster radar chart images in assets/images/clusters/
const CLUSTER_CHARTS = {
  '1': 'assets/images/clusters/cluster1.png',
  '2': 'assets/images/clusters/cluster2.png',
  '3': 'assets/images/clusters/cluster3.png',
  '4': 'assets/images/clusters/cluster4.png',
  '5': 'assets/images/clusters/cluster5.png',
  '6': 'assets/images/clusters/cluster6.png'
};

// 🎨 Cluster colors (matching legend)
const CLUSTER_COLORS = {
  '1': '#FF4444',
  '2': '#FF8C00',
  '3': '#FFD93D',
  '4': '#9B59B6',
  '5': '#E91E63',
  '6': '#00BCD4'
};

// 📛 Cluster names
const CLUSTER_NAMES = {
  en: {
    '1': 'Arterial Roads',
    '2': 'Pedestrian-Friendly Dense Residential Streets',
    '3': 'Mixed-Use Multi-Family Streets (Residential)',
    '4': 'Mixed-Use Multi-Family Streets (Commercial)',
    '5': 'Pedestrian-Friendly Downtown Streets',
    '6': 'Car-Oriented Hangang Riverside Streets'
  },
  ko: {
    '1': '간선도로',
    '2': '보행친화적 고밀 주거 가로',
    '3': '복합용도 다세대 가로 - 주거중심',
    '4': '복합용도 다세대 가로 - 상업중심',
    '5': '보행친화적 도심 가로',
    '6': '자동차 중심 한강변 가로'
  }
};

// 📝 Cluster descriptions (loaded from generated JSON)
let CLUSTER_DESCRIPTIONS = {
  en: {},
  ko: {}
};

// 📊 Seoul statistics (loaded from generated JSON)
let SEOUL_STATS = null;

// Load descriptions from generated cluster_descriptions.json
async function loadClusterDescriptions() {
  try {
    const response = await fetch('assets/data/cluster_descriptions.json');
    const descriptions = await response.json();

    // Convert to the format expected by the UI
    Object.keys(descriptions).forEach(cluster => {
      CLUSTER_DESCRIPTIONS.en[cluster] = descriptions[cluster].en;
      CLUSTER_DESCRIPTIONS.ko[cluster] = descriptions[cluster].ko;
    });
  } catch (error) {
    console.error('Failed to load cluster descriptions:', error);
    // Fallback to default descriptions if loading fails
    CLUSTER_DESCRIPTIONS = {
      en: {
        '1': 'Road-dominant commercial corridors with wide arterial streets.',
        '2': 'Pedestrian-friendly dense residential streets with generous sidewalks.',
        '3': 'Mixed-use multi-family streets with a residential focus.',
        '4': 'Mixed-use multi-family streets with a commercial focus.',
        '5': 'Pedestrian-friendly downtown streets with high foot traffic.',
        '6': 'Car-oriented streets along the Hangang riverside.'
      },
      ko: {
        '1': '도로 중심의 간선도로.',
        '2': '보행친화적 고밀 주거 가로.',
        '3': '복합용도 다세대 가로 - 주거중심.',
        '4': '복합용도 다세대 가로 - 상업중심.',
        '5': '보행친화적 도심 가로.',
        '6': '자동차 중심 한강변 가로.'
      }
    };
  }
}

// Load Seoul statistics
async function loadSeoulStats() {
  try {
    const response = await fetch('assets/data/seoul_stats.json');
    SEOUL_STATS = await response.json();
    renderSeoulOverview();
  } catch (error) {
    console.error('Failed to load Seoul statistics:', error);
  }
}

// Load cluster profiles
async function loadClusterProfiles() {
  try {
    const response = await fetch('assets/data/cluster_profiles.json');
    window.CLUSTER_PROFILES = await response.json();
    console.log('✓ Cluster profiles loaded');
  } catch (error) {
    console.error('Failed to load cluster profiles:', error);
  }
}

// Render Seoul overview in info panel
function renderSeoulOverview(filteredCluster = null) {
  if (!SEOUL_STATS) return;

  // Update title based on filter
  const titleEl = document.getElementById('overview-title');
  if (titleEl) {
    if (filteredCluster) {
      titleEl.innerHTML = `
        <span class="lang-en">${CLUSTER_NAMES.en[filteredCluster]}</span>
        <span class="lang-ko">${CLUSTER_NAMES.ko[filteredCluster]}</span>
      `;
    } else {
      titleEl.innerHTML = `
        <span class="lang-en">Seoul Street Analysis</span>
        <span class="lang-ko">서울 거리 분석</span>
      `;
    }
  }

  // Update cluster summary description
  const summaryEl = document.getElementById('cluster-summary');
  if (summaryEl) {
    if (filteredCluster) {
      const summary = generateClusterSummary(filteredCluster);
      summaryEl.innerHTML = summary;
      summaryEl.style.display = 'block';
      summaryEl.style.setProperty('--cluster-color', CLUSTER_COLORS[filteredCluster]);
    } else {
      summaryEl.style.display = 'none';
    }
  }

  // Cluster distribution bars
  const distributionEl = document.getElementById('cluster-distribution');
  if (distributionEl) {
    let clustersToShow;
    if (filteredCluster) {
      // Show only the filtered cluster
      clustersToShow = [filteredCluster];
    } else {
      // Show all clusters
      clustersToShow = Object.keys(SEOUL_STATS.cluster_distribution).sort();
    }

    const maxPercentage = Math.max(
      ...Object.values(SEOUL_STATS.cluster_distribution).map(d => d.percentage)
    );

    distributionEl.innerHTML = clustersToShow
      .map(cluster => {
        const data = SEOUL_STATS.cluster_distribution[cluster];
        const widthPercent = (data.percentage / maxPercentage) * 100;

        return `
          <div class="cluster-bar-item">
            <div class="cluster-bar-label">
              <span class="cluster-bar-name">
                <span class="cluster-color-dot" style="background: ${CLUSTER_COLORS[cluster]};"></span>
                <span class="lang-en">${CLUSTER_NAMES.en[cluster]}</span>
                <span class="lang-ko">${CLUSTER_NAMES.ko[cluster]}</span>
              </span>
              <span>${data.count.toLocaleString()}</span>
            </div>
            <div class="cluster-bar-bg">
              <div class="cluster-bar-fill" style="width: ${widthPercent}%; background: ${CLUSTER_COLORS[cluster]};">
                <span class="cluster-bar-percent">${data.percentage}%</span>
              </div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  // Average characteristics
  const charsEl = document.getElementById('seoul-characteristics');
  if (charsEl) {
    let chars;
    if (filteredCluster) {
      // Get characteristics for the specific cluster from cluster_profiles.json
      chars = getClusterCharacteristics(filteredCluster);
    } else {
      // Show Seoul average (normalized)
      chars = normalizeCharacteristics(SEOUL_STATS.seoul_average_characteristics);
    }

    const charLabels = {
      building: 'Building',
      sidewalk: 'Sidewalk',
      road: 'Road',
      tree: 'Tree',
      sky: 'Sky',
      person: 'Person'
    };

    charsEl.innerHTML = Object.keys(charLabels)
      .map(key => {
        const value = chars[key];
        const widthPercent = value * 100;

        return `
          <div class="char-bar-item">
            <div class="char-bar-label">${charLabels[key]}</div>
            <div class="char-bar-bg">
              <div class="char-bar-fill" style="width: ${widthPercent}%;"></div>
            </div>
            <div class="char-bar-value">${(value * 100).toFixed(1)}%</div>
          </div>
        `;
      })
      .join('');
  }
}

// Get characteristics for a specific cluster
function getClusterCharacteristics(cluster) {
  // Load from cluster_profiles.json data
  // We need to load this data first
  if (!window.CLUSTER_PROFILES) {
    return normalizeCharacteristics(SEOUL_STATS.seoul_average_characteristics);
  }

  const profile = window.CLUSTER_PROFILES.find(p => p.cluster === cluster);
  if (!profile) {
    return normalizeCharacteristics(SEOUL_STATS.seoul_average_characteristics);
  }

  const raw = {
    building: profile.building,
    sidewalk: profile.sidewalk,
    road: profile.road,
    tree: profile.tree,
    sky: profile.sky,
    person: profile.person
  };

  return normalizeCharacteristics(raw);
}

// Normalize characteristics so they sum to 1 (100%)
function normalizeCharacteristics(chars) {
  const sum = chars.building + chars.sidewalk + chars.road +
              chars.tree + chars.sky + chars.person;

  if (sum === 0) return chars;

  return {
    building: chars.building / sum,
    sidewalk: chars.sidewalk / sum,
    road: chars.road / sum,
    tree: chars.tree / sum,
    sky: chars.sky / sum,
    person: chars.person / sum
  };
}

// Generate cluster summary description
function generateClusterSummary(cluster) {
  if (!SEOUL_STATS || !window.CLUSTER_PROFILES) return '';

  const distribution = SEOUL_STATS.cluster_distribution[cluster];
  const profile = window.CLUSTER_PROFILES.find(p => p.cluster === cluster);
  const description = CLUSTER_DESCRIPTIONS.en[cluster] || '';
  const descriptionKo = CLUSTER_DESCRIPTIONS.ko[cluster] || '';

  if (!distribution || !profile) return '';

  // Find dominant characteristics (top 2)
  const chars = {
    building: profile.building,
    sidewalk: profile.sidewalk,
    road: profile.road,
    tree: profile.tree,
    sky: profile.sky,
    person: profile.person
  };

  const sorted = Object.entries(chars)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);

  const dominant1 = sorted[0][0];
  const dominant2 = sorted[1][0];
  const value1 = (sorted[0][1] * 100).toFixed(0);
  const value2 = (sorted[1][1] * 100).toFixed(0);

  // Korean characteristic names
  const charNamesKo = {
    building: '건물',
    sidewalk: '보도',
    road: '도로',
    tree: '나무',
    sky: '하늘',
    person: '사람'
  };

  return `
    <p class="lang-en">
      <strong>${distribution.percentage}% of Seoul streets 
    </p> </strong> 
    <p class="lang-ko">
      <strong>서울 전체의 ${distribution.percentage}% 에 해당.
    </p> </strong> </br></br>
    <p class="lang-en">
      Characterized by high ${dominant1} and ${dominant2} coverage. ${description}
    </p>
    <p class="lang-ko">
      <strong>주요 특징:</strong> ${charNamesKo[dominant1]}, ${charNamesKo[dominant2]} 부분이 거리 사진에서 높은 비율을 차지합니다. ${descriptionKo}
    </p>
  `;
}

// ============================================
// MAP INITIALIZATION
// ============================================

let map;
let selectedFeature = null;
let activeClusterFilter = null; // Track which cluster is currently filtered

/**
 * Initialize Mapbox map
 *
 * What this does:
 * - Creates map centered on Seoul
 * - Sets dark base style
 * - Waits for map to load, then adds street layer
 */
function initMap() {
  // Check if token is configured
  if (!mapboxgl.accessToken || mapboxgl.accessToken === 'YOUR_MAPBOX_TOKEN') {
    showConfigError();
    return;
  }

  // Check if tileset ID is configured
  if (!TILESET_ID || TILESET_ID === 'YOUR_TILESET_ID') {
    showConfigError('tileset');
    return;
  }

  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
    center: [126.9780, 37.5665], // Seoul center (longitude, latitude)
    zoom: 10, // Zoom out one level to show entire Seoul
    pitch: 0,
    bearing: 0
  });

  // Add navigation controls
  map.addControl(new mapboxgl.NavigationControl(), 'top-right');

  // When map loads, add street layer
  map.on('load', function() {
    addStreetLayer();
    hideLoading();
  });

  // Click handler for streets
  map.on('click', 'street-clusters', handleStreetClick);

  // Click handler for map background (reset filter)
  map.on('click', function(e) {
    // Check if click was on a street feature
    const features = map.queryRenderedFeatures(e.point, {
      layers: ['street-clusters']
    });

    // If no features clicked (i.e., clicked on background), reset filter
    if (features.length === 0 && activeClusterFilter !== null) {
      filterByCluster(null);  // Show all clusters
    }
  });

  // Cursor change on hover
  map.on('mouseenter', 'street-clusters', function() {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', 'street-clusters', function() {
    map.getCanvas().style.cursor = '';
  });
}

/**
 * Add street cluster layer to map
 *
 * How this works:
 * 1. Loads NDJSON data and converts to GeoJSON
 * 2. Creates a line layer
 * 3. Colors lines based on 'cluster' property
 * 4. Uses CLUSTER_COLORS mapping
 */
async function addStreetLayer() {
  try {
    // Option 1: Use NDJSON file directly (if available)
    if (!TILESET_ID || TILESET_ID === 'YOUR_TILESET_ID') {
      console.log('Loading NDJSON data...');
      await loadNDJSON();
    } else {
      // Option 2: Use Mapbox tileset
      console.log('Loading Mapbox tileset...');
      map.addSource('seoul-streets', {
        type: 'vector',
        url: `mapbox://${TILESET_ID}`
      });
    }
  } catch (error) {
    console.error('Error loading street data:', error);
    showDataError();
    return;
  }

  // Add line layer with cluster-based coloring
  const layerConfig = {
    id: 'street-clusters',
    type: 'line',
    source: 'seoul-streets',
    paint: {
      'line-color': [
        'match',
        ['to-string', ['get', 'cluster']], // Convert to string to handle both number and string values
        '1', CLUSTER_COLORS['1'],
        '2', CLUSTER_COLORS['2'],
        '3', CLUSTER_COLORS['3'],
        '4', CLUSTER_COLORS['4'],
        '5', CLUSTER_COLORS['5'],
        '6', CLUSTER_COLORS['6'],
        '#CCCCCC' // Default color if cluster is unknown
      ],
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        10, 1,
        15, 3,
        18, 6
      ],
      'line-opacity': 0.8
    }
  };

  // Add source-layer only if using tileset (not for GeoJSON)
  if (TILESET_ID && TILESET_ID !== 'YOUR_TILESET_ID') {
    layerConfig['source-layer'] = 'seoul_streets';
  }

  map.addLayer(layerConfig);
  console.log('✓ Added street-clusters layer');

  // Add highlight layer (shows when street is selected)
  const highlightConfig = {
    id: 'street-highlight',
    type: 'line',
    source: 'seoul-streets',
    paint: {
      'line-color': '#ffffff',
      'line-width': 4,
      'line-opacity': 0
    },
    filter: ['==', ['id'], '']
  };

  if (TILESET_ID && TILESET_ID !== 'YOUR_TILESET_ID') {
    highlightConfig['source-layer'] = 'seoul_streets';
  }

  map.addLayer(highlightConfig);
  console.log('✓ Added street-highlight layer');
  console.log('✓ Layers ready - filter functionality should work now');
}

/**
 * Load NDJSON data and convert to GeoJSON
 *
 * NDJSON = Newline Delimited JSON (one feature per line)
 * We need to convert it to GeoJSON FeatureCollection for Mapbox
 */
async function loadNDJSON() {
  try {
    const response = await fetch('assets/data/clustered_k6.ndjson');
    const text = await response.text();

    // Convert NDJSON to GeoJSON FeatureCollection
    const lines = text.trim().split('\n');
    const features = lines.map(line => JSON.parse(line));

    const geojson = {
      type: 'FeatureCollection',
      features: features
    };

    console.log(`Loaded ${features.length} street segments`);

    // Add as GeoJSON source
    map.addSource('seoul-streets', {
      type: 'geojson',
      data: geojson
    });

  } catch (error) {
    console.error('Error loading NDJSON:', error);
    throw error;
  }
}

/**
 * Handle street click
 *
 * When user clicks a street:
 * 1. Get cluster value from feature properties
 * 2. Highlight the clicked street
 * 3. Show cluster info panel
 * 4. Display radar chart
 */
function handleStreetClick(e) {
  if (e.features.length === 0) return;

  const feature = e.features[0];
  const cluster = feature.properties.cluster;

  // Highlight clicked street
  highlightStreet(feature);

  // Show cluster info
  showClusterInfo(cluster, feature);
}

/**
 * Highlight selected street
 */
function highlightStreet(feature) {
  selectedFeature = feature;

  // Update highlight layer filter
  map.setFilter('street-highlight', ['==', ['id'], feature.id]);
  map.setPaintProperty('street-highlight', 'line-opacity', 1);
}

/**
 * Show cluster information panel
 *
 * Updates right panel with:
 * - Cluster number
 * - Radar chart
 * - Description
 * - Street name (if available)
 */
function showClusterInfo(cluster, feature) {
  const defaultInfo = document.getElementById('default-info');
  const clusterInfo = document.getElementById('cluster-info');
  const clusterTitle = document.getElementById('cluster-title');
  const radarChart = document.getElementById('radar-chart');
  const description = document.getElementById('cluster-description');
  const streetName = document.getElementById('street-name');

  // Get current language
  const lang = document.body.classList.contains('lang-ko') ? 'ko' : 'en';

  // Hide default, show cluster info
  defaultInfo.style.display = 'none';
  clusterInfo.style.display = 'block';

  // Update content
  clusterTitle.textContent = CLUSTER_NAMES[lang][cluster];
  radarChart.src = CLUSTER_CHARTS[cluster];
  description.textContent = CLUSTER_DESCRIPTIONS[lang][cluster];

  // Street name (if available in your data)
  const name = feature.properties.name || feature.properties.road_name || '-';
  streetName.textContent = name;
}

/**
 * Close info panel
 */
function closeInfoPanel() {
  const defaultInfo = document.getElementById('default-info');
  const clusterInfo = document.getElementById('cluster-info');

  // Show default, hide cluster info
  defaultInfo.style.display = 'block';
  clusterInfo.style.display = 'none';

  // Remove highlight
  map.setPaintProperty('street-highlight', 'line-opacity', 0);
  selectedFeature = null;

  // Restore the overview based on current filter state
  renderSeoulOverview(activeClusterFilter);
}

/**
 * Filter streets by cluster
 *
 * Shows only the selected cluster, hides others
 * Pass null to show all clusters
 */
function filterByCluster(cluster) {
  const layerName = 'street-clusters';

  // Check if layer exists
  if (!map.getLayer(layerName)) {
    console.warn(`Layer ${layerName} not found. Map may still be loading.`);
    return;
  }

  console.log(`Filtering by cluster: ${cluster}`);

  if (cluster === null) {
    // Show all clusters
    map.setPaintProperty(layerName, 'line-opacity', 0.8);
    activeClusterFilter = null;

    // Remove active state from all legend items
    document.querySelectorAll('.legend-item').forEach(item => {
      item.classList.remove('legend-active');
    });

    // Update overview to show all Seoul data
    renderSeoulOverview(null);
  } else {
    // Filter to show only selected cluster
    map.setPaintProperty(layerName, 'line-opacity', [
      'case',
      ['==', ['to-string', ['get', 'cluster']], cluster],
      0.8,  // Show selected cluster
      0.1   // Dim others
    ]);
    activeClusterFilter = cluster;

    // Add active state to selected legend item
    document.querySelectorAll('.legend-item').forEach(item => {
      if (item.getAttribute('data-cluster') === cluster) {
        item.classList.add('legend-active');
      } else {
        item.classList.remove('legend-active');
      }
    });

    // Update overview to show filtered cluster data
    renderSeoulOverview(cluster);
  }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
  const overlay = document.getElementById('loading-overlay');
  overlay.classList.add('hidden');
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
}

/**
 * Show configuration error
 *
 * Displays helpful message when config.js is missing or incomplete
 */
function showConfigError(type = 'token') {
  const overlay = document.getElementById('loading-overlay');
  const spinner = overlay.querySelector('.loading-spinner');
  const text = overlay.querySelector('.loading-text');

  // Hide spinner
  spinner.style.display = 'none';

  // Show error message
  if (type === 'token') {
    text.innerHTML = `
      <strong style="color: #FF6B6B; font-size: 16px;">⚠️ Configuration Missing</strong><br><br>
      <span style="color: rgba(255,255,255,0.8); font-size: 14px;">
        Please set up your Mapbox token:<br><br>
        1. Copy <code>config.example.js</code> to <code>config.js</code><br>
        2. Add your Mapbox token to <code>config.js</code><br>
        3. Refresh the page<br><br>
        <em>See DASHBOARD_QUICK_START.md for details</em>
      </span>
    `;
  } else {
    text.innerHTML = `
      <strong style="color: #FF6B6B; font-size: 16px;">⚠️ Tileset ID Missing</strong><br><br>
      <span style="color: rgba(255,255,255,0.8); font-size: 14px;">
        Please upload your GPKG to Mapbox Studio<br>
        and add the tileset ID to <code>config.js</code><br><br>
        <em>See DASHBOARD_QUICK_START.md for details</em>
      </span>
    `;
  }

  text.style.maxWidth = '500px';
  text.style.textAlign = 'center';
}

/**
 * Show data loading error
 */
function showDataError() {
  const overlay = document.getElementById('loading-overlay');
  const spinner = overlay.querySelector('.loading-spinner');
  const text = overlay.querySelector('.loading-text');

  spinner.style.display = 'none';

  text.innerHTML = `
    <strong style="color: #FF6B6B; font-size: 16px;">⚠️ Data Loading Error</strong><br><br>
    <span style="color: rgba(255,255,255,0.8); font-size: 14px;">
      Failed to load street data.<br><br>
      Please check:<br>
      1. NDJSON file exists at <code>assets/data/clustered_k6.ndjson</code><br>
      2. Or configure Mapbox tileset ID in <code>config.js</code><br><br>
      <em>Check browser console (F12) for details</em>
    </span>
  `;

  text.style.maxWidth = '500px';
  text.style.textAlign = 'center';
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
  // Load cluster descriptions, Seoul statistics, and cluster profiles
  await Promise.all([
    loadClusterDescriptions(),
    loadSeoulStats(),
    loadClusterProfiles()
  ]);

  // Initialize map
  initMap();

  // Close button handler
  const closeBtn = document.getElementById('close-info-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeInfoPanel);
  }

  // Legend item click - filter by cluster
  const legendItems = document.querySelectorAll('.legend-item');
  console.log(`Found ${legendItems.length} legend items`);

  legendItems.forEach(item => {
    item.addEventListener('click', function() {
      const cluster = this.getAttribute('data-cluster');
      console.log(`Legend clicked: Cluster ${cluster}, Current filter: ${activeClusterFilter}`);

      // Toggle filter: if same cluster clicked, show all; otherwise filter
      if (activeClusterFilter === cluster) {
        filterByCluster(null);  // Show all
      } else {
        filterByCluster(cluster);  // Filter to this cluster
      }
    });
  });

  // Map click - reset filter when clicking on map background
  // This will be set up after map loads in initMap()
});

// ============================================
// HELPFUL TIPS FOR SETUP
// ============================================

/**
 * MAPBOX TILESET SETUP GUIDE:
 *
 * 1. Go to Mapbox Studio (https://studio.mapbox.com/)
 *
 * 2. Click "Tilesets" → "New tileset"
 *
 * 3. Upload your GPKG file
 *    - Mapbox will convert it to vector tiles
 *    - Wait for processing (5-10 minutes)
 *
 * 4. After upload, click on your tileset
 *    - Copy the Tileset ID (looks like: username.abc123xyz)
 *    - Paste it in TILESET_ID above
 *
 * 5. Important: Check the source-layer name
 *    - In Mapbox Studio, inspect your tileset
 *    - Find the layer name (usually matches filename)
 *    - Update 'source-layer' in addStreetLayer() if different
 *
 * 6. Verify your GPKG has a 'cluster' field
 *    - Values should be: '1', '2', '3', '4', '5', '6' (as strings)
 *    - If they're numbers, update the 'match' expression
 *
 * ALTERNATIVE: If you don't want to use Mapbox tilesets,
 * you can convert GPKG to GeoJSON and use it directly:
 *
 *   map.addSource('seoul-streets', {
 *     type: 'geojson',
 *     data: 'assets/data/seoul-streets.geojson'
 *   });
 *
 * Note: GeoJSON works for small datasets but may be slow
 * for large street networks. Tilesets are recommended.
 */
