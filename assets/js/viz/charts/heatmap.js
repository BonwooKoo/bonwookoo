/**
 * Environmental Equity Heatmap Visualization
 *
 * What this does:
 * - Shows spatial distribution of urban amenities
 * - Visualizes equity/disparity patterns
 * - Uses color gradient to show intensity
 *
 * Why heatmaps:
 * - Great for showing spatial patterns
 * - Easy to spot disparities visually
 * - Common in environmental justice research
 */

/**
 * RENDER EQUITY HEATMAP
 *
 * Creates an animated grid-based heatmap showing distribution patterns
 * In a real project, this would use actual geographic data
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @returns {Function} Cleanup function
 */
export default function renderEquityHeatmap(container) {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const width = container.clientWidth || 800;
  const height = 500;
  canvas.width = width;
  canvas.height = height;

  container.appendChild(canvas);

  // Grid configuration
  const gridSize = 20; // Size of each cell
  const cols = Math.floor(width / gridSize);
  const rows = Math.floor(height / gridSize);

  // Generate initial heatmap data
  const heatmapData = generateHeatmapData(cols, rows);

  // Animation state
  let animationFrameId = null;
  let time = 0;

  /**
   * ANIMATION LOOP
   *
   * How heatmap animation works:
   * 1. Update cell intensities over time
   * 2. Apply color gradient based on value
   * 3. Create pulsing/flowing effect
   */
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update time
    time += 0.03;

    // Draw heatmap
    drawHeatmap(ctx, heatmapData, gridSize, time);

    // Draw legend
    drawLegend(ctx, width, height);

    // Continue animation
    animationFrameId = requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  /**
   * CLEANUP FUNCTION
   */
  return function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    container.innerHTML = '';
  };
}

/**
 * GENERATE HEATMAP DATA
 *
 * Creates a 2D grid of values representing amenity access
 * Higher values = better access (more equitable)
 * Lower values = worse access (less equitable)
 *
 * How it works:
 * - Use Perlin-like noise pattern for realistic distribution
 * - Create clusters of high/low access
 * - Simulate real urban disparities
 */
function generateHeatmapData(cols, rows) {
  const data = [];

  for (let y = 0; y < rows; y++) {
    const row = [];
    for (let x = 0; x < cols; x++) {
      // Create clusters using sine waves
      const value = (
        Math.sin(x * 0.1) * Math.cos(y * 0.1) * 0.5 +
        Math.sin(x * 0.05 + y * 0.05) * 0.3 +
        Math.random() * 0.2
      );

      // Normalize to 0-1 range
      row.push((value + 1) / 2);
    }
    data.push(row);
  }

  return data;
}

/**
 * DRAW HEATMAP
 *
 * What this does:
 * - Draws each grid cell with color based on value
 * - Animates intensity over time
 * - Uses color gradient (blue = low, green = medium, yellow = high)
 *
 * Color scheme:
 * - Cool colors (blue): Low access (inequitable)
 * - Warm colors (yellow/orange): High access (equitable)
 */
function drawHeatmap(ctx, data, gridSize, time) {
  const rows = data.length;
  const cols = data[0].length;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Get base value
      let value = data[y][x];

      // Add subtle animation (pulsing)
      const animation = Math.sin(time + (x + y) * 0.1) * 0.1;
      value = Math.max(0, Math.min(1, value + animation));

      // Get color based on value
      const color = getHeatmapColor(value);

      // Draw cell
      ctx.fillStyle = color;
      ctx.fillRect(x * gridSize, y * gridSize, gridSize - 1, gridSize - 1);
    }
  }
}

/**
 * GET HEATMAP COLOR
 *
 * Converts a value (0-1) to a color
 * Uses gradient from blue (low) → green (mid) → yellow (high)
 *
 * Why this gradient:
 * - Intuitive (cool = bad, warm = good)
 * - Colorblind-friendly
 * - Common in environmental visualizations
 *
 * @param {number} value - Value between 0 and 1
 * @returns {string} RGB color string
 */
function getHeatmapColor(value) {
  let r, g, b;

  if (value < 0.5) {
    // Blue to green (0 to 0.5)
    const t = value * 2; // 0 to 1
    r = Math.floor(50 * (1 - t) + 100 * t);
    g = Math.floor(100 * (1 - t) + 180 * t);
    b = Math.floor(200 * (1 - t) + 130 * t);
  } else {
    // Green to yellow (0.5 to 1)
    const t = (value - 0.5) * 2; // 0 to 1
    r = Math.floor(100 * (1 - t) + 255 * t);
    g = Math.floor(180 * (1 - t) + 220 * t);
    b = Math.floor(130 * (1 - t) + 100 * t);
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * DRAW LEGEND
 *
 * Shows what colors mean
 * Helps users interpret the heatmap
 *
 * Legend design:
 * - Horizontal gradient bar
 * - Labels at ends
 * - Shows color scale
 */
function drawLegend(ctx, width, height) {
  const legendWidth = 200;
  const legendHeight = 20;
  const legendX = width - legendWidth - 30;
  const legendY = height - legendHeight - 30;

  // Draw gradient
  const gradient = ctx.createLinearGradient(legendX, 0, legendX + legendWidth, 0);
  gradient.addColorStop(0, getHeatmapColor(0));
  gradient.addColorStop(0.5, getHeatmapColor(0.5));
  gradient.addColorStop(1, getHeatmapColor(1));

  ctx.fillStyle = gradient;
  ctx.fillRect(legendX, legendY, legendWidth, legendHeight);

  // Draw border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);

  // Draw labels
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '11px -apple-system, BlinkMacSystemFont, Arial, sans-serif';

  ctx.textAlign = 'left';
  ctx.fillText('Low Access', legendX, legendY - 5);

  ctx.textAlign = 'right';
  ctx.fillText('High Access', legendX + legendWidth, legendY - 5);

  // Draw title
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.fillText('Amenity Access Distribution', width / 2, 20);
}
