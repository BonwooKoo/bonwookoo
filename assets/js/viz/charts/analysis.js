/**
 * Walkability Analysis Visualization
 *
 * What this does:
 * - Shows animated bar chart of walkability metrics
 * - Demonstrates how different urban design factors affect walkability
 * - Interactive data visualization
 *
 * Walkability factors (examples):
 * - Sidewalk width
 * - Street trees
 * - Building variety
 * - Pedestrian crossings
 * - Street furniture
 */

/**
 * RENDER WALKABILITY ANALYSIS
 *
 * This creates an animated bar chart showing various walkability scores
 * In a real project, this data would come from actual analysis
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @returns {Function} Cleanup function
 */
export default function renderWalkabilityAnalysis(container) {
  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const width = container.clientWidth || 800;
  const height = 500;
  canvas.width = width;
  canvas.height = height;

  container.appendChild(canvas);

  // Walkability metrics data
  const metrics = [
    { label: 'Sidewalk Quality', score: 0, target: 85, color: 'rgba(100, 181, 246, 0.8)' },
    { label: 'Street Greenery', score: 0, target: 72, color: 'rgba(129, 199, 132, 0.8)' },
    { label: 'Safety Features', score: 0, target: 90, color: 'rgba(255, 183, 77, 0.8)' },
    { label: 'Accessibility', score: 0, target: 68, color: 'rgba(240, 98, 146, 0.8)' },
    { label: 'Street Connectivity', score: 0, target: 78, color: 'rgba(186, 104, 200, 0.8)' }
  ];

  // Animation state
  let animationFrameId = null;
  let progress = 0;

  /**
   * ANIMATION LOOP
   *
   * How bar chart animation works:
   * 1. Gradually increase bar heights from 0 to target values
   * 2. Use easing function for smooth motion
   * 3. Stop when all bars reach their targets
   */
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update progress (0 to 1)
    progress = Math.min(progress + 0.02, 1);

    // Easing function (ease-out cubic for smooth deceleration)
    const eased = 1 - Math.pow(1 - progress, 3);

    // Update metric scores
    metrics.forEach(metric => {
      metric.score = metric.target * eased;
    });

    // Draw chart
    drawBarChart(ctx, metrics, width, height);

    // Continue animating if not complete
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    }
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
 * DRAW BAR CHART
 *
 * What this does:
 * - Draws labeled bars showing walkability scores
 * - Includes grid lines and labels
 * - Shows percentage values
 *
 * Chart anatomy:
 * - Y-axis: Walkability metrics (categories)
 * - X-axis: Score (0-100)
 * - Bars: Colored rectangles showing scores
 */
function drawBarChart(ctx, metrics, width, height) {
  // Chart dimensions
  const padding = { top: 40, right: 60, bottom: 40, left: 180 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const barHeight = chartHeight / metrics.length;

  // Draw title
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Walkability Assessment Scores', width / 2, 25);

  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const x = padding.left + (chartWidth / 5) * i;
    ctx.beginPath();
    ctx.moveTo(x, padding.top);
    ctx.lineTo(x, height - padding.bottom);
    ctx.stroke();

    // Draw scale labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${i * 20}`, x, height - padding.bottom + 20);
  }

  // Draw bars and labels
  metrics.forEach((metric, index) => {
    const y = padding.top + index * barHeight;
    const barWidth = (metric.score / 100) * chartWidth;

    // Draw metric label (left side)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = '13px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(metric.label, padding.left - 15, y + barHeight / 2 + 5);

    // Draw bar
    ctx.fillStyle = metric.color;
    ctx.fillRect(
      padding.left,
      y + barHeight * 0.2,
      barWidth,
      barHeight * 0.6
    );

    // Draw bar border
    ctx.strokeStyle = metric.color.replace('0.8', '1');
    ctx.lineWidth = 2;
    ctx.strokeRect(
      padding.left,
      y + barHeight * 0.2,
      barWidth,
      barHeight * 0.6
    );

    // Draw score value (right of bar)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = 'bold 13px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(
      `${Math.round(metric.score)}`,
      padding.left + barWidth + 10,
      y + barHeight / 2 + 5
    );
  });

  // Draw X-axis label
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '12px -apple-system, BlinkMacSystemFont, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Score (0-100)', width / 2, height - 10);
}
