/**
 * Visualization Registry
 *
 * What this does:
 * - Maps project IDs to their visualization modules
 * - Lazy-loads visualization code only when needed
 * - Handles errors gracefully
 *
 * Why lazy loading:
 * - Initial page load is faster (don't load viz code upfront)
 * - Only download code for visualizations user actually views
 * - Better performance on mobile devices
 *
 * How it works:
 * 1. User clicks image with data-project-id="urban-network"
 * 2. getVisualization('urban-network') is called
 * 3. Dynamic import() loads the corresponding chart module
 * 4. Module's render function is returned
 */

/**
 * VISUALIZATION REGISTRY
 *
 * Maps project IDs to their visualization modules
 *
 * Structure:
 * - key: project ID (matches data-project-id attribute)
 * - value: path to visualization module
 *
 * Common mistake: Wrong file paths break imports
 */
const VIZ_MODULES = {
  'urban-network': './charts/network.js',
  'walkability-analysis': './charts/analysis.js',
  'spatial-equity': './charts/heatmap.js'
};

/**
 * GET VISUALIZATION MODULE
 *
 * How dynamic import works:
 * 1. import('./path.js') returns a Promise
 * 2. Promise resolves to module object
 * 3. Module has default export (the render function)
 * 4. We return that function
 *
 * Why async/await:
 * - Makes asynchronous code look synchronous
 * - Easier error handling with try/catch
 * - More readable than .then() chains
 *
 * @param {string} projectId - The project ID
 * @returns {Promise<Function>} The render function
 */
export async function getVisualization(projectId) {
  const modulePath = VIZ_MODULES[projectId];

  if (!modulePath) {
    console.error(`No visualization module found for project: ${projectId}`);
    return createFallbackViz(`Visualization for "${projectId}" not yet implemented.`);
  }

  try {
    // Dynamic import - only loads when called
    const module = await import(modulePath);

    // Module should have default export (render function)
    if (module.default && typeof module.default === 'function') {
      return module.default;
    } else {
      console.error(`Module ${modulePath} does not have a default export`);
      return createFallbackViz('Visualization module error.');
    }
  } catch (error) {
    console.error(`Failed to load visualization module: ${modulePath}`, error);
    return createFallbackViz('Failed to load visualization.');
  }
}

/**
 * FALLBACK VISUALIZATION
 *
 * What this does:
 * - Shows error message when visualization fails to load
 * - Prevents blank modal (better UX)
 *
 * Why we need this:
 * - Network errors (module failed to download)
 * - Module not found (wrong path)
 * - Module has bugs (syntax error, etc.)
 *
 * Returns a render function that displays an error message
 */
function createFallbackViz(message) {
  return function renderFallback(container) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 300px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 14px;
      font-style: italic;
      text-align: center;
      padding: 40px;
    `;
    errorDiv.textContent = message;
    container.appendChild(errorDiv);

    // Return cleanup function (does nothing in this case)
    return () => {
      container.innerHTML = '';
    };
  };
}
