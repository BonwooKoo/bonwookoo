/**
 * Visualization System - Main Entry Point
 *
 * What this does:
 * - Initializes the visualization system
 * - Sets up click/keyboard handlers on viz cards
 * - Coordinates modal, registry, and visualizations
 *
 * Architecture:
 * ┌─────────────┐
 * │  index.js   │  ← You are here (coordinator)
 * └──────┬──────┘
 *        │
 *   ┌────┴────┬────────────┬──────────┐
 *   │         │            │          │
 * modal.js  registry.js  projects.json  charts/*.js
 * (UI)      (routing)    (data)         (viz code)
 *
 * Flow:
 * 1. User clicks image → index.js handles click
 * 2. Fetch project data from projects.json
 * 3. Get viz module from registry
 * 4. Open modal (modal.js)
 * 5. Render visualization (charts/*.js)
 */

import { openModal, closeModal, setupModalCloseTriggers } from './modal.js';
import { getVisualization } from './registry.js';

/**
 * PROJECT DATA CACHE
 *
 * Why cache:
 * - Avoid fetching projects.json multiple times
 * - Faster subsequent modal opens
 * - Reduces network requests
 */
let projectsData = null;

/**
 * LOAD PROJECT DATA
 *
 * How it works:
 * 1. Check if already loaded (cached)
 * 2. If not, fetch projects.json
 * 3. Parse JSON
 * 4. Store in cache
 * 5. Return data
 *
 * Why async:
 * - fetch() is asynchronous (network request)
 * - We need to wait for response
 *
 * Common mistakes:
 * - Not handling fetch errors
 * - Wrong JSON path
 * - Forgetting to await
 */
async function loadProjectsData() {
  if (projectsData) {
    return projectsData; // Return cached data
  }

  try {
    const response = await fetch('assets/js/viz/data/projects.json');

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    projectsData = await response.json();
    return projectsData;
  } catch (error) {
    console.error('Failed to load projects data:', error);
    return {};
  }
}

/**
 * HANDLE VIZ CARD CLICK
 *
 * What happens when user clicks an image:
 * 1. Get project ID from data attribute
 * 2. Load project data (title, description)
 * 3. Get visualization render function
 * 4. Open modal with all the above
 *
 * Why async:
 * - Need to fetch project data
 * - Need to load viz module
 * - Both are async operations
 *
 * @param {Event} event - Click or keyboard event
 */
async function handleVizCardClick(event) {
  const card = event.currentTarget;
  const projectId = card.getAttribute('data-project-id');

  if (!projectId) {
    console.error('No project ID found on card');
    return;
  }

  // Load project metadata
  const projects = await loadProjectsData();
  const projectData = projects[projectId];

  if (!projectData) {
    console.error(`No project data found for ID: ${projectId}`);
    return;
  }

  // Get visualization render function
  const renderViz = await getVisualization(projectId);

  // Open modal
  openModal(projectId, projectData, renderViz);
}

/**
 * HANDLE KEYBOARD INTERACTION
 *
 * Accessibility requirement:
 * - Images have tabindex="0" (keyboard focusable)
 * - Enter or Space key should trigger click
 *
 * Why this matters:
 * - Screen reader users
 * - Keyboard-only navigation
 * - WCAG compliance
 */
function handleVizCardKeydown(event) {
  // Enter or Space key
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    handleVizCardClick(event);
  }
}

/**
 * SETUP VIZ CARDS
 *
 * What this does:
 * - Find all images with .viz-card class
 * - Add click listeners
 * - Add keyboard listeners
 *
 * Why we use event listeners instead of onclick:
 * - Can add multiple listeners
 * - Better memory management
 * - Modern best practice
 */
function setupVizCards() {
  const vizCards = document.querySelectorAll('.viz-card');

  vizCards.forEach(card => {
    // Click handler
    card.addEventListener('click', handleVizCardClick);

    // Keyboard handler
    card.addEventListener('keydown', handleVizCardKeydown);

    // Visual feedback: add cursor pointer (already in CSS, but good practice)
    card.style.cursor = 'pointer';
  });

  console.log(`Initialized ${vizCards.length} visualization cards`);
}

/**
 * INITIALIZATION
 *
 * What happens on page load:
 * 1. Wait for DOM to be ready
 * 2. Setup modal close triggers (X button, backdrop, ESC)
 * 3. Setup viz card click/keyboard handlers
 *
 * Why DOMContentLoaded:
 * - Ensures all HTML elements exist before we try to access them
 * - Faster than window.onload (doesn't wait for images)
 *
 * Common mistake: Trying to access elements before DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing visualization system...');

  // Setup modal close functionality
  setupModalCloseTriggers();

  // Setup clickable viz cards
  setupVizCards();

  console.log('Visualization system ready!');
});
