/**
 * Urban Network Visualization
 *
 * What this does:
 * - Renders an interactive network graph showing urban street connectivity
 * - Animates nodes and edges
 * - Uses Canvas API for performance
 *
 * Concepts explained:
 * - Nodes: Represent intersections or points of interest
 * - Edges: Represent streets connecting nodes
 * - Graph theory: Mathematical way to model urban networks
 *
 * Why Canvas instead of SVG:
 * - Better performance for many elements
 * - Smooth animations
 * - Good for data visualizations
 */

/**
 * RENDER NETWORK VISUALIZATION
 *
 * This is the main function exported from this module
 * It's called by the modal when the visualization should be displayed
 *
 * @param {HTMLElement} container - The DOM element to render into
 * @returns {Function} Cleanup function (stops animation, removes listeners)
 */
export default function renderNetworkVisualization(container) {
  // Create canvas element
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const width = container.clientWidth || 800;
  const height = 500;
  canvas.width = width;
  canvas.height = height;

  // Add canvas to container
  container.appendChild(canvas);

  // Generate network data
  const { nodes, edges } = generateNetworkData(30, width, height);

  // Animation state
  let animationFrameId = null;
  let time = 0;

  /**
   * ANIMATION LOOP
   *
   * How animation works:
   * 1. Clear canvas
   * 2. Update positions (if animating)
   * 3. Draw edges (lines between nodes)
   * 4. Draw nodes (circles)
   * 5. Request next frame
   *
   * requestAnimationFrame:
   * - Browser optimizes animation timing
   * - Pauses when tab not visible (saves battery)
   * - Syncs with monitor refresh rate (smooth)
   */
  function animate() {
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Update animation time
    time += 0.02;

    // Draw edges (connections between nodes)
    drawEdges(ctx, edges, nodes, time);

    // Draw nodes (intersection points)
    drawNodes(ctx, nodes, time);

    // Continue animation
    animationFrameId = requestAnimationFrame(animate);
  }

  // Start animation
  animate();

  /**
   * CLEANUP FUNCTION
   *
   * Why cleanup is important:
   * - Stops animation when modal closes
   * - Prevents memory leaks
   * - Cancels requestAnimationFrame
   *
   * Common mistake: Forgetting to clean up animations
   * causes them to run in background, wasting resources
   */
  return function cleanup() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    container.innerHTML = '';
  };
}

/**
 * GENERATE NETWORK DATA
 *
 * Creates random nodes and connects them with edges
 * In a real project, this would come from actual urban data
 *
 * How it works:
 * 1. Create random node positions
 * 2. Connect nearby nodes with edges
 * 3. Return nodes and edges arrays
 */
function generateNetworkData(nodeCount, width, height) {
  const nodes = [];
  const edges = [];

  // Create nodes at random positions
  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      id: i,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      size: Math.random() * 3 + 2
    });
  }

  // Connect nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Connect if close enough
      if (distance < 150) {
        edges.push({
          source: i,
          target: j,
          distance: distance
        });
      }
    }
  }

  return { nodes, edges };
}

/**
 * DRAW EDGES
 *
 * What this does:
 * - Draws lines connecting nodes
 * - Animates opacity based on time
 * - Varies thickness based on distance
 *
 * Why animated:
 * - Shows network "activity"
 * - More engaging than static
 * - Demonstrates flow through network
 */
function drawEdges(ctx, edges, nodes, time) {
  edges.forEach((edge, index) => {
    const source = nodes[edge.source];
    const target = nodes[edge.target];

    // Animated opacity (pulses)
    const phase = (index * 0.1 + time) % (Math.PI * 2);
    const opacity = 0.1 + Math.sin(phase) * 0.05;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

/**
 * DRAW NODES
 *
 * What this does:
 * - Draws circles for each node
 * - Animates size (pulsing effect)
 * - Adds glow effect
 *
 * Visual design:
 * - White circles with subtle glow
 * - Pulsing animation shows "activity"
 * - Larger nodes are more "important"
 */
function drawNodes(ctx, nodes, time) {
  nodes.forEach((node, index) => {
    // Animated size (subtle pulse)
    const phase = (index * 0.15 + time) % (Math.PI * 2);
    const pulse = Math.sin(phase) * 0.5 + 1;
    const size = node.size * pulse;

    // Draw outer glow
    ctx.beginPath();
    ctx.arc(node.x, node.y, size + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fill();

    // Draw node
    ctx.beginPath();
    ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();

    // Draw bright center
    ctx.beginPath();
    ctx.arc(node.x, node.y, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    ctx.fill();
  });
}
