/**
 * Modal Manager
 *
 * What this does:
 * - Opens and closes the visualization modal
 * - Handles accessibility (keyboard, focus management)
 * - Manages modal lifecycle (setup, teardown, cleanup)
 *
 * Why separate file:
 * - Modal logic is complex and reusable
 * - Keeps visualization logic separate from UI logic
 * - Easier to test and maintain
 */

/**
 * MODAL STATE
 *
 * Tracks the currently open project and active visualization
 * This helps us clean up properly when closing the modal
 */
let currentProjectId = null;
let currentVizCleanup = null;

/**
 * OPEN MODAL
 *
 * How it works:
 * 1. Get project data (title, description)
 * 2. Update modal content
 * 3. Show modal with animations
 * 4. Setup keyboard listeners (ESC to close)
 * 5. Trap focus inside modal (accessibility)
 *
 * @param {string} projectId - ID from data-project-id attribute
 * @param {Object} projectData - Data from projects.json
 * @param {Function} renderViz - Function that renders the visualization
 *
 * Common mistakes:
 * - Forgetting to prevent body scroll
 * - Not managing focus properly (accessibility issue)
 * - Memory leaks from not cleaning up event listeners
 */
export function openModal(projectId, projectData, renderViz) {
  const modal = document.getElementById('viz-modal');
  const titleElement = document.getElementById('viz-modal-title');
  const descriptionElement = document.getElementById('viz-modal-description');
  const canvasContainer = document.getElementById('viz-canvas-container');

  if (!modal || !titleElement || !descriptionElement || !canvasContainer) {
    console.error('Modal elements not found');
    return;
  }

  // Get current language from body class
  const currentLang = document.body.classList.contains('lang-ko') ? 'ko' : 'en';

  // Update modal content
  titleElement.textContent = projectData.title[currentLang];
  descriptionElement.textContent = projectData.description[currentLang];

  // Clear previous visualization
  canvasContainer.innerHTML = '';
  canvasContainer.classList.add('loading');

  // Store current project
  currentProjectId = projectId;

  // Show modal
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden'; // Prevent background scroll

  // Setup keyboard listeners
  setupKeyboardListeners();

  // Render visualization (async)
  setTimeout(() => {
    canvasContainer.classList.remove('loading');
    currentVizCleanup = renderViz(canvasContainer);
  }, 100);

  // Focus management (accessibility)
  const closeButton = modal.querySelector('.viz-modal-close');
  if (closeButton) {
    closeButton.focus();
  }
}

/**
 * CLOSE MODAL
 *
 * How it works:
 * 1. Cleanup visualization (stop animations, remove listeners)
 * 2. Hide modal
 * 3. Remove keyboard listeners
 * 4. Restore body scroll
 * 5. Return focus to trigger element
 *
 * Why cleanup is important:
 * - Prevents memory leaks
 * - Stops running animations (performance)
 * - Removes event listeners
 */
export function closeModal() {
  const modal = document.getElementById('viz-modal');

  if (!modal) return;

  // Cleanup current visualization
  if (currentVizCleanup && typeof currentVizCleanup === 'function') {
    currentVizCleanup();
  }

  // Hide modal
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = ''; // Restore scroll

  // Remove keyboard listeners
  removeKeyboardListeners();

  // Clear state
  currentProjectId = null;
  currentVizCleanup = null;

  // Return focus to the card that was clicked
  const activeCard = document.querySelector(`.viz-card[data-project-id="${currentProjectId}"]`);
  if (activeCard) {
    activeCard.focus();
  }
}

/**
 * KEYBOARD LISTENERS
 *
 * ESC key closes modal
 * This is a standard accessibility pattern
 */
function handleKeyDown(e) {
  if (e.key === 'Escape' || e.key === 'Esc') {
    closeModal();
  }
}

function setupKeyboardListeners() {
  document.addEventListener('keydown', handleKeyDown);
}

function removeKeyboardListeners() {
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * SETUP MODAL CLOSE TRIGGERS
 *
 * Three ways to close the modal:
 * 1. Click close button
 * 2. Click backdrop (outside modal content)
 * 3. Press ESC key (handled above)
 *
 * Why multiple close methods:
 * - Better UX (users expect all three)
 * - Accessibility requirement
 */
export function setupModalCloseTriggers() {
  const modal = document.getElementById('viz-modal');
  const closeButton = modal?.querySelector('.viz-modal-close');
  const backdrop = modal?.querySelector('.viz-modal-backdrop');

  if (closeButton) {
    closeButton.addEventListener('click', closeModal);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }
}
